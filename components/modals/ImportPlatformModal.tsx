

import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface ImportPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (fileContent: string) => void;
}

export const ImportPlatformModal: React.FC<ImportPlatformModalProps> = ({ isOpen, onClose, onImport }) => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target?.result as string);
      };
      reader.readAsText(file);
      setFileName(file.name);
    }
  };

  const handleImport = () => {
    if (fileContent) {
      onImport(fileContent);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl flex flex-col max-h-[86vh] animate-slide-in-up" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="import-platform-title">
        <div className="p-4 border-b border-slate-200 flex-shrink-0">
            <h2 id="import-platform-title" className="text-lg font-semibold font-slab text-slate-900">Importer une Sauvegarde Complète</h2>
        </div>
  <div className="p-5 space-y-4 flex-grow overflow-y-auto">
            <div className="p-4 bg-red-50/80 border-l-4 border-red-500 text-red-900 rounded-md">
                <div className="flex">
                    <div className="py-1"><i className="fas fa-exclamation-triangle mr-4 text-xl text-red-500"></i></div>
                    <div>
                        <p className="font-bold">Attention : Action Irréversible</p>
                        <p className="text-sm mt-1">L'importation d'une sauvegarde remplacera <strong className="uppercase">toutes</strong> les données actuelles de l'application (classes, contenus, configuration). Cette action ne peut pas être annulée.</p>
                    </div>
                </div>
            </div>

            <div>
                 <label htmlFor="platform-json-file-input" className="w-full inline-block text-center px-4 py-8 bg-slate-50 text-slate-600 rounded-xl border-2 border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50/50 hover:text-teal-700 cursor-pointer transition-colors">
                    <i className="fas fa-file-upload text-3xl mb-3"></i>
                    <p className="font-semibold">{fileName || "Cliquer pour choisir un fichier de sauvegarde"}</p>
                    <p className="text-xs mt-1">Fichier .json uniquement</p>
                </label>
                <input type="file" id="platform-json-file-input" accept=".json" onChange={handleFileChange} className="sr-only" />
            </div>

            {fileContent && (
                <div className="mt-4 p-3 rounded-lg bg-slate-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isConfirmed}
                            onChange={(e) => setIsConfirmed(e.target.checked)}
                            className="h-5 w-5 rounded border-slate-400 text-red-600 focus:ring-red-500 focus:ring-offset-2"
                        />
                        <span className="text-sm font-medium text-slate-700 select-none">Je comprends que l'importation écrasera toutes mes données actuelles.</span>
                    </label>
                </div>
            )}
        </div>
  <div className="p-3 bg-slate-50 flex justify-end gap-3 rounded-b-2xl border-t border-slate-200 flex-shrink-0">
          <Button type="button" onClick={onClose} variant="secondary">Annuler</Button>
          <Button type="button" onClick={handleImport} variant="danger" disabled={!fileContent || !isConfirmed}>
            <i className="fas fa-exclamation-triangle mr-2"></i> Importer et Remplacer
          </Button>
        </div>
      </div>
    </div>
  );
};