import { useEffect, useRef, useState } from "react";

export default function useScrollReveal(threshold = 0.1) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;

      setIsVisible(true);
      observer.disconnect();
    }, { threshold });

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return [elementRef, isVisible];
}
