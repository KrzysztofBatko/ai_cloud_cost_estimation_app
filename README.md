This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First install dependence

```bash
npm install
```

And run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Application Flow

There are two ways to reach an estimate:

1. Without description
   The user goes directly to `/estimation`, selects providers, fills in usage questions, adds notes, and clicks Get Estimates.

2. With description
   The user goes to `/description`, writes a text description or uploads a document. That is sent to POST /api/description, where AI converts it into structured prefill data. The app stores that in DescriptionProvider, then redirects to /estimation, where the form is pre-filled.

Both paths join at the estimation page.

## Example of description

We run a SaaS web application with ~15k monthly active users. The frontend is built with Next.js and served via a CDN for fast global delivery. The backend consists of a Node.js API (Express) deployed on a managed Kubernetes cluster (3–5 services), handling authentication, business logic, and integrations.

We use PostgreSQL (~30GB) as the primary database and Redis for caching and session management. User-uploaded files (images and documents, ~500GB) are stored in object storage (e.g., AWS S3). The system is deployed primarily in EU regions with a staging environment mirroring production.

Traffic is moderate with peak usage during business hours. We use CI/CD pipelines for automated deployments, and monitoring/logging is handled via tools like Datadog and Sentry.
