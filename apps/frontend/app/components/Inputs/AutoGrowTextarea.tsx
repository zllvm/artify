import { useEffect, useRef } from "react";

type AutoGrowTextAreaProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
};

function AutoGrowTextArea({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  maxLength,
}: AutoGrowTextAreaProps) {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = () => {
    const el = textAreaRef.current;
    if (!el) return;

    const computed = getComputedStyle(el);
    const numericMax = parseFloat(computed.maxHeight);
    const effectiveMax = isNaN(numericMax) ? Infinity : numericMax;

    // Reset to auto so scrollHeight reflects true content height
    el.style.height = "auto";

    const newHeight = Math.min(el.scrollHeight, effectiveMax);
    el.style.height = `${newHeight}px`;

    // Toggle scrollbar based on content vs max height
    el.style.overflowY = el.scrollHeight > effectiveMax ? "auto" : "hidden";
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  // Recalculate when window resizes (for % or vh max-heights)
  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <textarea
      ref={textAreaRef}
      className={`${className || ""}`}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      placeholder={placeholder}
    />
  );
}

export default AutoGrowTextArea;
