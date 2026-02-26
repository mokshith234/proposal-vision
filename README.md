<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d9b49aa6-096c-4ccd-9ab4-8181825bbd1f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel

1. Install Vercel CLI (optional):
   ```powershell
   npm install -g vercel
   vercel login
   ```
2. From the project root, deploy:
   ```powershell
   vercel --prod
   ```
3. In the Vercel dashboard, add Environment Variables (`APP_URL` and `GEMINI_API_KEY`) under Project → Settings → Environment Variables. Use the production URL Vercel provides for `APP_URL`.

Notes:
- This repo includes `vercel.json` so Vercel will run `npm run build` and serve the `dist` folder.
- Do not commit real secret values to the repository; use Vercel's Environment Variables or `/.env.local` locally.
