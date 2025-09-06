import React from 'react';
import { MathJax } from 'better-react-mathjax';
import { Indices, LessonItem, TopLevelItem, ElementType, TopLevelType } from '../types';
import { TYPE_MAP, BADGE_TEXT_MAP, BADGE_COLOR_MAP, TOP_LEVEL_TYPE_CONFIG } from '../constants';
import { EditableTitle } from './ui/EditableTitle';
import { EditableCell } from './ui/EditableCell';
import { formatModernDate } from '../utils/dataUtils';

interface ContentRendererProps {
  data: any;
  indices: Indices;
  elementType: ElementType;
  onCellUpdate: (indices: Indices, field: string, value: any) => void;
  isPrint?: boolean;
  showDescriptions?: boolean;
}

export const ContentRenderer: React.FC<ContentRendererProps> = React.memo(({ data, indices, elementType, onCellUpdate, isPrint = false, showDescriptions = true }) => {
  const handleUpdate = (field: string) => (value: string) => {
    onCellUpdate(indices, field, value);
  };
  
  if (elementType in TOP_LEVEL_TYPE_CONFIG) {
    const item = data as TopLevelItem;
    const config = TOP_LEVEL_TYPE_CONFIG[item.type as TopLevelType];

    if (!config) {
        console.error("ContentRenderer Error: Invalid top-level item type encountered.", { data });
        return (
            <div className="text-lg font-bold font-slab text-center py-3 text-red-500 flex items-center justify-center gap-3">
                <i className="fas fa-exclamation-triangle"></i>
                <span>Erreur: Type de contenu inconnu</span>
            </div>
        );
    }
    
    const isCorrection = item.type.startsWith('correction_');

    if (isPrint) {
      // Afficher les chapitres et évaluations de la même manière
      if (item.type === 'chapter' || TOP_LEVEL_TYPE_CONFIG.hasOwnProperty(item.type)) {
        const printIndent = isCorrection ? 'pl-4' : '';
        const isCentered = ['evaluation_diagnostic', 'devoir_maison', 'controle_continu', 'correction_devoir_maison', 'correction_controle_continu'].includes(item.type);
        
        // Nettoyer le titre pour enlever le préfixe de type si présent
        let titleToDisplay = item.title || config.name;
        const typePrefix = item.type.toUpperCase();
        if (titleToDisplay.startsWith(typePrefix)) {
          titleToDisplay = titleToDisplay.substring(typePrefix.length).trim();
          if (!titleToDisplay) {
            titleToDisplay = config.name;
          }
        }

        return (
          <div className={`font-bold font-slab text-lg flex items-center justify-center gap-3 ${config.color} ${printIndent}`} style={{ textAlign: 'center', width: '100%' }}>
            <i className={config.icon}></i>
            <span>{titleToDisplay}</span>
          </div>
        );
      }

      // Pour les autres types d'éléments
      let titleToDisplay = item.title || config.name;
      const typePrefix = item.type.toUpperCase();
      if (titleToDisplay.startsWith(typePrefix)) {
        titleToDisplay = titleToDisplay.substring(typePrefix.length).trim();
        if (!titleToDisplay) {
          titleToDisplay = config.name;
        }
      }
      
      return (
        <div className="font-bold font-slab text-lg">
          {titleToDisplay}
        </div>
      );
    }

    const isEvaluation = ['evaluation_diagnostic', 'devoir_maison', 'controle_continu', 'correction_devoir_maison', 'correction_controle_continu'].includes(item.type);
    const isCenteredInApp = isEvaluation;
    
    let indentClass = '';
    // Ne pas appliquer d'indentation pour les chapitres et évaluations de premier niveau
    if (indices.itemIndex !== undefined) {
        if (indices.subsubsectionIndex !== undefined) indentClass = 'md:pl-12';
        else if (indices.subsectionIndex !== undefined) indentClass = 'md:pl-8';
        else if (indices.sectionIndex !== undefined) indentClass = 'md:pl-4';
    }

    const isTopLevel = item.type === 'chapter' || isEvaluation;
    const textClasses = isCorrection ? 'text-base font-semibold' : 'text-lg font-bold';
    const justificationClass = isTopLevel ? 'justify-center' : '';
    
    if (isCorrection) {
      indentClass = 'md:pl-4';
    }

    return (
      <div className={`${textClasses} font-slab py-1 flex items-center gap-3 ${config.color} ${indentClass} ${isCenteredInApp ? 'justify-center' : justificationClass}`}>
          <i className={config.icon}></i>
          <EditableTitle value={item.title} onSave={handleUpdate('title')} />
      </div>
    );
  }

  switch (elementType) {
    case 'section':
      const sectionLetter = String.fromCharCode(65 + (indices.sectionIndex ?? 0));
      return (
        <MathJax hideUntilTypeset="first" key={data.name}>
            <div className="text-base font-semibold font-slab text-slate-800 py-1.5 flex items-baseline gap-2">
                <span>{sectionLetter}.</span>
                <EditableTitle value={data.name} onSave={handleUpdate('name')} />
            </div>
        </MathJax>
      );
    case 'subsection':
      return (
        <MathJax hideUntilTypeset="first" key={data.name}>
            <div className="text-sm font-semibold font-slab text-slate-700 pl-2 sm:pl-4 py-0.5 flex items-baseline gap-2">
                <span>{indices.subsectionIndex! + 1}.</span>
                <EditableTitle value={data.name} onSave={handleUpdate('name')} />
            </div>
        </MathJax>
      );
    case 'subsubsection':
      const roman = ['i', 'ii', 'iii', 'iv', 'v'];
      return (
        <MathJax hideUntilTypeset="first" key={data.name}>
            <div className="text-sm italic font-slab text-teal-800 pl-4 sm:pl-8 py-0.5 flex items-baseline gap-2">
                <span>{roman[indices.subsubsectionIndex!] || (indices.subsubsectionIndex! + 1)}.</span>
                <EditableTitle value={data.name} onSave={handleUpdate('name')} />
            </div>
        </MathJax>
      );
    case 'item':
      const item = data as LessonItem;
      const normalizedType = TYPE_MAP[(item.type || '').toLowerCase()] || item.type;
      const badgeText = BADGE_TEXT_MAP[normalizedType] || normalizedType;
      const badgeColor = BADGE_COLOR_MAP[normalizedType] || 'bg-slate-200 text-slate-800';
      const isInlineTitleType = ['exercice', 'exemple', 'application'].includes(normalizedType);

      const content = (
          <div className="prose prose-sm max-w-none text-sm text-slate-700 space-y-1">
              {isInlineTitleType ? (
                  <div className="flex items-baseline gap-1">
                      <EditableCell value={item.title || ''} onSave={handleUpdate('title')} className="font-semibold text-slate-800 p-0" placeholder="Titre..." />
                      {showDescriptions && item.description && (
                        <span className="ml-1">{item.description}</span>
                      )}
                  </div>
              ) : (
                  <>
                      <EditableCell value={item.title || ''} onSave={handleUpdate('title')} className="font-semibold text-slate-800 p-0" placeholder="Titre..." />
                      {showDescriptions && item.description && (
                        <div className="whitespace-pre-wrap pt-1">{item.description}</div>
                      )}
                  </>
              )}
              {item.page && 
                <div className="flex items-center gap-1 text-xs text-slate-500 italic">
                  <span>(p.</span>
                  <EditableCell value={String(item.page || '')} onSave={handleUpdate('page')} className="p-0" placeholder="page" />
                  <span>)</span>
                </div>
              }
          </div>
      );
      
      const contentKey = `${item.type || ''}-${item.number || ''}-${item.title || ''}-${item.description || ''}-${item.page || ''}`;

      // Toujours MathJax en print pour compiler les formules
      return (
        <div className="flex items-baseline gap-2 pl-6 sm:pl-12 py-1">
          <span className={`flex-shrink-0 select-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${badgeColor} ${isPrint ? 'badge-print' : ''}`}>
            {badgeText} {item.number || ''}
          </span>
          <div className="flex-grow min-w-0">
            <MathJax hideUntilTypeset="first" key={contentKey}>{content}</MathJax>
          </div>
        </div>
      );
    default:
      return null;
  }
});
