export function isInteractiveClick(e: React.MouseEvent): boolean {
  return !!(e.target as HTMLElement).closest(
    "a, button, input, textarea, select, [role='button'], [role='link'], .interactive"
  );
}
