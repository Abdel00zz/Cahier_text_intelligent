

import { useState, useEffect, FC, ChangeEvent } from 'react';
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

export const ConfigModal: FC<ConfigModalProps> = ({ isOpen, onClose, config, onConfigChange, onExportPlatform, onOpenImport }) => {
  const [localConfig, setLocalConfig] = useState(config);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
    }
  }, [isOpen, config]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  const inputClasses = "w-full bg-slate-100 border-slate-200 border rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200";
  const labelClasses = "block text-xs font-medium text-slate-600 mb-1.5";
  const sectionClasses = "p-5 bg-slate-50/50 rounded-xl border border-slate-200/80";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-200 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 text-teal-600 flex items-center justify-center rounded-full">
              <i className="fas fa-cogs"></i>
            </div>
            <h2 className="text-lg font-semibold font-slab text-slate-900">Configuration</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-6 space-y-6 flex-grow overflow-y-auto">
          <div className={sectionClasses}>
            <h3 className="text-base font-semibold text-slate-800 mb-4">Informations Générales</h3>
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
                <label htmlFor="defaultTeacherName" className={labelClasses}>Nom de l'enseignant</label>
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
          </div>
          <div className={sectionClasses}>
            <h3 className="text-base font-semibold text-slate-800 mb-4">Options d'Impression</h3>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                name="printShowDescriptions"
                checked={localConfig.printShowDescriptions}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              />
              <span className="text-sm text-slate-700 select-none">Afficher les descriptions à l'impression</span>
            </label>
          </div>
          <div className={sectionClasses}>
            <h3 className="text-base font-semibold text-slate-800 mb-4">Gestion des Données</h3>
            <p className="text-sm text-slate-600 mb-4">
              Sauvegardez ou restaurez l'intégralité de vos données (classes et configuration).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button type="button" onClick={onExportPlatform} variant="secondary" className="h-11">
                <i className="fas fa-file-download mr-2"></i> Exporter
              </Button>
              <Button type="button" onClick={() => { onClose(); onOpenImport(); }} variant="secondary" className="h-11">
                <i className="fas fa-file-upload mr-2"></i> Importer
              </Button>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 flex justify-end gap-3 rounded-b-2xl border-t border-slate-200 flex-shrink-0">
          <Button type="button" onClick={onClose} variant="secondary" className="h-11">Annuler</Button>
          <Button type="button" onClick={handleSave} variant="primary" className="h-11">Enregistrer</Button>
        </div>
      </div>
    </div>
  );
};