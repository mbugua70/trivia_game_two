/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { STAR } from "./Star";

// The welcome screen's living backdrop: a lattice of 8-point stars that
// constructs itself line by line, radiating from the centre the way a
// geometric pattern is laid out with compass and straightedge - outer star
// first, then the inner one. Once built, single tiles catch a gilt glint at
// a time, like light moving across a mosque screen. On `leaving` the
// lattice un-draws back toward the centre.

const DRAW_STAGGER_MS = 70; // per tile of distance from the centre
const GLINT_EVERY_MS = 600;
const GLINT_HOLD_MS = 1600;

const useViewport = () => {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    let frame;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setSize({ w: window.innerWidth, h: window.innerHeight }));
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return size;
};

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const Lattice = ({ leaving = false }) => {
  const { w, h } = useViewport();
  const [glints, setGlints] = useState(() => new Set());
  const builtAt = useRef(0);

  // Tiles on a square grid centred on the screen. Spacing scales with the
  // screen so a phone and a 1080x1920 kiosk both get a readable lattice.
  const tiles = useMemo(() => {
    const spacing = Math.min(240, Math.max(120, Math.min(w, h) / 4.5));
    const cx = w / 2;
    const cy = h * 0.45;
    const cols = Math.ceil(w / spacing / 2) + 1;
    const rows = Math.ceil(h / spacing / 2) + 1;
    const list = [];
    for (let row = -rows; row <= rows; row += 1) {
      for (let col = -cols; col <= cols; col += 1) {
        const x = cx + col * spacing;
        const y = cy + row * spacing;
        // Matches the CSS mask's ellipse: > 1 is outside the quiet centre.
        const edge = Math.hypot((x - cx) / (w * 0.6), (y - cy) / (h * 0.46));
        list.push({ id: `${row}:${col}`, x, y, size: spacing, ring: Math.hypot(row, col), edge });
      }
    }
    return list;
  }, [w, h]);

  const maxRing = useMemo(() => Math.max(...tiles.map((t) => t.ring)), [tiles]);
  // Glints only where the lattice is fully visible and clear of the text.
  const glintable = useMemo(
    () => tiles.filter((t) => t.edge > 0.75 && t.x > 0 && t.x < w && t.y > 0 && t.y < h),
    [tiles, w, h],
  );

  useEffect(() => {
    builtAt.current = Date.now() + maxRing * DRAW_STAGGER_MS + 1200;
  }, [maxRing]);

  // Idle glints, only once the lattice has finished building.
  useEffect(() => {
    if (leaving || prefersReducedMotion()) return;
    const timers = new Set();
    const interval = setInterval(() => {
      if (Date.now() < builtAt.current) return;
      const tile = glintable[Math.floor(Math.random() * glintable.length)];
      if (!tile) return;
      setGlints((prev) => new Set(prev).add(tile.id));
      const timer = setTimeout(() => {
        setGlints((prev) => {
          const next = new Set(prev);
          next.delete(tile.id);
          return next;
        });
        timers.delete(timer);
      }, GLINT_HOLD_MS);
      timers.add(timer);
    }, GLINT_EVERY_MS);
    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [glintable, leaving]);

  return (
    <svg
      className={`lattice ${leaving ? "is-leaving" : ""}`}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
    >
      {tiles.map((tile) => {
        // Oversized so neighbouring stars overlap at the diagonals and the
        // tiles read as one interlocking pattern, not separate shapes.
        const outer = tile.size * 1.42;
        const inner = tile.size * 0.5;
        const drawDelay = tile.ring * DRAW_STAGGER_MS;
        // Un-draw from the edges inward on exit.
        const leaveDelay = (maxRing - tile.ring) * 25;
        return (
          <g
            key={tile.id}
            className={`lattice__tile ${glints.has(tile.id) ? "is-glint" : ""}`}
            style={{
              "--draw-delay": `${drawDelay}ms`,
              "--leave-delay": `${leaveDelay}ms`,
            }}
          >
            <polygon
              className="lattice__outer"
              points={STAR}
              pathLength="100"
              vectorEffect="non-scaling-stroke"
              transform={`translate(${tile.x - outer / 2} ${tile.y - outer / 2}) scale(${outer / 100})`}
            />
            <polygon
              className="lattice__inner"
              points={STAR}
              pathLength="100"
              vectorEffect="non-scaling-stroke"
              transform={`translate(${tile.x} ${tile.y}) rotate(22.5) translate(${-inner / 2} ${-inner / 2}) scale(${inner / 100})`}
            />
          </g>
        );
      })}
    </svg>
  );
};

export default Lattice;
