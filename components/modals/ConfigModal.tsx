

import { useState, useEffect, useRef, FC, ChangeEvent } from 'react';
import { AppConfig } from '../../types';
import { Button } from '../ui/Button';
import { TYPE_MAP, BADGE_TEXT_MAP, BADGE_COLOR_MAP, BADGE_TOOLTIP_MAP } from '../../constants';

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
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
    }
  }, [isOpen, config]);

  // Initialize tooltips within the modal on open
  useEffect(() => {
    if (!isOpen) return;
    // @ts-ignore
    if (typeof window !== 'undefined' && (window as any).tippy && modalRef.current) {
      const targets = modalRef.current.querySelectorAll('[data-tippy-content]');
      // @ts-ignore
      (window as any).tippy(targets, {
        animation: 'shift-away',
        theme: 'custom',
      });
    }
  }, [isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLocalConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const [showScreenTypes, setShowScreenTypes] = useState(false);
  const [showPrintTypes, setShowPrintTypes] = useState(false);

  // Get unique types from TYPE_MAP (eliminate duplicates)
  const getUniqueTypes = () => {
    return Array.from(new Set(Object.values(TYPE_MAP)));
  };

  const defaultSelected = ['exemple', 'application'];

  const handleDescriptionModeChange = (context: 'screen' | 'print', mode: 'all' | 'none' | 'custom') => {
    setLocalConfig(prev => {
      const prevTypes = prev[`${context}DescriptionTypes`] || [];
      const nextTypes = mode === 'all' ? getUniqueTypes()
        : mode === 'none' ? []
        : (prevTypes.length > 0 ? prevTypes : defaultSelected);
      return {
        ...prev,
        [`${context}DescriptionMode`]: mode,
        [`${context}DescriptionTypes`]: nextTypes,
      };
    });
  };

  const handleDescriptionTypeToggle = (context: 'screen' | 'print', type: string) => {
    setLocalConfig(prev => {
      const currentTypes = prev[`${context}DescriptionTypes`] || [];
      const newTypes = currentTypes.includes(type) 
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type];
      
      return {
        ...prev,
        [`${context}DescriptionTypes`]: newTypes,
        [`${context}DescriptionMode`]: newTypes.length === 0 ? 'none' : 
                                       newTypes.length === getUniqueTypes().length ? 'all' : 'custom'
      };
    });
  };

  const handleSave = () => {
    onConfigChange(localConfig);
    onClose();
  };

  if (!isOpen) return null;

  // Material Design styles
  const inputClasses = "w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 material-focus";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-2";
  const sectionClasses = "bg-white rounded-xl border border-gray-100 p-6 shadow-sm";
  const cardClasses = "bg-gray-50 rounded-lg p-4 border border-gray-100";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-3xl flex flex-col max-h-[96vh] overflow-hidden elevation-3" onClick={(e) => e.stopPropagation()}>
        
        {/* Material Design Drag Handle (mobile) */}
        <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-gray-300"></div>
        </div>
        
        {/* Material Design Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <i className="fas fa-cog text-blue-600 text-sm"></i>
            </div>
            <h2 className="text-xl font-medium text-gray-900">Configuration</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 transition-colors duration-200 flex items-center justify-center"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

  {/* Contenu compact */}
  <div ref={modalRef} className="flex-1 overflow-y-auto overscroll-contain">
    <div className="p-4 sm:p-4 space-y-4">
            
            {/* Section Informations Générales */}
            <div className={sectionClasses}>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Informations Générales</h3>
              
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className={cardClasses}>
                  <label htmlFor="establishmentName" className={labelClasses}>
                    Nom de l'établissement
                  </label>
                  <input
                    type="text"
                    id="establishmentName"
                    name="establishmentName"
                    value={localConfig.establishmentName}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="Ex: Lycée Ibn al-Haytham"
                  />
                </div>
                
                <div className={cardClasses}>
                  <label htmlFor="defaultTeacherName" className={labelClasses}>
                    Nom de l'enseignant
                  </label>
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

            {/* Section Contenu visible - compact */}
            <div className={sectionClasses}>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Contenu visible</h3>

              <div className="space-y-4 xl:space-y-0 xl:grid xl:grid-cols-2 xl:gap-4">
                
                {/* Application Context */}
                <div className="rounded-lg p-3 border border-gray-200">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-800">Application (écran)</h4>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      {(['all', 'none', 'custom'] as const).map(mode => (
                        <button
                          key={mode}
                          onClick={() => {
                            handleDescriptionModeChange('screen', mode);
                            if (mode === 'custom') setShowScreenTypes(true);
                            else setShowScreenTypes(false);
                          }}
                          className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium border ${
                            (localConfig.screenDescriptionMode || 'all') === mode
                              ? 'border-slate-700 text-slate-800'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          {mode === 'all' && <>Tout</>}
                          {mode === 'none' && <>Aucune</>}
                          {mode === 'custom' && <>Sélection</>}
                        </button>
                      ))}
                    </div>

                    {/* Afficher/cacher liste des types */}
                    {(localConfig.screenDescriptionMode || 'all') === 'custom' && (
                      <div className="space-y-3 mt-3">
                        <button
                          onClick={() => setShowScreenTypes(!showScreenTypes)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-white rounded-md border border-gray-200 hover:border-gray-300"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-gray-700">
                              Types sélectionnés ({(localConfig.screenDescriptionTypes || []).length})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                              {(localConfig.screenDescriptionTypes || []).length} / {getUniqueTypes().length}
                            </span>
                            <span className="text-gray-500 text-xs">{showScreenTypes ? '▲' : '▼'}</span>
                          </div>
                        </button>

                        {/* Types */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          showScreenTypes ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
        <div className="flex flex-wrap gap-2 p-2 bg-white rounded-md border border-gray-200">
                            {getUniqueTypes().map(type => {
                              const isSelected = (localConfig.screenDescriptionTypes || []).includes(type);
                              return (
                                <button
                                  key={type}
                                  onClick={() => handleDescriptionTypeToggle('screen', type)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium ${
                                    isSelected
                                      ? `${BADGE_COLOR_MAP[type] || 'bg-gray-100 text-gray-800'} ring-1 ring-gray-300`
                                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
                                  data-tippy-content={BADGE_TOOLTIP_MAP[type] || type}
                                >
                                  <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-[10px] font-bold ${
                                    isSelected ? 'bg-white/30' : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {BADGE_TEXT_MAP[type]?.charAt(0) || type.charAt(0).toUpperCase()}
                                  </span>
                                  {BADGE_TEXT_MAP[type] || type}
                                </button>
                              );
                            })}
                          </div>
                          
                          <div className="mt-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-gray-700 font-medium">Sélection active</span>
                              <div className="flex gap-2 items-center">
                                <button
                                  onClick={() => {
                                    setLocalConfig(prev => ({
                                      ...prev,
                                      screenDescriptionTypes: getUniqueTypes(),
                                      screenDescriptionMode: 'all'
                                    }));
                                  }}
                                  className="text-slate-700 hover:text-slate-900 font-medium"
                                >
                                  Tout sélectionner
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => {
                                    setLocalConfig(prev => ({
                                      ...prev,
                                      screenDescriptionTypes: [],
                                      screenDescriptionMode: 'none'
                                    }));
                                  }}
                                  className="text-slate-700 hover:text-slate-900 font-medium"
                                >
                                  Tout désélectionner
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Print Context */}
                <div className="rounded-lg p-3 border border-gray-200">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-800">Impression (PDF/papier)</h4>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      {(['all', 'none', 'custom'] as const).map(mode => (
                        <button
                          key={mode}
                          onClick={() => {
                            handleDescriptionModeChange('print', mode);
                            if (mode === 'custom') setShowPrintTypes(true);
                            else setShowPrintTypes(false);
                          }}
                          className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium border ${
                            (localConfig.printDescriptionMode || 'all') === mode
                              ? 'border-slate-700 text-slate-800'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          {mode === 'all' && <>Tout</>}
                          {mode === 'none' && <>Aucune</>}
                          {mode === 'custom' && <>Sélection</>}
                        </button>
                      ))}
                    </div>

                    {/* Afficher/cacher liste des types */}
                    {(localConfig.printDescriptionMode || 'all') === 'custom' && (
                      <div className="space-y-3 mt-3">
                        <button
                          onClick={() => setShowPrintTypes(!showPrintTypes)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-white rounded-md border border-gray-200 hover:border-gray-300"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-gray-700">
                              Types sélectionnés ({(localConfig.printDescriptionTypes || []).length})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                              {(localConfig.printDescriptionTypes || []).length} / {getUniqueTypes().length}
                            </span>
                            <span className="text-gray-500 text-xs">{showPrintTypes ? '▲' : '▼'}</span>
                          </div>
                        </button>

                        {/* Types */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          showPrintTypes ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
        <div className="flex flex-wrap gap-2 p-2 bg-white rounded-md border border-gray-200">
                            {getUniqueTypes().map(type => {
                              const isSelected = (localConfig.printDescriptionTypes || []).includes(type);
                              return (
                                <button
                                  key={type}
                                  onClick={() => handleDescriptionTypeToggle('print', type)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium ${
                                    isSelected
                                      ? `${BADGE_COLOR_MAP[type] || 'bg-gray-100 text-gray-800'} ring-1 ring-gray-300`
                                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
                                  data-tippy-content={BADGE_TOOLTIP_MAP[type] || type}
                                >
                                  <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-[10px] font-bold ${
                                    isSelected ? 'bg-white/30' : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {BADGE_TEXT_MAP[type]?.charAt(0) || type.charAt(0).toUpperCase()}
                                  </span>
                                  {BADGE_TEXT_MAP[type] || type}
                                </button>
                              );
                            })}
                          </div>
                          <div className="mt-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-gray-700 font-medium">Sélection active</span>
                              <div className="flex gap-2 items-center">
                                <button
                                  onClick={() => {
                                    setLocalConfig(prev => ({
                                      ...prev,
                                      printDescriptionTypes: getUniqueTypes(),
                                      printDescriptionMode: 'all'
                                    }));
                                  }}
                                  className="text-slate-700 hover:text-slate-900 font-medium"
                                >
                                  Tout sélectionner
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => {
                                    setLocalConfig(prev => ({
                                      ...prev,
                                      printDescriptionTypes: [],
                                      printDescriptionMode: 'none'
                                    }));
                                  }}
                                  className="text-slate-700 hover:text-slate-900 font-medium"
                                >
                                  Tout désélectionner
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Section Gestion des données - compact */}
            <div className={sectionClasses}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                  <i className="fas fa-database text-green-600 text-sm"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Gestion des données</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className={cardClasses}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <i className="fas fa-download text-blue-600 text-xs"></i>
                    </div>
                    <h4 className="text-sm font-medium text-gray-800">Exporter</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Sauvegardez toutes vos classes et configurations.</p>
                  <button
                    type="button"
                    onClick={onExportPlatform}
                    className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 material-focus"
                  >
                    <i className="fas fa-download text-xs"></i>
                    Exporter tout
                  </button>
                </div>
                
                <div className={cardClasses}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                      <i className="fas fa-upload text-orange-600 text-xs"></i>
                    </div>
                    <h4 className="text-sm font-medium text-gray-800">Importer</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Restaurez vos données depuis un fichier.</p>
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenImport(); }}
                    className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 material-focus"
                  >
                    <i className="fas fa-upload text-xs"></i>
                    Importer fichier
                  </button>
                </div>
              </div>
            </div> {/* end section */}
          </div> {/* end inner padding container */}
        </div> {/* end scroll container */}

        {/* Material Design Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 material-focus"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 h-10 px-6 rounded-full text-white text-sm font-medium bg-blue-600 hover:bg-blue-700 transition-all duration-200 elevation-1 hover:elevation-2 material-focus"
          >
            <i className="fas fa-save text-sm"></i>
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};