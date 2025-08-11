import { useEffect, useRef } from "react";

/**
 * Calls onHit when the sentinel becomes visible.
 * Returns a ref to attach to the sentinel element.
 */
export default function useInfiniteScroll(onHit, { disabled = false } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (disabled) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) onHit();
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onHit, disabled]);

  return ref;
}
