import { Capacitor } from '@capacitor/core';
import { WebviewPrint } from 'capacitor-webview-print';

// Vérifier que le plugin est disponible
console.log('Capacitor Platform:', Capacitor.getPlatform());
console.log('WebviewPrint Plugin:', WebviewPrint);

/**
 * Fonction utilitaire pour l'impression qui fonctionne sur toutes les plateformes
 * Utilise le plugin capacitor-webview-print sur Android
 * Utilise window.print() sur le web
 */
export const printDocument = async (fileName: string = 'cahier-de-textes'): Promise<void> => {
  try {
    // Vérifier si on est sur Android
    const platform = Capacitor.getPlatform();
    console.log('Plateforme détectée:', platform);
    
    if (platform === 'android') {
      console.log('Tentative d\'impression sur Android avec WebviewPrint...');
      // Vérifier que le plugin est bien défini
      if (!WebviewPrint || !WebviewPrint.print) {
        throw new Error('Le plugin WebviewPrint n\'est pas correctement initialisé');
      }
      
      // Utiliser le plugin capacitor-webview-print
      const result = await WebviewPrint.print({ name: fileName });
      console.log('Résultat de l\'impression:', result);
    } else {
      console.log('Utilisation de window.print() sur le web');
      // Sur le web, utiliser window.print()
      window.print();
    }
    console.log('Impression terminée avec succès');
  } catch (error) {
    console.error('Erreur détaillée lors de l\'impression:', error);
    // Afficher plus de détails sur l'erreur
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
    
    // Essayer window.print() comme fallback en cas d'erreur sur Android
    if (Capacitor.getPlatform() === 'android') {
      console.log('Tentative de fallback vers window.print() sur Android...');
      try {
        window.print();
        console.log('Fallback window.print() exécuté');
      } catch (fallbackError) {
        console.error('Échec du fallback window.print():', fallbackError);
      }
    }
  }
};