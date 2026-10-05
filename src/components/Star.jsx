/* eslint-disable react/prop-types */

// The 8-point star from Islamic geometric patterns (two overlapping
// squares), the same motif as the pattern column in the brand background.
// Used as the question countdown and to frame the final score.
const R = 48;
const r = R * (Math.cos(Math.PI / 4) / Math.cos(Math.PI / 8));

const STAR_POINTS = Array.from({ length: 16 }, (_, i) => {
  const radius = i % 2 === 0 ? R : r;
  const angle = (Math.PI / 8) * i - Math.PI / 2;
  return `${(50 + radius * Math.cos(angle)).toFixed(2)},${(50 + radius * Math.sin(angle)).toFixed(2)}`;
}).join(" ");

export const StarShape = ({ className, children, ...rest }) => (
  <svg viewBox="0 0 100 100" className={className} {...rest}>
    {children}
  </svg>
);

export const STAR = STAR_POINTS;

export default StarShape;
