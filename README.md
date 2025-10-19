<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Ecommerce-Assistant

An AI-powered tool to streamline creating and listing products online. It generates high-quality marketing materials, enhances product images, and helps publish to e-commerce platforms like Shopify.

## ✨ Features

- **AI-Powered Content:** Generate compelling product titles, descriptions, and SEO-friendly tags using Google's Gemini model.
- **Product Scraping:** Import product details and images directly from a URL or an HTML file.
- **Image Enhancement:** Use generative AI to place your product in new scenes or create artistic montages.
- **Shopify Integration:** Directly publish your generated product listings to your Shopify store as a draft.
- **Modern UI:** A sleek, responsive interface built with React and Tailwind CSS.

## Run Locally

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **Gemini API Key:** You need an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Setup
1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to the Web

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYaraPaola%2Fecommerce-assistant&env=GEMINI_API_KEY&envDescription=Your%20Google%20Gemini%20API%20Key&project-name=ecommerce-assistant&repository-name=ecommerce-assistant)

**Ready to Deploy!** Click the button above to deploy your project to Vercel.

This project is configured to be deployed to modern hosting platforms like Vercel or Netlify. These platforms will automatically build the Vite frontend and deploy the serverless functions located in the `/api` directory.

### Deploying with Vercel

1.  **Push to GitHub:** Create a new repository on GitHub and push your project code to it.
2.  **Import Project:** Sign up for a Vercel account, and from your dashboard, click "Add New... -> Project". Import your GitHub repository.
3.  **Configure Project:** Vercel should automatically detect that you are using Vite and configure the build settings correctly.
4.  **Add Environment Variables:** In the project settings on Vercel, go to "Environment Variables" and add your `GEMINI_API_KEY`. This is crucial for the AI features to work in production.
5.  **Deploy:** Click the "Deploy" button. Vercel will build and deploy your site.

Once deployed, your application will be available at a public URL, and the API routes (`/api/proxy`, `/api/shopify`, etc.) will work just like they do locally.
