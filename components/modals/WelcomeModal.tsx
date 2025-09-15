import React, { useState, useEffect, useRef, FC } from 'react';
import { AppConfig } from '../../types';
import { Button } from '../ui/Button';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onConfigChange: (newConfig: Partial<AppConfig>) => void;
}

export const WelcomeModal: FC<WelcomeModalProps> = ({ isOpen, onClose, config, onConfigChange }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
      setCurrentStep(1);
    }
  }, [isOpen, config]);

  const handleChange = (field: keyof AppConfig, value: string) => {
    setLocalConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleFinish = () => {
    const finalConfig = {
      ...localConfig,
      hasCompletedWelcome: true
    };
    onConfigChange(finalConfig);
    onClose();
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return localConfig.establishmentName.trim().length > 0;
    }
    if (currentStep === 2) {
      return localConfig.defaultTeacherName.trim().length > 0;
    }
    if (currentStep === 3) {
      // Validation obligatoire : au moins un cycle doit être sélectionné
      const selectedCycles = localConfig.selectedCycles || [];
      return selectedCycles.length > 0;
    }
    return true;
  };

  const canFinish = () => {
    // Vérification finale : toutes les étapes doivent être complètes
    const hasEstablishment = localConfig.establishmentName.trim().length > 0;
    const hasTeacherName = localConfig.defaultTeacherName.trim().length > 0;
    const hasCycles = (localConfig.selectedCycles || []).length > 0;
    return hasEstablishment && hasTeacherName && hasCycles;
  };

  const handleCycleToggle = (cycle: string) => {
    const currentCycles = localConfig.selectedCycles || [];
    const newCycles = currentCycles.includes(cycle as any)
      ? currentCycles.filter(c => c !== cycle)
      : [...currentCycles, cycle as any];
    
    setLocalConfig(prev => ({
      ...prev,
      selectedCycles: newCycles,
      showAllCycles: newCycles.length === 3
    }));
  };

  const handleSubjectToggle = (subject: string) => {
    const currentSubjects = localConfig.selectedSubjects || [];
    const newSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter(s => s !== subject)
      : [...currentSubjects, subject];
    
    setLocalConfig(prev => ({
      ...prev,
      selectedSubjects: newSubjects,
      showAllSubjects: newSubjects.length === 0
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm p-0 sm:p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md transform transition-all duration-300 scale-100 overflow-hidden max-h-[90vh] sm:max-h-none"
      >
        {/* Header minimaliste */}
        <div className="px-4 sm:px-6 py-4 text-center border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
            <i className="fas fa-cog text-white text-sm"></i>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Configuration</h2>
          
          {/* Indicateurs simples */}
          <div className="flex justify-center space-x-2 mt-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  step <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                } ${step === currentStep ? 'scale-125' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Contenu principal */}
        <div className={`px-4 sm:px-6 py-4 transition-all duration-200 ${isAnimating ? 'opacity-50' : 'opacity-100'} flex-1 overflow-y-auto overscroll-contain`}>
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Votre établissement</h3>
                <p className="text-sm text-gray-500">Personnalisez votre expérience</p>
              </div>
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={localConfig.establishmentName}
                  onChange={(e) => handleChange('establishmentName', e.target.value)}
                  className="w-full px-4 py-4 text-base border-0 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all duration-300 placeholder:text-gray-400"
                  placeholder="Ex: Lycée Ibn al-Haytham"
                  autoFocus
                />
                <p className="text-xs text-gray-400 text-center">
                  Apparaîtra sur vos documents
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Votre nom</h3>
                <p className="text-sm text-gray-500">Comment souhaitez-vous être appelé ?</p>
              </div>
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={localConfig.defaultTeacherName}
                  onChange={(e) => handleChange('defaultTeacherName', e.target.value)}
                  className="w-full px-4 py-4 text-base border-0 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all duration-300 placeholder:text-gray-400"
                  placeholder="Ex: M. Ahmed Benali"
                  autoFocus
                />
                <p className="text-xs text-gray-400 text-center">
                  Utilisé par défaut pour vos classes
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Préférences</h3>
                <p className="text-sm text-gray-500">Choisissez au moins un cycle (obligatoire)</p>
              </div>
              
              {/* Cycles */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Cycles</h4>
                <div className="flex gap-2">
                  {[
                    { key: 'college', label: 'Collège' },
                    { key: 'lycee', label: 'Lycée' },
                    { key: 'prepa', label: 'Prépa' }
                  ].map(cycle => {
                    const isSelected = (localConfig.selectedCycles || []).includes(cycle.key as any);
                    return (
                      <button
                        key={cycle.key}
                        onClick={() => handleCycleToggle(cycle.key)}
                        className={`flex-1 px-3 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200 touch-manipulation ${
                          isSelected 
                            ? 'bg-blue-500 text-white border-blue-500 shadow-sm' 
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        {cycle.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Matières */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Matières favorites</h4>
                <div className="grid grid-cols-2 gap-2 max-h-24 sm:max-h-28 overflow-y-auto scrollbar-hide">
                  {[
                    'Mathématiques',
                    'Physique-Chimie',
                    'SVT',
                    'Français',
                    'Anglais',
                    'Arabe',
                    'Histoire',
                    'Géographie'
                  ].map(subject => {
                    const isSelected = (localConfig.selectedSubjects || []).includes(subject);
                    return (
                      <button
                        key={subject}
                        onClick={() => handleSubjectToggle(subject)}
                        className={`px-2.5 py-2 text-xs font-medium rounded-lg border transition-all duration-200 touch-manipulation ${
                          isSelected 
                            ? 'bg-green-500 text-white border-green-500 shadow-sm' 
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50'
                        }`}
                      >
                        {subject}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Optionnel - laissez vide pour tout voir
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer minimaliste */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center bg-white border-t border-gray-100 sm:border-t-0">
          <div>
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200 touch-manipulation min-h-[40px] flex items-center"
              >
                Précédent
              </button>
            )}
          </div>
          
          <div>
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation min-h-[40px] ${
                  canProceed()
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!canFinish()}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation min-h-[40px] ${
                  canFinish()
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Terminer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};