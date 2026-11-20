# WedPlan Client

Frontend web application for WedPlan built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **ShadCN-style components**.

## Repository Link
[https://github.com/Turzo007se/wedplan-client](https://github.com/Turzo007se/wedplan-client)

## Features
- Fully responsive wedding-themed design with smooth Framer Motion animations.
- Dynamic homepage with curated hero banner, featured wedding services, category directory, and testimonials.
- Advanced service exploration with search, category filtering, location filtering, and price sorting.
- Service details dynamic route (`/services/[id]`) with unauthenticated redirect and customer booking form.
- Role-based dashboard (`/dashboard`) for Customer, Vendor, and Admin roles.
- Customer booking request tracking, cancellation, and metrics overview.
- Vendor service authoring (with ImgBB uploads), availability management, and request responses.
- Admin user and service moderation, user blocking/unblocking, and transaction ledger.
- Profile management and Stripe subscription return handlers (`/payment/success` and `/payment/cancel`).

## Setup & Running Locally
```bash
npm install
npm run dev     # Starts development server at http://localhost:3000
npm run build   # Verifies static generation & TypeScript types
npm run start   # Starts production Next.js server
```

## Environment Variables
Configured in `.env.local`:
- `NEXT_PUBLIC_API_URL`: Backend API base URL (`http://localhost:4000`)
- `NEXT_PUBLIC_AUTH_URL`: Better Auth base URL (`http://localhost:4000`)
- `NEXT_PUBLIC_IMGBB_API_KEY`: ImgBB API key for client-side uploads
