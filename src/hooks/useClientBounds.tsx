import { useState, useCallback, useEffect } from "react";

export const useClientBounds = () => {
  const [bound, setBound] = useState({ width: 0, height: 0 });
  const [node, setNode] = useState<HTMLElement | null>(null);
  const ref = useCallback((_node: HTMLElement | null) => {
    if (_node !== null) {
      setBound({
        height: _node.clientHeight,
        width: _node.clientWidth,
      });
    }
    setNode(_node);
  }, []);

  useEffect(() => {
    function handleResize() {
      setBound({
        height: node?.clientHeight ?? 0,
        width: node?.clientWidth ?? 0,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [node]);

  return { bound, ref, node };
};
