# Election Process Education

An interactive and easy-to-follow educational assistant that guides users through the various stages, timelines, and requirements of the election process.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

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

## Deployment

This application is deployed using **Google Cloud Platform (GCP)**. Specifically, it is hosted on **Google Cloud Run**, which provides a fully managed environment for containerized applications.

### Deploying to Google Cloud Run

To deploy this application to Google Cloud Run, follow these general steps:

1.  **Build a Container Image:** Build a Docker image for the Next.js application. You can use a `Dockerfile` to define the environment and build steps.
    ```bash
    docker build -t gcr.io/YOUR_PROJECT_ID/election-process-education .
    ```
2.  **Push the Image to Container Registry:** Push the built image to Google Container Registry (GCR) or Artifact Registry.
    ```bash
    docker push gcr.io/YOUR_PROJECT_ID/election-process-education
    ```
3.  **Deploy to Cloud Run:** Deploy the container image to a Cloud Run service.
    ```bash
    gcloud run deploy election-process-education \
      --image gcr.io/YOUR_PROJECT_ID/election-process-education \
      --platform managed \
      --region YOUR_REGION \
      --allow-unauthenticated
    ```

Make sure you have the [Google Cloud CLI (`gcloud`)](https://cloud.google.com/sdk/docs/install) installed and configured with your GCP project. You will also need to enable the Cloud Run API for your project.
