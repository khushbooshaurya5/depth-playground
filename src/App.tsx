import { useCallback, useRef, useState } from "react";
import { estimateDepth, renderDepthToCanvas } from "./depth";

type Status = "idle" | "running" | "done" | "error";

export function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [blend, setBlend] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const run = useCallback(async (url: string) => {
    setStatus("running");
    setMessage("Loading model (first run downloads ~50 MB, then cached)…");
    try {
      const res = await estimateDepth(url, (m) => setMessage(m));
      if (canvasRef.current) renderDepthToCanvas(res, canvasRef.current);
      setStatus("done");
      setMessage("");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const onFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      void run(url);
    },
    [run],
  );

  return (
    <div className="wrap">
      <header>
        <h1>Depth Playground</h1>
        <p className="sub">
          Upload a photo → a monocular-depth model runs <b>entirely in your browser</b>.
          No server, no data leaves your device.
        </p>
      </header>

      <div
        className="drop"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
      >
        <label className="btn">
          Choose image
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
        </label>
        <span className="hint">…or drag &amp; drop an image here</span>
      </div>

      {status === "running" && <p className="status">⏳ {message}</p>}
      {status === "error" && <p className="status err">⚠ {message}</p>}

      {imageUrl && (
        <div className="stage">
          <figure>
            <img src={imageUrl} alt="source" />
            <canvas
              ref={canvasRef}
              className="overlay"
              style={{ opacity: blend }}
              aria-label="Predicted depth map"
            />
            <figcaption>original ↔ depth</figcaption>
          </figure>
          <label className="slider">
            depth opacity
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={blend}
              onChange={(e) => setBlend(Number(e.target.value))}
            />
          </label>
        </div>
      )}

      <footer>
        <a href="https://github.com/khushbooshaurya5/monocular-depth-estimation" target="_blank" rel="noreferrer">
          method / code ↗
        </a>
        <span>Khushboo Kumari · Machine Learning Engineer</span>
      </footer>
    </div>
  );
}
