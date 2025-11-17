export interface MaskRule {
  reveal?: boolean;
  prefix?: number;
  suffix?: number;
}

export interface MaskOptions {
  rules?: Record<string, MaskRule>;
  message?: string;
}

const defaultRule: Required<MaskRule> = {
  reveal: true,
  prefix: 4,
  suffix: 2,
};

export function maskValue(value: string, rule: Required<MaskRule>): string {
  if (!rule.reveal) return "***";
  if (value.length <= rule.prefix + rule.suffix)
    return `${value.slice(0, 1)}***`;
  return `${value.slice(0, rule.prefix)}***${value.slice(-rule.suffix)}`;
}

export function sanitize<T extends object>(
  obj: T,
  getRule: (key: string) => Required<MaskRule> | null,
  mask: (value: string, rule: Required<MaskRule>) => string = maskValue,
  visited: WeakSet<object> = new WeakSet(),
  depth = 0,
  maxDepth = 10
): Record<string, unknown> {
  if (visited.has(obj)) return {};
  if (depth > maxDepth) return { _truncated: true };
  visited.add(obj);

  const clone: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const rule = getRule(key);

    if (value && typeof value === "object" && !Array.isArray(value)) {
      clone[key] = sanitize(
        value as Record<string, unknown>,
        getRule,
        mask,
        visited,
        depth + 1,
        maxDepth
      );
    } else if (typeof value === "string" && rule) {
      clone[key] = mask(value, rule);
    } else {
      clone[key] = value;
    }
  }

  return clone;
}

export function createGetMaskRule(
  rules: Record<string, MaskRule>
): (key: string) => Required<MaskRule> | null {
  return (key: string) => {
    const entry = Object.entries(rules).find(([pattern]) =>
      key.toLowerCase().includes(pattern.toLowerCase())
    );
    if (!entry) return null;
    const [, rule] = entry;
    return { ...defaultRule, ...rule };
  };
}

export function sanitizeData<T extends object>(
  data: T,
  options?: MaskOptions
): Record<string, unknown> {
  const rules = options?.rules ?? {};
  const getRule = createGetMaskRule(rules);
  return sanitize(data, getRule);
}
