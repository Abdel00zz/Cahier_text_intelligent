/**
 * Configuration des optimisations globales du projet
 */

// Configuration pour le code splitting automatique
export const OPTIMIZATION_CONFIG = {
  // Lazy loading des composants lourds
  LAZY_COMPONENTS: [
    'PrintView',
    'GuideModal',
    'ImportModal',
    'SmartDatePicker'
  ],
  
  // Cache des données fréquemment utilisées
  CACHE_SIZE: 100,
  
  // Debounce pour les sauvegardes
  SAVE_DEBOUNCE_MS: 1500,
  
  // Throttle pour les recherches
  SEARCH_THROTTLE_MS: 300,
  
  // Optimisation du localStorage
  STORAGE_BATCH_SIZE: 10,
  
  // Préchargement des polices
  PRELOAD_FONTS: [
    'Lateef',
    'Playfair Display'
  ]
};

// Configuration de performance pour React
export const REACT_PERFORMANCE = {
  // Utiliser React.memo pour les composants statiques
  MEMO_COMPONENTS: [
    'ClassCard',
    'TableRow',
    'SeparatorRow',
    'ContentRenderer'
  ],
  
  // Utiliser useCallback pour les handlers stables
  STABLE_CALLBACKS: [
    'onCellUpdate',
    'onDeleteItem',
    'onSelectRow'
  ],
  
  // Utiliser useMemo pour les calculs coûteux
  MEMO_CALCULATIONS: [
    'filteredData',
    'flattenedData',
    'searchResults'
  ]
};

// Configuration de bundling optimisé
export const BUNDLE_OPTIMIZATION = {
  // Chunks manuels pour un meilleur cache
  MANUAL_CHUNKS: {
    vendor: ['react', 'react-dom'],
    math: ['better-react-mathjax'],
    utils: ['immer'],
    ui: ['./components/ui/']
  },
  
  // Préchargement des modules critiques
  PRELOAD_MODULES: [
    './components/Editor',
    './components/Dashboard',
    './utils/dataUtils'
  ]
};
