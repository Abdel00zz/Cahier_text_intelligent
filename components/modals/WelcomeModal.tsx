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
      return true; // Préférences optionnelles
    }
    return true;
  };

  const handleCycleToggle = (cycle: string) => {
    const currentCycles = localConfig.selectedCycles || ['college', 'lycee', 'prepa'];
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
        {/* Header ultra-minimaliste */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
            <i className="fas fa-magic text-white text-base sm:text-lg"></i>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Configuration</h2>
          <div className="flex justify-center space-x-2 mt-2 sm:mt-3">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1 rounded-full transition-all duration-500 ${
                  step <= currentStep ? 'bg-blue-500 w-6 sm:w-8' : 'bg-gray-200 w-2'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Contenu principal */}
        <div className={`px-4 sm:px-6 pb-4 sm:pb-6 transition-all duration-300 ${isAnimating ? 'opacity-30 scale-95' : 'opacity-100 scale-100'} flex-1 overflow-y-auto overscroll-contain`}>
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
                <p className="text-sm text-gray-500">Personnalisez votre affichage</p>
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
                    const isSelected = (localConfig.selectedCycles || ['college', 'lycee', 'prepa']).includes(cycle.key as any);
                    return (
                      <button
                        key={cycle.key}
                        onClick={() => handleCycleToggle(cycle.key)}
                        className={`flex-1 px-3 py-3 text-sm font-medium rounded-2xl transition-all duration-300 ${
                          isSelected 
                            ? 'bg-blue-500 text-white shadow-lg scale-105' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-102'
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
                        className={`px-2 sm:px-3 py-2 text-xs font-medium rounded-xl transition-all duration-300 touch-manipulation ${
                          isSelected 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 active:bg-gray-200'
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
                className="text-sm font-medium text-gray-500 hover:text-gray-700 active:text-gray-800 transition-colors duration-300 touch-manipulation min-h-[44px] flex items-center"
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
                className={`px-6 sm:px-8 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 touch-manipulation min-h-[44px] ${
                  canProceed()
                    ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white shadow-lg hover:shadow-xl sm:hover:scale-105'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-6 sm:px-8 py-3 text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 active:from-green-700 active:to-emerald-700 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl sm:hover:scale-105 touch-manipulation min-h-[44px]"
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