import { useRef } from "react";

import type { TextareaHTMLAttributes } from "react";

function convertToPx(value: string, el: HTMLTextAreaElement): number {
  if (value.endsWith("px")) return parseFloat(value);
  if (value.endsWith("rem")) {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return parseFloat(value) * rem;
  }
  if (value.endsWith("em")) {
    const em = parseFloat(getComputedStyle(el).fontSize);
    return parseFloat(value) * em;
  }
  if (value.endsWith("vh")) {
    return (window.innerHeight * parseFloat(value)) / 100;
  }
  return parseFloat(value);
}

function getResolvedMaxHeightPx(
  el: HTMLTextAreaElement,
  maxHeight: number | string | undefined,
  defaultPx: number = 192
): number {
  if (maxHeight !== undefined) {
    if (typeof maxHeight === "number") return maxHeight;
    if (typeof maxHeight === "string") return convertToPx(maxHeight, el);
  }
  // Only use CSS if maxHeight prop is not provided
  const computedMaxHeight = getComputedStyle(el).maxHeight;
  if (computedMaxHeight && computedMaxHeight !== "none") {
    return convertToPx(computedMaxHeight, el);
  }
  return defaultPx;
}

export default function AutoGrowTextarea({
  maxHeight = 192,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { maxHeight?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const el = ref.current;
    if (el) {
      // Reset height to auto to get correct scrollHeight for growing
      el.style.height = "auto";
      const maxHeightPx = getResolvedMaxHeightPx(el, maxHeight);
      const minHeightPx = convertToPx(
        el.style.minHeight || window.getComputedStyle(el).minHeight || "0px",
        el
      );
      el.style.height =
        Math.max(minHeightPx, Math.min(el.scrollHeight, maxHeightPx)) + "px";
    }
    props.onInput?.(e);
    props.onChange?.(e);
  }

  return (
    <textarea
      ref={ref}
      spellCheck={false}
      className="input"
      {...props}
      onInput={handleInput}
    />
  );
}
