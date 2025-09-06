







import React, { useMemo, useState } from 'react';
import { LessonsData, Indices, Section, SubSection, SubSubSection, LessonItem, ElementType, Separator, TopLevelItem, EmbeddableTopLevelItem } from '../types';
import { TableRow } from './TableRow';
import { SeparatorRow } from './SeparatorRow';
import { Button } from './ui/Button';
import { TOP_LEVEL_TYPE_CONFIG, TYPE_MAP } from '../constants';

interface InlineEditRowProps {
    data: LessonItem;
    onSave: (updatedData: Partial<LessonItem>) => void;
    onCancel: () => void;
}

const InlineEditRow: React.FC<InlineEditRowProps> = ({ data, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<LessonItem>>(data);
    const uniqueTypes = useMemo(() => [...new Set(Object.values(TYPE_MAP))].sort((a,b) => a.localeCompare(b)), []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSave(formData);
    }
    
    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCancel();
    }

    const inputClasses = "w-full bg-slate-100 border-slate-200 border rounded-lg px-2 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors";

    return (
        <div className="md:flex bg-teal-50 border-2 border-teal-300 rounded-lg shadow-lg my-1 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="w-full md:w-[15%] p-2 md:border-r md:border-slate-200 flex items-center justify-center">
                <input type="date" name="date" value={formData.date || ''} onChange={handleChange} className={`${inputClasses} text-center max-w-[160px]`} />
            </div>
            <div className="w-full md:w-[70%] p-2 md:border-r md:border-slate-200 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select name="type" value={formData.type} onChange={handleChange} required className={inputClasses}>
                        {uniqueTypes.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
                    </select>
                    <input type="text" name="number" value={formData.number || ''} onChange={handleChange} className={inputClasses} placeholder="Numéro (ex: 1.2)" />
                    <input type="text" name="page" value={formData.page || ''} onChange={handleChange} className={inputClasses} placeholder="Page (ex: p. 42)" />
                </div>
                <input type="text" name="title" value={formData.title || ''} onChange={handleChange} className={inputClasses} placeholder="Titre de l'élément" />
                <textarea name="description" rows={3} value={formData.description || ''} onChange={handleChange} className={`${inputClasses} resize-y`} placeholder="Description / Contenu..."></textarea>
                <div className="flex justify-end items-center gap-2 pt-1">
                    <Button onClick={handleCancel} variant="secondary" size="sm">Annuler</Button>
                    <Button onClick={handleSave} variant="primary" size="sm">Enregistrer</Button>
                </div>
            </div>
            <div className="w-full md:w-[15%] p-2 flex items-start">
                <textarea name="remark" rows={2} value={formData.remark || ''} onChange={handleChange} className={`${inputClasses} resize-y h-full`} placeholder="Remarque..."></textarea>
            </div>
        </div>
    );
};


interface MainTableProps {
  lessonsData: LessonsData;
  onCellUpdate: (indices: Indices, field: string, value: any) => void;
  onDeleteItem: (indices: Indices) => void;
  onDeleteSeparator: (indices: Indices) => void;
  onOpenAddContentModal: (indices?: Indices) => void;
  showDescriptions: boolean;
  selectedIndices: Indices | null;
  onSelectRow: (indices: Indices) => void;
  editingIndices: Indices | null;
  onInitiateInlineEdit: (indices: Indices) => void;
  onConfirmInlineEdit: (indices: Indices, updatedData: Partial<LessonItem>) => void;
  onCancelInlineEdit: () => void;
  newlyAddedIds: string[];
}

interface FlatDataItem {
    data: TopLevelItem | Section | SubSection | SubSubSection | LessonItem | Separator | EmbeddableTopLevelItem;
    indices: Indices;
    elementType: ElementType;
    key: string;
}


const TableHeader: React.FC = React.memo(() => (
  <div className="sticky top-0 z-10 print:static bg-slate-50/80 backdrop-blur-sm hidden md:block">
    <div className="flex border-b-2 border-slate-300">
      <div className="w-[15%] p-3 font-semibold text-center uppercase text-xs text-slate-500 tracking-wider border-r border-slate-200">Date</div>
      <div className="w-[70%] p-3 font-semibold text-center uppercase text-xs text-slate-500 tracking-wider border-r border-slate-200">Contenu</div>
      <div className="w-[15%] p-3 font-semibold text-center uppercase text-xs text-slate-500 tracking-wider">Remarque</div>
    </div>
  </div>
));

export const MainTable: React.FC<MainTableProps> = ({ lessonsData, onOpenAddContentModal, showDescriptions, selectedIndices, onSelectRow, editingIndices, newlyAddedIds, ...props }) => {
  const flatData = useMemo(() => {
    const result: FlatDataItem[] = [];
    
    const processElement = (
        element: any,
        indices: Indices,
        elementType: ElementType
    ): void => {
        const key = JSON.stringify(indices);
        
        result.push({ data: element, indices, elementType, key });

        if (element.sections?.length > 0) {
            element.sections.forEach((sec: Section, i: number) => 
                processElement(sec, { ...indices, sectionIndex: i }, 'section')
            );
        }
        if (element.subsections?.length > 0) {
            element.subsections.forEach((sub: SubSection, i: number) => 
                processElement(sub, { ...indices, subsectionIndex: i }, 'subsection')
            );
        }
        if (element.subsubsections?.length > 0) {
            element.subsubsections.forEach((ssub: SubSubSection, i: number) => 
                processElement(ssub, { ...indices, subsubsectionIndex: i }, 'subsubsection')
            );
        }
        if (element.items?.length > 0) {
            element.items.forEach((item: LessonItem | EmbeddableTopLevelItem, i: number) => {
                // IMPORTANT: Ne pas réutiliser chapterIndex pour des blocs top-level intégrés.
                // On conserve le chemin hiérarchique puis on place l'élément dans itemIndex.
                // On garde toutefois son type (évaluation, devoir, etc.) pour l'affichage stylé dans TableRow.
                if (item.type === 'chapter') {
                    // (Cas rare si un chapitre était imbriqué) – on le traite comme un item avec style de chapitre.
                    processElement(
                        item,
                        { ...indices, itemIndex: i },
                        'chapter'
                    );
                } else if (TOP_LEVEL_TYPE_CONFIG.hasOwnProperty(item.type)) {
                    // Blocs évaluations/contrôles intégrés: indices via itemIndex
                    processElement(
                        item,
                        { ...indices, itemIndex: i },
                        item.type as ElementType
                    );
                } else {
                    // Éléments standards
                    processElement(
                        item,
                        { ...indices, itemIndex: i },
                        'item'
                    );
                }
            });
        }
        
        if (element.separatorAfter) {
            result.push({ 
                data: element.separatorAfter, 
                indices: { ...indices, isSeparator: true },
                elementType: 'separator', 
                key: `${key}-separator`
            });
        }
    };

    lessonsData.forEach((topLevelItem, index) => {
        processElement(
            topLevelItem,
            { chapterIndex: index },
            topLevelItem.type
        );
    });

    return result;
  }, [lessonsData]);

  if (!lessonsData || lessonsData.length === 0) {
      return (
          <div className="text-center p-10 border-2 border-dashed border-slate-300 rounded-lg">
              <i className="fas fa-book-open text-5xl text-slate-400 mb-4"></i>
              <h3 className="text-xl font-semibold text-slate-600">Le cahier de textes est vide.</h3>
              <p className="text-slate-500 mt-2 mb-4">Commencez par ajouter du contenu.</p>
              <Button onClick={() => onOpenAddContentModal()}>
                <i className="fas fa-plus mr-2"></i> Créer un chapitre
              </Button>
          </div>
      )
  }

  return (
    <div className="md:bg-white md:border md:border-slate-200 md:shadow-md rounded-b-lg">
      <TableHeader />
      <div>
          {(() => {
              let lastDate: string | undefined = undefined;
              return flatData.map((item) => {
                  if (item.elementType === 'separator') {
                      const originalItemIndices = item.indices;
                      const isNew = !!(item.data._tempId && newlyAddedIds.includes(item.data._tempId));
                      return (
                          <SeparatorRow
                              key={item.key}
                              data={item.data as Separator}
                              indices={originalItemIndices}
                              onCellUpdate={props.onCellUpdate}
                              onDelete={() => props.onDeleteSeparator(originalItemIndices)}
                              isNew={isNew}
                          />
                      );
                  }
                  
                  const isEditing = editingIndices ? JSON.stringify(editingIndices) === JSON.stringify(item.indices) : false;

                  if (isEditing && item.elementType === 'item') {
                      return (
                          <InlineEditRow
                              key={`${item.key}-edit`}
                              data={item.data as LessonItem}
                              onSave={(updatedData) => props.onConfirmInlineEdit(item.indices, updatedData)}
                              onCancel={props.onCancelInlineEdit}
                          />
                      )
                  }
                  
                  const currentDate = item.data.date;
                  const isNewDate = currentDate && currentDate !== lastDate;
                  if (isNewDate) {
                      lastDate = currentDate;
                  }
                  
                  const isSelected = selectedIndices ? JSON.stringify(selectedIndices) === JSON.stringify(item.indices) : false;
                  const isNew = !!(item.data._tempId && newlyAddedIds.includes(item.data._tempId));

                  return (
                      <React.Fragment key={item.key}>
                          {isNewDate && (
                              <div className="md:block hidden py-2">
                                  <div className="border-t-2 border-slate-300"></div>
                              </div>
                          )}
                          <TableRow
                              data={item.data}
                              indices={item.indices}
                              elementType={item.elementType}
                              onCellUpdate={props.onCellUpdate}
                              onDeleteItem={props.onDeleteItem}
                              onSelectRow={onSelectRow}
                              isSelected={isSelected}
                              isNew={isNew}
                              showDescriptions={showDescriptions}
                              onInitiateInlineEdit={props.onInitiateInlineEdit}
                              onOpenAddContentModal={onOpenAddContentModal}
                          />
                      </React.Fragment>
                  );
              });
          })()}
      </div>
    </div>
  );
};
