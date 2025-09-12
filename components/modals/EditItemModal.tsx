import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { Indices, LessonsData, TopLevelItem } from '../../types';
import { TOP_LEVEL_TYPE_CONFIG, TYPE_MAP } from '../../constants';
import { findItem } from '../../utils/dataUtils';

export { EditItemModal as AddContentModal }

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: string, data: any) => void;
  lessonsData: LessonsData;
  selectedIndices: Indices | null;
}

const getElementTypeFromIndices = (data: LessonsData, indices: Indices): string | null => {
    if (indices.itemIndex !== undefined) return 'item';
    if (indices.subsubsectionIndex !== undefined) return 'subsubsection';
    if (indices.subsectionIndex !== undefined) return 'subsection';
    if (indices.sectionIndex !== undefined) return 'section';
    if (indices.chapterIndex !== undefined) return data[indices.chapterIndex]?.type || null;
    return null;
}

const ActionButton: React.FC<{icon: string, label: string, color: string, onClick: () => void, disabled?: boolean, tooltip?: string}> = 
({ icon, label, color, onClick, disabled = false, tooltip }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        data-tippy-content={tooltip}
        className={`flex flex-col items-center justify-center text-center p-3 transition-all duration-150
            ${disabled
                ? 'text-slate-300 cursor-not-allowed'
                : `text-black hover:bg-black hover:text-white border-b-2 border-black ${color}`
            }`}
    >
        <i className={`${icon} text-2xl mb-2`}></i>
        <span className="font-medium text-xs">{label}</span>
    </button>
);


// Pré-calcul global (évite recomputations dans chaque ouverture)
const UNIQUE_LESSON_ITEM_TYPES = [...new Set(Object.values(TYPE_MAP))].sort((a, b) => a.localeCompare(b));

