# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An AI-powered e-commerce product creation tool that generates marketing content, enhances product images, and publishes to platforms like Shopify. Built with React, TypeScript, Vite, and Google's Gemini AI models.

## Development Commands

### Prerequisites
- **Node.js v18 or higher** (required)

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run preview      # Preview production build
```

### Environment Setup
- Create `.env.local` file in project root
- Set `GEMINI_API_KEY` to your Google Gemini API key from https://aistudio.google.com/app/apikey
- API key is injected at build time via Vite's `define` config (see vite.config.ts)

## Architecture

### Application Structure

**Single-Page React App** - All functionality is in `App.tsx` which orchestrates the workflow through state management and callbacks passed to child components.

**Two-Panel Layout:**
- `LeftPanel.tsx` - Product import, image/video/audio galleries, variant configuration
- `RightPanel.tsx` - SEO content generation and publishing controls

**Modal System** - Specialized modals for AI operations:
- `EnhanceImageModal` - Background replacement with aspect ratio preservation
- `MontageModal` - Multi-image composition
- `GenerateVideoModal` - Image-to-video generation
- `GenerateMusicModal` - Audio generation
- `ImageSelectionModal` - Batch image import from scraping

### Service Layer Pattern

All external API interactions are isolated in `/services`:

- `geminiService.ts` - SEO content generation with platform-specific prompts (Shopify/Etsy/Instagram/TikTok)
- `imageService.ts` - Image enhancement, montage creation, color changing via Gemini 2.5 Flash Image model
- `videoService.ts` - Video generation from images
- `musicService.ts` - Audio generation
- `scrapingService.ts` - Product data extraction from URLs or HTML files via proxy
- `shopifyService.ts` - Complete Shopify publishing workflow (staged uploads → product creation)
- `exportService.ts` - CSV export functionality
- `imageDownloadService.ts` - Batch image download helper

### Serverless API Routes

The `/api` directory contains Vercel Edge/Serverless Functions:

- `api/proxy.ts` - **CORS proxy for image fetching**. Bypasses browser CORS restrictions when scraping product images from external sites. Adds proper headers (User-Agent, Referer) to mimic browser requests.

- `api/shopify.ts` - **Shopify GraphQL proxy**. Server-side wrapper for Shopify Admin API (version 2024-04) to avoid exposing access tokens in browser. Handles mutations for staged uploads and product creation.

Both are deployed as serverless functions and called from client-side services.

### State Management

No external state library - uses React's `useState` and prop drilling pattern:
- Main state in `App.tsx`: `productData`, `seoContent`, `toastInfo`, loading states, modal states
- Data flows down via props, updates flow up via callbacks (`onProductDataChange`, `onVariantChange`, `showToast`)
- `productData` schema in `types.ts` includes images, videos, audio, variants, pricing, Shopify credentials

### Type System

`types.ts` defines all core interfaces:
- `ImageFile` - Base64-encoded images with metadata (id, name, mimeType, selected state)
- `VideoFile` - URL-based videos with source image reference
- `AudioFile` - Base64 PCM audio data with sample rate info
- `ProductData` - Complete product state including media arrays and variants
- `SEOContent` - Generated title (with emoji), HTML description, tags array
- `FinishGroup` / `FinishOption` - Variant configuration system
- `ExportData` - Combines ProductData + SEOContent for exports

### Constants Configuration

`constants.ts` contains:
- `PLATFORMS` - Target platform options (Shopify, Etsy, Instagram, TikTok)
- `TONES` - Content tone options (Professional, Luxury, Casual, Persuasive, Witty)
- `BACKGROUND_PRESETS` - 32 preset background prompts across 8 categories:
  - Studio variations (white, gray, black, gradient)
  - Twinkly lights variations (warm, cool, window)
  - Nature settings (forest, beach, garden, desert)
  - Urban environments (cafe, bookshelf, marble, workspace)
  - Seasonal themes (winter, autumn, spring, summer)
  - Aesthetic styles (boho, industrial, pastel, neon)
  - Event themes (birthday, wedding, holiday, festive)
  - Product-specific (tech, food, beauty, sports)
- `initialVariantOptions` - Default variant configuration with 4 finish groups

## AI Integration Notes

### Gemini Model Usage

**Text Generation:** `gemini-2.5-flash`
- SEO content generation with structured JSON output (responseSchema)
- Platform-specific system instructions for Shopify vs social media
- Temperature set to 0.5 for consistent quality
- Handles image input for visual context (with AVIF/WebP → JPEG conversion)

**Image Generation:** `gemini-2.5-flash-image`
- Background replacement with strict aspect ratio preservation
- Product integrity rules - never alter the product itself
- Multi-image montage composition
- Color change operations
- All operations include AVIF/WebP format conversion before API calls

**Video Generation:** `veo-3.1-fast-generate-preview`
- Converts static images to videos with text prompts
- Long-running operation with polling (10s intervals)
- Supports 720p/1080p resolution, 16:9/9:16 aspect ratios
- Returns MP4 URLs from Gemini API
- Can take several minutes, requires status polling
- Specific error handling for "entity not found" (API key issues)

**Audio Generation:** `gemini-2.5-flash-preview-tts`
- Generates instrumental background music based on genre/mood/duration
- Returns raw PCM audio data (24kHz, mono channel)
- No vocals or speech - instrumental only

### Image Format Handling

**Critical:** Gemini models don't support AVIF or WebP formats directly.

The codebase implements automatic conversion to JPEG:
- `convertImageToJPEG` helper in `imageService.ts`
- Canvas-based conversion using Image element
- Applied before all Gemini API calls in `geminiService.ts` and `imageService.ts`
- Fallback behavior: skip image if conversion fails (prevents complete failure)

### API Key Management

Development:
- `.env.local` file with `GEMINI_API_KEY`
- Injected via Vite's `process.env.GEMINI_API_KEY` and `process.env.API_KEY`
- Both variables point to same key (legacy compatibility)

Production (Vercel):
- Set `GEMINI_API_KEY` environment variable in Vercel dashboard
- Automatically available to serverless functions and client build

## Shopify Publishing Workflow

The publishing process follows this sequence:

1. **Validation** - Check for store name and access token
2. **Image Upload** - Create staged upload targets → Upload images via FormData → Get resource URLs
3. **Video Upload** - Create staged upload targets → Fetch video from Gemini URL → Upload to Shopify → Get resource URLs
4. **Product Creation** - GraphQL mutation with:
   - Modified title: `{seoContent.title} | 3D Printed In Multiple Color Options`
   - HTML description with auto-appended disclaimers about 3D printing texture and accessories
   - Variants array (Finish × Color combinations)
   - Media array (images + videos)
   - Status: `DRAFT`
5. **Return** - Product admin URL for editing

**Important Implementation Details:**
- Store name is sanitized (removes https://, .myshopify.com)
- Uses 30-second timeout on API calls, 60s for GraphQL, 45s for image uploads, 120s for video uploads
- All media uploads go through Shopify's staged upload system
- Videos are fetched from Gemini URLs with API key appended as query param
- Product handle is auto-generated from title (lowercased, dash-separated, max 70 chars)

## Common Patterns

### Toast Notifications

`showToast` callback used throughout for user feedback:
```typescript
showToast('success', 'Message', optionalLink)
showToast('error', 'Error message')
showToast('info', 'Progress update')
```

Toast component (`Toast.tsx`) auto-dismisses after 5s with animated slide-in.

**Critical for Shopify publishing:** The `publishToShopify` service calls `showToast` during each step (preparing uploads, uploading 1/N, creating product). This provides real-time progress updates during the long-running upload process.

### Loading States

Each async operation has dedicated loading state:
- `isFetchingUrl`, `isImportingFromFile` - Product scraping
- `isGeneratingSeo` - Content generation
- `isGeneratingImage`, `isGeneratingVideo`, `isGeneratingMusic` - Media generation
- `isPublishing` - Shopify upload
- `isImportingImages` - Batch import

Loading states disable buttons and show spinners in UI.

### Modal Pattern

Modals follow consistent pattern:
1. State for `isModalOpen` boolean
2. State for input data (e.g., `imageToEdit`, `enhanceImageArgs`)
3. State for preview result (e.g., `generatedImagePreview`)
4. Accept/Discard callbacks that modify main `productData` state
5. Modal component handles its own form state, calls service functions

### Image Selection

Images have `selected: boolean` field. Galleries render checkboxes. Only selected items are:
- Included in exports (CSV, Shopify)
- Available for montage operations
- Downloaded via "Download Selected" feature

## File Organization

```
/api/                  - Serverless functions (proxy, shopify)
/components/           - React components (panels, modals, galleries, inputs)
/services/             - API integration layer
/utils/                - Helper utilities (imageUtils, audioUtils)
App.tsx               - Main app orchestrator
types.ts              - TypeScript interfaces
constants.ts          - Configuration and presets
vite.config.ts        - Build config with API key injection
vercel.json           - Serverless function config (30s timeout)
```

## Key Behaviors

### Product Scraping

**URL Fetching** (`fetchProductFromURL`):
- Uses Gemini 2.5 Flash with **Google Search tool** to access and scrape live URLs
- Temperature 0.1 for consistent extraction
- Extracts: title, description, price (number only), absolute image URLs
- Returns JSON with error object if URL inaccessible
- Price handling: uses lower value if range, 0 if not found

**HTML File Upload** (`extractProductFromHtml`):
- Uses Gemini 2.5 Flash with structured JSON schema (no search tool)
- Temperature 0 for deterministic parsing
- Same extraction logic as URL fetching but for local HTML files

**Both methods:**
- All image URLs converted to base64 via `/api/proxy` endpoint
- Proxy adds User-Agent and Referer headers to mimic browser
- Opens `ImageSelectionModal` if multiple images found
- New images have `selected: true` by default

### SEO Generation
- Platform affects prompt structure (Shopify = structured sections, TikTok = viral hooks, Instagram = story-driven)
- Tone affects language style
- First selected image sent for visual context
- Returns: emoji-prefixed title (<60 chars), HTML description, 5-10 tags
- Shopify descriptions follow specific format: Hook → Benefits → Target Audience → Specs → Tips → CTA → Disclaimers → Hashtags

### Image Enhancement
- Preserves aspect ratio by adding background padding
- CRITICAL RULE: Never alter the product itself, only background
- Custom prompts or preset backgrounds from `BACKGROUND_PRESETS`
- Size options passed to API (e.g., "1:1", "16:9", "4:5")

### Variant System
- Multiple FinishGroups (e.g., "Material", "Size")
- Each group has multiple FinishOptions (e.g., "PLA", "PETG")
- Each option has selected state
- Price modifiers applied on top of basePrice
- Selected combinations generate Cartesian product for Shopify variants

## Deployment

**Vercel (Recommended):**
1. Push to GitHub
2. Import repo in Vercel dashboard
3. Add `GEMINI_API_KEY` environment variable
4. Deploy (auto-detected as Vite project)
5. Serverless functions in `/api` automatically deployed

**Other Platforms:**
- Requires serverless function support for `/api` routes
- Netlify, Cloudflare Pages work with adapter modifications

## TypeScript Configuration

- Module resolution: `bundler`
- Path alias: `@/*` maps to project root
- JSX: `react-jsx` (no React import needed)
- Allows importing `.ts` extensions (Vite handles)
- Experimental decorators enabled
- No emit (Vite handles compilation)

## Important Implementation Notes

### Image URL to Base64 Conversion
The `urlToImageFile` utility in `utils/imageUtils.ts` is critical for product scraping:
1. Routes image fetches through `/api/proxy` to bypass CORS
2. Optionally includes referer header for sites that require it
3. Converts blob to base64 for in-memory storage
4. Extracts filename from URL pathname
5. Auto-generates UUID for each image
6. All new images default to `selected: true`

### Video Generation Workflow
Video generation has special UX considerations:
- Progress callback parameter updates UI during long operations
- Polling happens client-side with 10s intervals
- Error message "Requested entity was not found" indicates API key problems
- Videos are returned as URLs (not base64) due to file size
- When publishing to Shopify, videos are fetched from Gemini URL with `&key=` param

### Variant Cartesian Product
The variant system generates all combinations of selected options:
- User selects multiple options across multiple groups (e.g., 3 finishes × 4 colors = 12 variants)
- Each variant gets: `basePrice + sum(priceModifiers for selected options)`
- Export/publish only includes selected variants
- Shopify expects `options` array matching the order in `productInput.options: ["Finish", "Color"]`

### 3D Printing Business Logic
The codebase is tailored for 3D-printed products:
- Auto-appends disclaimers about texture variations and accessories
- Title modification adds "| 3D Printed In Multiple Color Options"
- Default variant groups assume material finishes (PLA, PETG, etc.)
- SEO prompts emphasize craftsmanship and customization
- Background presets avoid lifestyle scenes that might misrepresent the product

### Error Handling Pattern
Services follow a consistent error handling pattern:
1. Try-catch wraps all async operations
2. Log error with `console.error` for debugging
3. Check if error is `Error` instance, otherwise handle strings/objects
4. Throw new error with context: `throw new Error(\`Gemini API error: ${error.message}\`)`
5. Caller (usually in `App.tsx`) catches and calls `showToast('error', ...)`
6. Video service has special handling for API key errors ("entity not found")
7. Scraping service returns error JSON object instead of throwing for graceful degradation
