import { useEffect, useState } from "react";

export default function useAnimatedScore(score, duration = 1000) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (score === 0) { setAnimatedScore(0); return; }
    const startTime = performance.now();
    let frame;

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(eased * score);
      if (progress < 1) frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score, duration]);

  return Math.round(animatedScore * 10) / 10;
}
