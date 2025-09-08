export type DescriptionMode = 'all' | 'none' | 'custom';

export const shouldShowDescription = (
  rawType: string | undefined,
  mode: DescriptionMode = 'all',
  selectedTypes: string[] = []
): boolean => {
  if (!rawType) return mode === 'all' ? true : false;
  const type = String(rawType).toLowerCase();
  if (mode === 'all') return true;
  if (mode === 'none') return false;
  // custom
  return selectedTypes.map(t => String(t).toLowerCase()).includes(type);
};
