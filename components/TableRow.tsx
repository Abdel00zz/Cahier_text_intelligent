import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Indices, ElementType, TopLevelItem } from '../types';
import { Button } from './ui/Button';
import { ContentRenderer } from './ContentRenderer';
import { EditableCell } from './ui/EditableCell';
import { TOP_LEVEL_TYPE_CONFIG } from '../constants';
import { EditableTitle } from './ui/EditableTitle';

interface TableRowProps {
  data: any;
  indices: Indices;
  elementType: ElementType;
  onCellUpdate: (indices: Indices, field: string, value: any) => void;
  onDeleteItem: (indices: Indices) => void;
  onSelectRow: (indices: Indices) => void;
  isSelected: boolean;
  isNew?: boolean;
  showDescriptions: boolean;
  descriptionTypes?: string[];
  onInitiateInlineEdit: (indices: Indices) => void;
  onOpenAddContentModal: (indices: Indices) => void;
}

export const TableRow: React.FC<TableRowProps> = React.memo(({ data, indices, elementType, onCellUpdate, onDeleteItem, onSelectRow, isSelected, isNew = false, showDescriptions, descriptionTypes = [], onInitiateInlineEdit, onOpenAddContentModal }) => {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingDate) {
      dateInputRef.current?.focus();
    }
  }, [isEditingDate]);

  const handleSelect = useCallback(() => onSelectRow(indices), [indices, onSelectRow]);
  const handleOpenAddModal = useCallback(() => onOpenAddContentModal(indices), [indices, onOpenAddContentModal]);
  const handleInitiateEdit = useCallback(() => onInitiateInlineEdit(indices), [indices, onInitiateInlineEdit]);
  const handleDelete = useCallback(() => onDeleteItem(indices), [indices, onDeleteItem]);

  
  const renderDate = (dateString: string) => {
    if (!dateString) return <span className="text-slate-400 italic text-xs">Pas de date</span>;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);
    correctedDate.setHours(0,0,0,0);
    
    if(correctedDate.getTime() === today.getTime()){
        return <div className="text-center font-medium text-teal-600 text-sm">Aujourd'hui</div>;
    }

    try {
        const day = correctedDate.toLocaleDateString('fr-FR', { day: '2-digit' });
        const month = correctedDate.toLocaleDateString('fr-FR', { month: '2-digit' });
        const year = correctedDate.getFullYear();
        return (
            <div className="text-center font-medium text-slate-700 text-sm">
                <span className="font-semibold">{day}</span>
                <span className="text-slate-500 mx-1">/</span>
                <span className="font-semibold">{month}</span>
                <span className="text-slate-500 mx-1">/</span>
                <span className="text-slate-600">{year}</span>
            </div>
        );
    } catch (error) {
        return <span className="text-red-500 text-xs">Date invalide</span>;
    }
  };

  const isCorrection = elementType.startsWith('correction_');
  const isTopLevelBlock = (elementType in TOP_LEVEL_TYPE_CONFIG && elementType !== 'chapter') || isCorrection;

  if (isTopLevelBlock) {
    const item = data as TopLevelItem;
    const config = TOP_LEVEL_TYPE_CONFIG[item.type];
    
    const bgColorClass = config.badgeColor?.split(' ').find(c => c.startsWith('bg-')) || 'bg-slate-50';
    const hoverEffectClass = isSelected ? "" : "hover:brightness-95";

    const topLevelClasses = [
        "group relative md:flex cursor-pointer my-2",
        bgColorClass,
        "border-y border-slate-200/50",
        isSelected ? "shadow-lg ring-2 ring-teal-400 z-10" : hoverEffectClass,
        isNew ? "new-item-highlight" : "",
        "transition-all duration-150"
    ].filter(Boolean).join(" ");

    return (
        <div className={topLevelClasses} onClick={(e) => { e.stopPropagation(); handleSelect(); }}>
            {/* Date Column */}
            <div className="w-full md:w-[15%] md:p-1 md:border-r md:border-slate-300/50">
                <div className="relative group/date h-full flex items-center justify-center p-2" onClick={(e) => e.stopPropagation()}>
                    {isEditingDate ? (
                        <input
                            ref={dateInputRef} type="date" value={data.date || ''}
                            onChange={(e) => onCellUpdate(indices, 'date', e.target.value)}
                            onBlur={() => setIsEditingDate(false)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setIsEditingDate(false); }}
                            className="w-full h-full text-center border-2 border-teal-500 rounded-md shadow-inner bg-white z-10 focus:outline-none"
                            aria-label="Modifier la date"
                        />
                    ) : (
                        <div role="button" tabIndex={0} onClick={() => setIsEditingDate(true)} onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingDate(true); }}
                            className="flex-grow h-full flex items-center justify-center text-xs rounded transition-colors cursor-pointer hover:bg-black/10 p-2"
                        >
                            {renderDate(data.date)}
                        </div>
                    )}
                    {!isEditingDate && (
                        <div className="flex items-center gap-1 transition-opacity md:absolute md:top-1/2 md:right-1 md:-translate-y-1/2 md:opacity-0 md:group-hover/date:opacity-100">
                             <button onClick={() => onCellUpdate(indices, 'date', new Date().toISOString().slice(0, 10))} className="w-6 h-6 flex items-center justify-center rounded-full text-xs bg-white/60 hover:bg-white text-teal-700 shadow" data-tippy-content="Aujourd'hui">
                                <i className="fas fa-calendar-day"></i>
                            </button>
                            {data.date &&
                                <button onClick={() => onCellUpdate(indices, 'date', '')} className="w-6 h-6 flex items-center justify-center rounded-full text-xs bg-white/60 hover:bg-white text-slate-600 shadow" data-tippy-content="Effacer la date">
                                    <i className="fas fa-times-circle"></i>
                                </button>
                            }
                        </div>
                    )}
                </div>
            </div>
            {/* Content Column */}
            <div className="w-full md:w-[70%] p-2 md:p-1 relative border-t md:border-t-0 md:border-r border-slate-300/50" onClick={(e) => e.stopPropagation()}>
                <div className="h-full flex items-center justify-center md:pr-12">
                     <div className={`text-lg font-bold font-slab py-3 flex items-center justify-center gap-3 ${config.color}`}>
                        <i className={config.icon}></i>
                        <EditableTitle value={item.title} onSave={(v) => onCellUpdate(indices, 'title', v)} />
                    </div>
                </div>
                {/* Minimal action buttons for top-level blocks - always visible with transparency */}
                <div className="absolute top-1/2 -translate-y-1/2 right-2 flex gap-1 opacity-70 hover:opacity-100 transition-opacity duration-200 print:hidden">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenAddModal(); }} 
                        className="w-7 h-7 flex items-center justify-center rounded bg-white/80 text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 material-focus"
                        data-tippy-content="Ajouter après"
                        aria-label="Ajouter après"
                    >
                        <i className="fas fa-plus text-xs"></i>
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(); }} 
                        className="w-7 h-7 flex items-center justify-center rounded bg-white/80 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 material-focus"
                        data-tippy-content="Supprimer"
                        aria-label="Supprimer"
                    >
                        <i className="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </div>
            {/* Remark Column */}
            <div className="w-full md:w-[15%] p-1 relative border-t md:border-t-0 border-slate-200" onClick={(e) => e.stopPropagation()}>
                <EditableCell value={data.remark || ''} onSave={(v) => onCellUpdate(indices, 'remark', v)} className="text-xs text-slate-600 p-2 h-full" multiline placeholder="Aucune remarque" />
            </div>
        </div>
    );
  }

  const rowClasses = [
    "group", "relative", "md:flex", "mb-3 md:mb-0", "rounded-lg md:rounded-none",
    "border md:border-0 md:border-l-4",
    isSelected ? "border-teal-500 shadow-lg" : "border-transparent",
    "bg-white",
    "shadow-sm md:shadow-none",
    !isSelected ? "md:hover:bg-slate-50" : "",
    "transition-all", "duration-200", "cursor-pointer",
    isNew ? 'new-item-highlight' : ''
  ].filter(Boolean).join(" ");

  return (
    <div className={rowClasses} onClick={(e) => { e.stopPropagation(); handleSelect(); }}>
      <div className="w-full md:w-[15%] md:p-1 md:border-r md:border-slate-200">
        <div className="px-2 pt-2 md:hidden">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</span>
        </div>
        <div className="relative group/date h-full flex items-center justify-center p-2 md:p-0 md:pr-16" onClick={(e) => e.stopPropagation()}>
            {isEditingDate ? (
                 <input
                    ref={dateInputRef}
                    type="date"
                    value={data.date || ''}
                    onChange={(e) => onCellUpdate(indices, 'date', e.target.value)}
                    onBlur={() => setIsEditingDate(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Escape') {
                            setIsEditingDate(false);
                        }
                    }}
                    className="w-full h-full text-center border-2 border-teal-500 rounded-md shadow-inner bg-white z-10 focus:outline-none"
                    aria-label="Modifier la date"
                />
            ) : (
                <div 
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsEditingDate(true)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingDate(true); }}
                    className={`flex-grow h-full flex items-center justify-center text-center text-xs rounded transition-colors cursor-pointer hover:bg-slate-100 ${data.date ? '' : 'text-slate-400'}`}
                    title="Cliquer pour modifier la date"
                >
                    {renderDate(data.date)}
                </div>
            )}
            
            {!isEditingDate && (
                <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity duration-200 mt-2 md:mt-0 md:absolute md:top-1/2 md:right-2 md:-translate-y-1/2">
                    <button 
                        onClick={() => onCellUpdate(indices, 'date', new Date().toISOString().slice(0, 10))} 
                        className="w-6 h-6 flex items-center justify-center bg-white/80 text-teal-600 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200 material-focus" 
                        data-tippy-content="Aujourd'hui"
                        aria-label="Définir à aujourd'hui"
                    >
                        <i className="fas fa-calendar-day text-xs"></i>
                    </button>
                    {data.date &&
                        <button 
                            onClick={() => onCellUpdate(indices, 'date', '')} 
                            className="w-6 h-6 flex items-center justify-center bg-white/80 text-gray-600 hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200 material-focus" 
                            data-tippy-content="Effacer la date"
                            aria-label="Effacer la date"
                        >
                            <i className="fas fa-times-circle text-xs"></i>
                        </button>
                    }
                </div>
            )}
        </div>
      </div>
      <div className="w-full md:w-[70%] p-2 md:p-1 relative border-t md:border-t-0 md:border-r border-slate-200" onClick={(e) => e.stopPropagation()}>
        <div className="md:hidden">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contenu</span>
        </div>
        <div className="md:pr-12">
            <ContentRenderer 
                data={data} 
                indices={indices} 
                elementType={elementType} 
                showDescriptions={showDescriptions} 
                descriptionTypes={descriptionTypes}
                onCellUpdate={onCellUpdate}
            />
        </div>
                {/* Minimal action buttons - always visible with transparency */}
                <div className="absolute top-1/2 -translate-y-1/2 right-2 flex gap-1 opacity-70 hover:opacity-100 transition-opacity duration-200 print:hidden">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenAddModal(); }} 
                        className="w-7 h-7 flex items-center justify-center rounded bg-white/80 text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 material-focus"
                        data-tippy-content="Ajouter après"
                        aria-label="Ajouter après"
                    >
                        <i className="fas fa-plus text-xs"></i>
                    </button>
                    {elementType === 'item' && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleInitiateEdit(); }} 
                            className="w-7 h-7 flex items-center justify-center rounded bg-white/80 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 material-focus"
                            data-tippy-content="Modifier"
                            aria-label="Modifier"
                        >
                            <i className="fas fa-edit text-xs"></i>
                        </button>
                    )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(); }} 
                        className="w-7 h-7 flex items-center justify-center rounded bg-white/80 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 material-focus"
                        data-tippy-content="Supprimer"
                        aria-label="Supprimer"
                    >
                        <i className="fas fa-trash text-xs"></i>
                    </button>
                </div>
      </div>
      <div className="w-full md:w-[15%] p-1 relative border-t md:border-t-0 border-slate-200" onClick={(e) => e.stopPropagation()}>
        <div className="px-1 pt-1 md:hidden">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remarque</span>
        </div>
        <EditableCell value={data.remark || ''} onSave={(v) => onCellUpdate(indices, 'remark', v)} className="text-xs text-slate-600 p-2" multiline placeholder="Aucune remarque" />
      </div>
    </div>
  );
});