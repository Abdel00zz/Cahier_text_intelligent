import { useState, useCallback, FC, memo } from 'react';
import { Indices, ElementType, TopLevelItem } from '../types';
import { formatDateDDMMYYYY } from '../utils/dataUtils';
import { Button } from './ui/Button';
import { ContentRenderer } from './ContentRenderer';
import { EditableCell } from './ui/EditableCell';
import { TOP_LEVEL_TYPE_CONFIG } from '../constants';
import { EditableTitle } from './ui/EditableTitle';
import { MobileDateModal } from './modals/MobileDateModal';

interface TableRowProps {
  data: any;
  indices: Indices;
  elementType: ElementType;
  onCellUpdate: (indices: Indices, field: string, value: any) => void;
  onDeleteItem: (indices: Indices) => void;
  onSelectRow: (indices: Indices) => void;
  isSelected: boolean;
  isNew?: boolean;
  showDescriptions?: boolean;
  descriptionTypes?: string[];
  onInitiateInlineEdit: (indices: Indices) => void;
  onOpenAddContentModal: (indices: Indices) => void;
}

export const TableRow: FC<TableRowProps> = memo(({ data, indices, elementType, onCellUpdate, onDeleteItem, onSelectRow, isSelected, isNew = false, showDescriptions, descriptionTypes = [], onInitiateInlineEdit, onOpenAddContentModal }) => {
  const [isDateModalOpen, setDateModalOpen] = useState(false);

  const handleSelect = useCallback(() => onSelectRow(indices), [indices, onSelectRow]);
  const handleOpenAddModal = useCallback(() => onOpenAddContentModal(indices), [indices, onOpenAddContentModal]);
  const handleInitiateEdit = useCallback(() => onInitiateInlineEdit(indices), [indices, onInitiateInlineEdit]);
  const handleDelete = useCallback(() => onDeleteItem(indices), [indices, onDeleteItem]);

  const openDateEditor = () => {
    setDateModalOpen(true);
  };

  const saveDate = (value: string) => {
    onCellUpdate(indices, 'date', value);
    setDateModalOpen(false);
  };

  
    const renderDate = (dateString: string) => {
        if (!dateString) return <span className="text-slate-400 italic text-xs">Pas de date</span>;
        const compact = formatDateDDMMYYYY(dateString);
        if (!compact) return <span className="text-slate-400 italic text-xs">Date invalide</span>;
        // Affichage compact dd/mm/yyyy
        return <span className="inline-block text-center font-semibold text-slate-800 text-sm">{compact}</span>;
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
        <>
            <div className={topLevelClasses} onClick={(e) => { e.stopPropagation(); handleSelect(); }}>
                {/* Date Column */}
                <div className="w-full md:w-[15%] md:p-1 md:border-r md:border-slate-300/50">
                    <div className="relative group/date h-full flex items-center justify-center p-2" onClick={(e) => e.stopPropagation()}>
                        <div role="button" tabIndex={0} onClick={openDateEditor} onKeyDown={(e) => { if (e.key === 'Enter') openDateEditor(); }}
                            className="flex-grow h-full flex items-center justify-center text-xs rounded transition-colors cursor-pointer hover:bg-black/10 p-2"
                        >
                            {renderDate(data.date)}
                        </div>
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
                    <div className="absolute top-1/2 -translate-y-1/2 right-2 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 group-hover:scale-100 print:hidden">
                      <Button variant="icon" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenAddModal(); }} data-tippy-content="Ajouter après" className="w-6 h-6 text-xs bg-white/60 hover:bg-white text-green-700 shadow">
                          <i className="fas fa-plus"></i>
                      </Button>
                      <Button variant="icon" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(); }} data-tippy-content="Supprimer" className="w-6 h-6 text-xs bg-white/60 hover:bg-white text-red-700 shadow">
                        <i className="fas fa-trash-alt"></i>
                      </Button>
                    </div>
                </div>
                {/* Remark Column */}
                <div className="w-full md:w-[15%] p-1 relative border-t md:border-t-0 border-slate-200" onClick={(e) => e.stopPropagation()}>
                    <EditableCell value={data.remark || ''} onSave={(v) => onCellUpdate(indices, 'remark', v)} className="text-xs text-slate-600 p-2 h-full" multiline placeholder="Aucune remarque" />
                </div>
            </div>
            <MobileDateModal
                isOpen={isDateModalOpen}
                onClose={() => setDateModalOpen(false)}
                onSave={saveDate}
                initialDate={data.date}
            />
        </>
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
    <>
      <div className={rowClasses} onClick={(e) => { e.stopPropagation(); handleSelect(); }}>
        <div className="w-full md:w-[15%] md:p-1 md:border-r md:border-slate-200">
          <div className="px-2 pt-2 md:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</span>
          </div>
          <div className="relative group/date h-full flex items-center justify-center p-2 md:p-0" onClick={(e) => e.stopPropagation()}>
              <div 
                  role="button"
                  tabIndex={0}
                  onClick={openDateEditor}
                  onKeyDown={(e) => { if (e.key === 'Enter') openDateEditor(); }}
                  className={`flex-grow h-full flex items-center justify-center text-center text-xs rounded transition-colors cursor-pointer hover:bg-slate-100 ${data.date ? '' : 'text-slate-400'}`}
                  title="Cliquer pour modifier la date"
              >
                  {renderDate(data.date)}
              </div>
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
          <div className="absolute top-1/2 -translate-y-1/2 right-2 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 group-hover:scale-100 print:hidden">
            <Button variant="icon" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenAddModal(); }} data-tippy-content="Ajouter après" className="w-6 h-6 text-xs bg-green-100 hover:bg-green-200 text-green-700">
                <i className="fas fa-plus"></i>
            </Button>
            {elementType === 'item' && (
              <Button variant="icon" size="sm" onClick={(e) => { e.stopPropagation(); handleInitiateEdit(); }} data-tippy-content="Modifier" className="w-6 h-6 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700">
                  <i className="fas fa-pencil-alt"></i>
              </Button>
            )}
            <Button variant="icon" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(); }} data-tippy-content="Supprimer" className="w-6 h-6 text-xs bg-red-100 hover:bg-red-200 text-red-700">
              <i className="fas fa-trash-alt"></i>
            </Button>
          </div>
        </div>
        <div className="w-full md:w-[15%] p-1 relative border-t md:border-t-0 border-slate-200" onClick={(e) => e.stopPropagation()}>
          <div className="px-1 pt-1 md:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remarque</span>
          </div>
          <EditableCell value={data.remark || ''} onSave={(v) => onCellUpdate(indices, 'remark', v)} className="text-xs text-slate-600 p-2" multiline placeholder="Aucune remarque" />
        </div>
      </div>

      <MobileDateModal
        isOpen={isDateModalOpen}
        onClose={() => setDateModalOpen(false)}
        onSave={saveDate}
        initialDate={data.date}
      />
    </>
  );
});