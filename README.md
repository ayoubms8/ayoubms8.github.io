# Ayoub Lemsafi — Portfolio & Technical Blog

This repository hosts my personal engineering portfolio and technical blog, deployed on GitHub Pages at [ayoubms8.github.io](https://ayoubms8.github.io).

## Architecture

- **Portfolio (`/`)**: High-performance interactive Single Page Application built with **React 19**, **Vite**, **GSAP**, and modern CSS design tokens.
- **Technical Blog (`/blog`)**: Deep-dive technical articles built with **Jekyll** and the **Chirpy** theme, hosted under `/blog/`.

```
ayoubms8.github.io/
├── src/                  # React portfolio components, hooks, assets & data
├── public/               # Static assets & .nojekyll flag
├── blog/                 # Technical blog (Jekyll + Chirpy theme)
│   ├── _posts/           # Technical write-ups and walkthroughs
│   ├── _config.yml       # Jekyll configuration (baseurl: /blog)
│   └── Gemfile           # Ruby dependencies
├── .github/workflows/    # Unified GitHub Actions deployment workflow
├── package.json          # Vite and React dependencies
└── vite.config.js        # Vite build configuration
```

## Local Development

### 1. Portfolio (React + Vite)
```bash
npm install
npm run dev
```
Open `http://localhost:5173` to view the interactive portfolio.

### 2. Technical Blog (Jekyll)
```bash
cd blog
bundle config set --local path 'vendor/bundle'
bundle install
bundle exec jekyll serve --baseurl "/blog"
```
Open `http://localhost:4000/blog` to view the blog locally.

## Deployment

Every push to `main` triggers `.github/workflows/pages-deploy.yml`:
1. Builds the Vite portfolio to `dist/` (root `/`).
2. Builds the Jekyll blog to `dist/blog/` (subpath `/blog`).
3. Deploys the unified static artifact to GitHub Pages.