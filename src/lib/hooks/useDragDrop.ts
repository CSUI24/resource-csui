"use client";

import { useCallback, useState } from "react";

export function useDragDrop(onFiles: (files: File[]) => void) {
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    if (event.currentTarget === event.target) setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      const files = Array.from(event.dataTransfer.files);
      if (files.length) onFiles(files);
    },
    [onFiles],
  );

  return { isDragging, onDragOver, onDragLeave, onDrop };
}
