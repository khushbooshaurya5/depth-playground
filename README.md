# Depth Playground

Upload a photo → get a **monocular depth map** computed **entirely in your browser**, then explore it as an interactive **3D point cloud**. No server, no API keys — inference runs client-side via transformers.js.

A live, interactive companion to my self-supervised depth project:
👉 https://github.com/khushbooshaurya5/monocular-depth-estimation

## Stack
Vite + React + TypeScript + Tailwind · transformers.js (`Xenova/depth-anything-small-hf`) · three.js

## Run
```bash
npm install
npm run dev
```

## Build / deploy
```bash
npm run build      # static output in dist/
```
Deploy `dist/` to Vercel or Netlify (static site).

> This repo ships an [`AGENTS.md`](AGENTS.md) build brief — open it in an agentic IDE (e.g. Google Antigravity) to scaffold and finish the implementation, or build it by hand from the spec.

## Author
Khushboo Kumari — Machine Learning Engineer · [github.com/khushbooshaurya5](https://github.com/khushbooshaurya5)

MIT License.