const EditItemModal: React.FC<AddContentModalProps> = ({ isOpen, onClose, onConfirm, lessonsData, selectedIndices }) => {
    const [stage, setStage] = useState<'select' | 'form'>('select');
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});
    const initialFocusRef = useRef<HTMLButtonElement | null>(null);
    
    // Reset quand ouverture
    useEffect(() => {
        if (isOpen) {
            setStage('select');
            setSelectedType(null);
            setFormData({});
        }
    }, [isOpen]);

    // Scroll lock & ESC close (mobile friendly)
    useEffect(() => {
        if (!isOpen) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', handleKey);
        };
    }, [isOpen, onClose]);

    let modalTitle = 'Ajouter du contenu';
    if (stage !== 'select' && selectedType) {
        const config = TOP_LEVEL_TYPE_CONFIG[selectedType as TopLevelItem['type']];
        if (config) {
            modalTitle = `Ajouter : ${config.name}`;
        } else {
            modalTitle = `Ajouter : ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`;
        }
    }

    // Mémoïser le contexte de l'élément sélectionné
    const { selectedItem, selectedElementType } = useMemo(() => {
        if (!selectedIndices || !isOpen) return { selectedItem: null, selectedElementType: null };
        const { item } = findItem(lessonsData, selectedIndices);
        return { selectedItem: item, selectedElementType: getElementTypeFromIndices(lessonsData, selectedIndices) };
    }, [selectedIndices, lessonsData, isOpen]);

    const handleSelectType = (type: string) => {
        setSelectedType(type);
        const config = TOP_LEVEL_TYPE_CONFIG[type as TopLevelItem['type']];
        let initialData: any = {};

        if (config) {
            initialData.title = config.name;
        } else if (type === 'item') {
            initialData.type = 'exercice';
        }
        
        setFormData(initialData);
        setStage('form');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedType) {
            onConfirm(selectedType, formData);
        }
    };

    const inputClasses = "w-full bg-slate-100 border-slate-200 border rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors";
    const labelClasses = "block text-sm font-medium text-slate-700 mb-2";

    const renderForm = () => {
        if (!selectedType) return null;
        const config = TOP_LEVEL_TYPE_CONFIG[selectedType as TopLevelItem['type']];
        if (config) {
            return (
                <div>
                    <label htmlFor="title" className={labelClasses}>Titre pour "{config.name}"</label>
                    <input ref={initialFocusRef} type="text" id="title" autoFocus value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputClasses} required />
                </div>
            );
        }
        switch (selectedType) {
            case 'section':
                return (
                    <div>
                        <label htmlFor="name" className={labelClasses}>Nom de la Section</label>
                        <input ref={initialFocusRef} type="text" id="name" autoFocus value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClasses} required />
                    </div>
                );
            case 'item':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="itemType" className={labelClasses}>Type *</label>
                                <select ref={initialFocusRef} id="itemType" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required className={inputClasses}>
                                    {UNIQUE_LESSON_ITEM_TYPES.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="itemNumber" className={labelClasses}>Numéro</label>
                                <input type="text" id="itemNumber" value={formData.number || ''} onChange={(e) => setFormData({ ...formData, number: e.target.value })} className={inputClasses} placeholder="Ex: 1.2" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="itemTitle" className={labelClasses}>Titre</label>
                            <input type="text" id="itemTitle" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputClasses} placeholder="Titre de l'élément" />
                        </div>
                        <div>
                            <label htmlFor="itemDescription" className={labelClasses}>Description / Contenu</label>
                            <textarea id="itemDescription" rows={3} value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClasses} placeholder="Saisir le contenu..."></textarea>
                        </div>
                    </div>
                );
            case 'separator':
                return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="separatorContent" className={labelClasses}>Texte du séparateur</label>
                            <input ref={initialFocusRef} type="text" id="separatorContent" autoFocus value={formData.content || ''} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className={inputClasses} placeholder="Ex: Fin du chapitre" />
                        </div>
                        <div>
                            <label htmlFor="separatorDate" className={labelClasses}>Date (optionnel)</label>
                            <input type="date" id="separatorDate" value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={inputClasses} />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    
    // Permettre d'ajouter des sections aux chapitres et aux évaluations
    const canAddSection = selectedElementType === 'chapter' || 
                         (selectedElementType && 
                          (selectedElementType.startsWith('evaluation_') || 
                           selectedElementType.startsWith('devoir_') || 
                           selectedElementType.startsWith('controle_') || 
                           selectedElementType.startsWith('correction_')));
    const canAddItem = selectedItem && 'items' in selectedItem;
    const canAddSeparator = !!selectedIndices;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-fade-in" onClick={onClose} aria-modal="true" role="dialog" aria-label={modalTitle}>
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl flex flex-col max-h-[92vh] sm:max-h-[86vh] animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="px-3 sm:px-4 pt-3 pb-2 border-b border-slate-200 flex-shrink-0 flex items-center justify-between gap-2">
                        <h2 className="text-base sm:text-lg font-semibold font-slab text-slate-900 line-clamp-1">
                           {modalTitle}
                        </h2>
                        <div className="flex items-center gap-2">
                            {stage === 'form' && (
                                <Button type="button" variant="secondary" size="sm" onClick={() => setStage('select')} aria-label="Retour à la sélection des types">
                                    <i className="fas fa-arrow-left"></i>
                                </Button>
                            )}
                            <Button ref={initialFocusRef} type="button" variant="secondary" size="sm" onClick={onClose} aria-label="Fermer la fenêtre">
                                <i className="fas fa-times"></i>
                            </Button>
                        </div>
                    </div>
                    <div className="px-3 sm:px-5 py-3 flex-grow overflow-y-auto overscroll-contain" data-mobile-scroll>
                        {stage === 'select' ? (
                            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
                                {Object.entries(TOP_LEVEL_TYPE_CONFIG).map(([type, config]) => (
                                    <ActionButton key={type} icon={config.icon} label={config.name} color={config.color} onClick={() => handleSelectType(type)} />
                                ))}
                                <ActionButton
                                    icon="fas fa-sitemap"
                                    label="Section"
                                    color="text-teal-600"
                                    onClick={() => handleSelectType('section')}
                                    disabled={!canAddSection}
                                    tooltip={!canAddSection ? "Sélectionnez un chapitre ou une évaluation pour ajouter une section" : undefined}
                                />
                                <ActionButton icon="fas fa-stream" label="Élément" color="text-blue-600" onClick={() => handleSelectType('item')} disabled={!canAddItem} tooltip={!canAddItem ? "Sélectionnez une section ou un chapitre pour ajouter un élément" : undefined} />
                                <ActionButton icon="fas fa-grip-lines" label="Séparateur" color="text-slate-500" onClick={() => handleSelectType('separator')} disabled={!canAddSeparator} tooltip={!canAddSeparator ? "Sélectionez un élément pour insérer un séparateur après" : undefined} />
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {renderForm()}
                            </div>
                        )}
                    </div>
                    <div className="sticky bottom-0 sm:static bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-t border-slate-200 px-3 sm:px-4 py-2.5 flex justify-end gap-3 rounded-b-none sm:rounded-b-2xl">
                        {stage === 'form' ? (
                            <>
                                <Button type="button" onClick={onClose} variant="secondary">Annuler</Button>
                                <Button type="submit" variant="primary">Ajouter</Button>
                            </>
                        ) : (
                            <Button type="button" onClick={onClose} variant="secondary">Fermer</Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
