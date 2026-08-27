# Contributing

```sh
bun install
bun run dev
```

Routes are stored in `localStorage`. **Save shared HTML** (or `Ctrl+S`) uses the File System Access API when available and writes the data into a shareable HTML file. Other browsers download the file instead.

## Production

```sh
bun run build
bun run preview
```

Printing produces four routes per A4 page.

## Deployment

Every push to `main` builds and deploys `dist/index.html` to GitHub Pages through `.github/workflows/deploy.yml`. The workflow also publishes an update source to the `app-source` branch, because `raw.githubusercontent.com` permits cross-origin reads from local `file:` installations. The application compares its timestamped version with that source and offers an update while preserving local routes and the title.

## AI disclosure

Most of this code was created with the assistance of AI. I have barely edited the code myself. I remain responsible for the project, but this repository should be treated as AI-assisted code and reviewed accordingly.
