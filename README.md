# WedPlan Client

Responsive Next.js app for the WedPlan wedding services marketplace.

## Local development

1. Install Node.js 20.9 or newer.
2. Copy `.env.example` to `.env.local` and set the API/auth URL.
3. Run `npm ci`, then `npm run dev`.
4. Open `http://localhost:3000`.

For a production build, run `npm run build` and `npm start`.

## Configuration

- `NEXT_PUBLIC_API_URL`: Express API base URL.
- `NEXT_PUBLIC_AUTH_URL`: Better Auth base URL.

Google OAuth and ImgBB credentials stay on the server. Never put secret values in `NEXT_PUBLIC_*` variables. The client calls the Express image upload endpoint for ImgBB uploads.

## Main routes

- `/` home page
- `/services` searchable service listing
- `/services/[id]` service details and booking request
- `/sign-in`, `/sign-up`
- `/dashboard` role-aware customer, vendor, and admin views
- `/payment/success`, `/payment/cancel`

Set the production API URL before deploying. Configure the API CORS origin and Better Auth trusted origin to match the deployed client URL.
