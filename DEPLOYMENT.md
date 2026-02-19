# GitHub Pages Deployment Guide

## Overview
This repository is configured to automatically deploy the Next.js application to GitHub Pages.

## Configuration Changes Made

### 1. Next.js Configuration (`next.config.js`)
Added the following settings for static export:
- `output: 'export'` - Enables static HTML export
- `basePath: '/BlueBush'` - Sets the base path for GitHub Pages (repository name)
- `images.unoptimized: true` - Disables image optimization for static export

### 2. GitHub Actions Workflow (`.github/workflows/deploy.yml`)
Created an automated deployment workflow that:
- Triggers on pushes to the `main` branch
- Can be manually triggered via workflow_dispatch
- Installs dependencies with `npm ci`
- Builds the Next.js site with `npm run build`
- Uploads the `out/` directory as a Pages artifact
- Deploys to GitHub Pages

### 3. Jekyll Configuration (`public/.nojekyll`)
Added `.nojekyll` file to prevent GitHub from processing the site with Jekyll, which would interfere with Next.js's `_next` directory.

## GitHub Pages Settings

To enable deployment, the repository owner needs to configure GitHub Pages settings:

1. Go to **Settings** > **Pages**
2. Under **Source**, select **GitHub Actions**
3. The workflow will automatically deploy on the next push to `main`

## Accessing the Site

Once deployed, the site will be available at:
**https://azzamunza.github.io/BlueBush/**

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (creates ./out directory)
npm run build

# Preview production build locally
npx serve out
```

## Deployment Process

1. Merge changes to the `main` branch
2. GitHub Actions workflow automatically triggers
3. Site is built and deployed to GitHub Pages
4. Changes are live within a few minutes

## Troubleshooting

If the site doesn't load:
- Verify GitHub Pages is configured to use **GitHub Actions** as the source
- Check the **Actions** tab for deployment status
- Ensure the workflow has necessary permissions (configured in the workflow file)
- Verify the repository is public (or GitHub Pro for private repos with Pages)
