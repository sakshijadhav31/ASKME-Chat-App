/**
 * @file hooks/useAutoResize.js
 * @description Custom hook to handle textarea auto-resizing based on content.
 */
import { useRef, useLayoutEffect } from "react";

export const useAutoResize = (value, maxHeight = 200) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (node) {
      // Reset height to get correct scrollHeight
      node.style.height = "inherit";
      const scrollHeight = node.scrollHeight;
      
      // Set new height capped at maxHeight
      node.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [value, maxHeight]);

  return ref;
};