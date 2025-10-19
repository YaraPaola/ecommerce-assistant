<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1gYCIDZsc0SmCvlxsoaQ71asVydoeOpuJ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to the Web

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR_USERNAME%2FYOUR_REPONAME&env=GEMINI_API_KEY&envDescription=Your%20Google%20Gemini%20API%20Key&project-name=ai-ecommerce-assistant&repository-name=ai-ecommerce-assistant)

**Important:** Before using the button above, you must push your code to a public GitHub repository and replace `YOUR_USERNAME/YOUR_REPONAME` in the URL with your repository's details.

This project is configured to be deployed to modern hosting platforms like Vercel or Netlify. These platforms will automatically build the Vite frontend and deploy the serverless functions located in the `/api` directory.

### Deploying with Vercel

1.  **Push to GitHub:** Create a new repository on GitHub and push your project code to it.
2.  **Import Project:** Sign up for a Vercel account, and from your dashboard, click "Add New... -> Project". Import your GitHub repository.
3.  **Configure Project:** Vercel should automatically detect that you are using Vite and configure the build settings correctly.
4.  **Add Environment Variables:** In the project settings on Vercel, go to "Environment Variables" and add your `GEMINI_API_KEY`. This is crucial for the AI features to work in production.
5.  **Deploy:** Click the "Deploy" button. Vercel will build and deploy your site.

Once deployed, your application will be available at a public URL, and the API routes (`/api/proxy`, `/api/shopify`, etc.) will work just like they do locally.
