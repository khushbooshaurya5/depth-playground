// Monocular depth estimation in the browser via transformers.js.
// The model + weights are fetched from the Hugging Face CDN on first use and
// then cached by the browser. Everything runs client-side (WebGPU or WASM).
import {
  pipeline,
  env,
  type DepthEstimationPipeline,
} from "@huggingface/transformers";

// Allow remote model download from the HF hub; disable the local-model path.
env.allowLocalModels = false;

let _pipe: Promise<DepthEstimationPipeline> | null = null;

export function getDepthPipeline(
  onProgress?: (msg: string) => void,
): Promise<DepthEstimationPipeline> {
  if (!_pipe) {
    // Cast `pipeline` to a loose signature: its real overloads form a union
    // too large for TS to represent (TS2590).
    const makePipeline = pipeline as unknown as (
      task: string,
      model: string,
      opts: Record<string, unknown>,
    ) => Promise<DepthEstimationPipeline>;
    _pipe = makePipeline("depth-estimation", "Xenova/depth-anything-small-hf", {
      progress_callback: (p: unknown) => {
        const info = p as { status?: string; file?: string; progress?: number };
        if (onProgress && info?.status) {
          const pct =
            typeof info.progress === "number" ? ` ${info.progress.toFixed(0)}%` : "";
          onProgress(`${info.status}${info.file ? " " + info.file : ""}${pct}`);
        }
      },
    });
  }
  return _pipe;
}

export interface DepthResult {
  width: number;
  height: number;
  /** normalized depth in [0,1], row-major, length = width*height */
  data: Float32Array;
}

/** Run depth estimation on an image URL; returns normalized depth. */
export async function estimateDepth(
  imageUrl: string,
  onProgress?: (msg: string) => void,
): Promise<DepthResult> {
  const pipe = await getDepthPipeline(onProgress);
  const out = await pipe(imageUrl);
  const result = Array.isArray(out) ? out[0] : out;
  const depth = result.depth;
  const { width, height } = depth;
  // depth.data is a Uint8Array (0-255) or typed array; normalize to [0,1].
  const raw = depth.data as unknown as ArrayLike<number>;
  const n = width * height;
  const data = new Float32Array(n);
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < n; i++) {
    const v = raw[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = max - min || 1;
  for (let i = 0; i < n; i++) data[i] = (raw[i] - min) / range;
  return { width, height, data };
}

// --- Magma-ish colormap (perceptual, dark->bright) -------------------------
const MAGMA: [number, number, number][] = [
  [0, 0, 4], [40, 11, 84], [101, 21, 110], [159, 42, 99],
  [212, 72, 66], [245, 125, 21], [250, 193, 39], [252, 253, 191],
];

function colormap(t: number): [number, number, number] {
  const x = Math.min(0.9999, Math.max(0, t)) * (MAGMA.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = MAGMA[i];
  const b = MAGMA[i + 1];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
}

/** Paint a normalized depth map onto a canvas with the magma colormap. */
export function renderDepthToCanvas(res: DepthResult, canvas: HTMLCanvasElement): void {
  canvas.width = res.width;
  canvas.height = res.height;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(res.width, res.height);
  for (let i = 0; i < res.data.length; i++) {
    const [r, g, b] = colormap(res.data[i]);
    const j = i * 4;
    img.data[j] = r;
    img.data[j + 1] = g;
    img.data[j + 2] = b;
    img.data[j + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}
