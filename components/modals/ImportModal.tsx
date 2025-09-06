

import React, { useState } from 'react';
import { LessonsData } from '../../types';
import { Button } from '../ui/Button';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any, mode: 'replace' | 'append') => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [jsonText, setJsonText] = useState('');
  const [fileName, setFileName] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setJsonText(e.target?.result as string);
      };
      reader.readAsText(file);
      setFileName(file.name);
    }
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const dataToImport = parsed.lessonsData || parsed; // Support both full export and raw array
      
      onImport(dataToImport, importMode);
      onClose();
    } catch (error) {
        const message = error instanceof Error ? error.message : "Format JSON invalide.";
        alert(`Erreur d'importation: ${message}`);
    }
  };

  if (!isOpen) return null;
  
  const inputClasses = "w-full bg-slate-100 border-slate-200 border rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-200 flex-shrink-0">
            <h2 className="text-lg font-semibold font-slab text-slate-900">Importer des données JSON</h2>
        </div>
        <div className="p-6 space-y-5 flex-grow overflow-y-auto">
            <div>
                <label htmlFor="json-file-input" className="w-full inline-block text-center px-4 py-8 bg-slate-50 text-slate-600 rounded-xl border-2 border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50/50 hover:text-teal-700 cursor-pointer transition-colors">
                    <i className="fas fa-file-upload text-3xl mb-3"></i>
                    <p className="font-semibold">{fileName || "Cliquer pour choisir un fichier JSON"}</p>
                    <p className="text-xs mt-1">...ou collez le contenu ci-dessous</p>
                </label>
                <input type="file" id="json-file-input" accept=".json" onChange={handleFileChange} className="sr-only" />
            </div>
            <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Ou collez votre JSON ici..."
                className={`${inputClasses} h-40 resize-y`}
            />
            <div className="p-3 bg-slate-100 rounded-lg flex items-center justify-center gap-6">
                <span className="font-medium text-slate-700 text-sm">Mode d'importation :</span>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="importMode" value="replace" checked={importMode === 'replace'} onChange={() => setImportMode('replace')} className="form-radio h-4 w-4 text-teal-600 focus:ring-teal-500"/>
                    <span className="text-sm">Remplacer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="importMode" value="append" checked={importMode === 'append'} onChange={() => setImportMode('append')} className="form-radio h-4 w-4 text-teal-600 focus:ring-teal-500"/>
                    <span className="text-sm">Ajouter à la suite</span>
                </label>
            </div>
        </div>
        <div className="p-4 bg-slate-50 flex justify-end gap-3 rounded-b-2xl border-t border-slate-200 flex-shrink-0">
          <Button type="button" onClick={onClose} variant="secondary">Annuler</Button>
          <Button type="button" onClick={handleImport} variant="primary" disabled={!jsonText}>Importer</Button>
        </div>
      </div>
    </div>
  );
};