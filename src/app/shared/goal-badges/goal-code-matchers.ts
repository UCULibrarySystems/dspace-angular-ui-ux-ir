export type GoalCodeMatcher = (rawValue: string) => string | null;

function numericPrefixMatcher(labelPrefix?: string): GoalCodeMatcher {
  const prefixPart = labelPrefix ? `(?:${labelPrefix}\\s*)?` : '';
  const expression = new RegExp(`^${prefixPart}0?(\\d{1,2})\\b`, 'i');

  return (raw: string): string | null => {
    const match = raw.trim().match(expression);
    return match ? match[1].padStart(2, '0') : null;
  };
}

/** Match controlled metadata values to the configured goal code for each framework. */
export const GOAL_CODE_MATCHERS: Record<string, GoalCodeMatcher> = {
  sdg: numericPrefixMatcher('SDG'),
  agenda2063: numericPrefixMatcher(),
  ndp: (raw: string): string | null => {
    const match = raw.trim().match(/^([A-Za-z]+\d{2})/);
    return match ? match[1].toUpperCase() : null;
  },
};
