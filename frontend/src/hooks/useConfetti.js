import { useEffect, useRef } from "react";

const COLORS = ["#6c5ce7", "#a29bfe", "#fd79a8", "#00cec9", "#fdcb6e", "#e17055", "#00b894"];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

export default function useConfetti(trigger, { count = 80, spread = 70, duration = 2500 } = {}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: count }, () => ({
      x: window.innerWidth / 2 + randomBetween(-spread, spread),
      y: window.innerHeight / 2 - randomBetween(0, 200),
      vx: randomBetween(-6, 6),
      vy: randomBetween(-12, -2),
      size: randomBetween(6, 12),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: randomBetween(0, 360),
      rotSpeed: randomBetween(-10, 10),
      opacity: 1,
      gravity: 0.25,
      friction: 0.98,
    }));

    let start = performance.now();
    let frame;

    function animate(now) {
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        if (p.opacity <= 0) continue;
        alive = true;
        p.vy += p.gravity;
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.opacity = Math.max(0, 1 - elapsed / duration);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size * 1.2, p.size * 0.6);
        ctx.restore();
      }
      if (alive && elapsed < duration) frame = requestAnimationFrame(animate);
      else { ctx.clearRect(0, 0, canvas.width, canvas.height); }
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [trigger, count, spread, duration]);

  return canvasRef;
}
