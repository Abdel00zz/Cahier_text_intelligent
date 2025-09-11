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
  // custom - vérifier si le type est dans la liste des types sélectionnés
  // Si aucun type n'est sélectionné, on considère que tous les types sont désactivés
  if (selectedTypes.length === 0) return false;
  // Convertir tous les types sélectionnés en minuscules pour une comparaison insensible à la casse
  const lowerCaseSelectedTypes = selectedTypes.map(t => String(t).toLowerCase());
  return lowerCaseSelectedTypes.includes(type);
};
