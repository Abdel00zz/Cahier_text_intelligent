

import React, { useState, useEffect } from 'react';
import { AppConfig } from '../../types';
import { Button } from '../ui/Button';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onConfigChange: (newConfig: Partial<AppConfig>) => void;
  onExportPlatform: () => void;
  onOpenImport: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, config, onConfigChange, onExportPlatform, onOpenImport }) => {
  const [localConfig, setLocalConfig] = useState(config);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
    }
  }, [isOpen, config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLocalConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    onConfigChange(localConfig);
    onClose();
  };

  if (!isOpen) return null;

  const inputClasses = "w-full bg-slate-100 border-slate-200 border rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors";
  const labelClasses = "block text-sm font-medium text-slate-700 mb-2";
  const legendClasses = "text-base font-semibold font-slab text-slate-800 mb-4 pb-2 border-b border-slate-200 w-full";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-lg font-semibold font-slab text-slate-900">Configuration</h2>
        </div>
        <div className="p-6 space-y-8 flex-grow overflow-y-auto">
          <fieldset>
            <legend className={legendClasses}>Informations Générales</legend>
            <div className="space-y-4">
              <div>
                <label htmlFor="establishmentName" className={labelClasses}>Nom de l'établissement</label>
                <input
                  type="text"
                  id="establishmentName"
                  name="establishmentName"
                  value={localConfig.establishmentName}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Ex: Lycée Victor Hugo"
                />
              </div>
              <div>
                <label htmlFor="defaultTeacherName" className={labelClasses}>Nom de l'enseignant par défaut</label>
                <input
                  type="text"
                  id="defaultTeacherName"
                  name="defaultTeacherName"
                  value={localConfig.defaultTeacherName}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Sera utilisé pour les nouvelles classes"
                />
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend className={legendClasses}>Options d'Impression</legend>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                name="printShowDescriptions"
                checked={localConfig.printShowDescriptions}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              />
              <span className="text-sm text-slate-700 select-none">Afficher les descriptions des éléments (définitions, exercices, etc.) à l'impression.</span>
            </label>
          </fieldset>
          <fieldset>
            <legend className={legendClasses}>Gestion des Données</legend>
            <div className="space-y-3 p-1">
              <p className="text-sm text-slate-600">
                Sauvegardez ou restaurez l'intégralité de vos données, y compris toutes les classes et la configuration.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Button type="button" onClick={onExportPlatform} variant="secondary">
                  <i className="fas fa-file-download mr-2"></i> Exporter tout
                </Button>
                <Button type="button" onClick={() => { onClose(); onOpenImport(); }} variant="secondary">
                  <i className="fas fa-file-upload mr-2"></i> Importer une sauvegarde
                </Button>
              </div>
            </div>
          </fieldset>
        </div>
        <div className="p-4 bg-slate-50 flex justify-end gap-3 rounded-b-2xl border-t border-slate-200 flex-shrink-0">
          <Button type="button" onClick={onClose} variant="secondary">Annuler</Button>
          <Button type="button" onClick={handleSave} variant="primary">Enregistrer</Button>
        </div>
      </div>
    </div>
  );
};