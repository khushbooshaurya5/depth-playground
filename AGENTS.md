# AGENTS.md — Depth Playground

**You are an agent (e.g. Google Antigravity) building this app end-to-end. Follow this spec, run it, test in a browser, and deploy. Ask only if truly blocked.**

## Goal
A fully **client-side** web app: the user uploads a photo → a monocular-depth model runs **in the browser** → show a colorized depth map, and let the user pop it into an interactive **3D point cloud**. No backend, no API keys, no server inference. This is a live demo of the author's self-supervised depth work (github.com/khushbooshaurya5/monocular-depth-estimation).

## Stack (use exactly)
- Vite + React + TypeScript + Tailwind CSS.
- In-browser inference with **`@huggingface/transformers`** (transformers.js), model **`Xenova/depth-anything-small-hf`** (falls back to WASM if WebGPU unavailable). Use the `depth-estimation` pipeline.
- **three.js** for the 3D point-cloud view (OrbitControls).
- Deploy as a static site (Vercel or Netlify).

## Features / acceptance criteria
1. **Upload / drag-drop** an image (also provide 2–3 bundled sample images so it works with one click).
2. On run: show a **progress indicator** while the model downloads/warms up (first run caches the model).
3. **Depth output:** render the predicted depth as a colorized image (magma or viridis colormap) beside the original. A slider blends original ↔ depth overlay.
4. **3D view:** a "View in 3D" button builds a three.js point cloud where each pixel is placed at (x, y, z=depth·scale) and colored by the source image; user can orbit/zoom. A depth-scale slider.
5. **Client-side only**, works offline after first load, handles large images by downscaling to a max dimension (e.g. 512) before inference.
6. Responsive, accessible (labels, keyboard, focus states), clean minimal UI. Show a one-line "runs entirely in your browser — no data leaves your device" note.
7. Footer links: "Code / method → github.com/khushbooshaurya5/monocular-depth-estimation" and author "Khushboo Kumari".

## Notes
- Do NOT claim benchmark numbers. This is an interactive demo, not the trained repo model.
- Keep bundle lean; lazy-load the model and three.js.
- Add a short README with run (`npm i && npm run dev`) and deploy steps, and set the page title to "Depth Playground — Khushboo Kumari".

## Definition of done
`npm run build` passes; dev server runs; uploading a sample image produces a depth map and a working 3D cloud in a real browser; deployed URL works on desktop + mobile.
