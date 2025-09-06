import React, { useMemo } from 'react';
import { MathJax } from 'better-react-mathjax';
import { ContentRenderer } from './ContentRenderer';
// FIX: Removed inline type definitions and imported them from the central types file.
import { 
    LessonsData, 
    ClassInfo,
    TopLevelItem, 
    Section, 
    SubSection, 
    SubSubSection, 
    LessonItem, 
    Indices, 
    ElementType,
    Separator,
    AppConfig
} from '../types';
import { TOP_LEVEL_TYPE_CONFIG } from '../constants';
import { formatModernDate, formatDateDDMMYYYY } from '../utils/dataUtils';

// Props interfaces
interface PrintViewProps {
    lessonsData: LessonsData;
    classInfo: ClassInfo;
    config: AppConfig;
    newlyAddedIds: string[];
}

interface FlatDataItem {
    // FIX: Added Separator to the union type to correctly type separator data.
    data: TopLevelItem | Section | SubSection | SubSubSection | LessonItem | Separator;
    indices: Indices;
    elementType: ElementType;
}

// Main component
export const PrintView: React.FC<PrintViewProps> = ({ lessonsData, classInfo, config, newlyAddedIds }) => {
    
    const flatData = useMemo(() => {
        const result: FlatDataItem[] = [];
        
        const processElement = (
            element: any,
            indices: Indices,
            elementType: ElementType
        ): void => {
            // Add the current element to results (skip separators)
            if (elementType !== 'separator') {
                result.push({ data: element, indices, elementType });
            }

            // Process all child collections independently
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
                element.items.forEach((item: any, i: number) => {
                // Traiter les chapitres et évaluations de la même manière
                if (item.type === 'chapter' || TOP_LEVEL_TYPE_CONFIG.hasOwnProperty(item.type)) {
                    processElement(
                        item,
                        { ...indices, chapterIndex: i },
                        item.type as ElementType
                    );
                } else {
                    // Traiter les éléments standards
                    processElement(
                        item,
                        { ...indices, itemIndex: i },
                        'item'
                    );
                }
            });
            }

            // Process separator if it exists
            if (element.separatorAfter) {
                result.push({ 
                    data: element.separatorAfter, 
                    // FIX: Added isSeparator to conform to the Indices type definition.
                    indices: { ...indices, isSeparator: true }, 
                    elementType: 'separator' 
                });
            }
        };

        // Process all top-level items
        lessonsData.forEach((topLevelItem, index) => {
            processElement(
                topLevelItem,
                { chapterIndex: index },
                topLevelItem.type
            );
        });

        return result;
    }, [lessonsData]);
    
    const formatSeparatorDate = (dateString: string): string => {
        const ddmmyyyy = formatDateDDMMYYYY(dateString);
        return ddmmyyyy || '';
    };


    return (
        <div className="print-only" style={{ display: 'none' }}>
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 1.5cm 1cm;
                        @bottom-center {
                            content: "Page " counter(page);
                            font-size: 8pt;
                            color: #6b7280;
                        }
                    }

                    .print-hidden { display: none !important; }
                    .print-only { display: block !important; }
                    body { 
                        font-size: 10.5pt; 
                        margin: 0;
                        padding: 0;
                        background: white !important;
                        line-height: 1.18; /* more compact lines */
                    }
                    p {
                        orphans: 3;
                        widows: 3;
                    }
                    .print-table tr {
                        page-break-inside: avoid !important;
                    }
                    .print-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 0;
                        padding: 0;
                    }
                    .print-table th,
                    .print-table td {
                        border: none !important;
                        padding: 1px 4px; /* tighter padding */
                        vertical-align: top;
                        text-align: left;
                        font-size: 8.5pt;
                        line-height: 1.18; /* compact in cells */
                        border-right: 1px solid #e5e7eb !important; /* gray-200 */
                    }
                    .print-table th:last-child, 
                    .print-table td:last-child {
                        border-right: none !important;
                    }

                    .print-table th {
                        font-weight: bold;
                        font-size: 9pt;
                        text-transform: uppercase;
                        border-bottom: 1.5px solid #6b7280 !important;
                        text-align: center !important;
                    }
                    .print-col-date { width: 8%; text-align: center; vertical-align: middle; }
                    .print-col-content { width: 77%; }
                    .print-col-remark { width: 15%; font-size: 7.5pt; }

                    /* Style for rows that start a new date (use cell borders with border-collapse) */
                    .new-date-row > td {
                        border-top: 1px solid #d1d5db !important; /* gray-300 */
                        padding-top: 3px !important; /* reduce top gap */
                    }
                    
                    /* Ensure chapter rows always show a border regardless of date */
                    .print-chapter-row > td {
                        border-top: 1px solid #d1d5db !important; /* gray-300 */
                    }
                    
                    /* Modern, fluid style for manual separators */
                    .print-separator-cell {
                        padding: 10px 0 !important;
                    }
                    .separator-content {
                        display: flex;
                        align-items: center;
                        width: 100%;
                        color: #374151; /* gray-700 */
                    }
                    .separator-line {
                        flex-grow: 1;
                        height: 1px;
                        background-color: #d1d5db; /* gray-300 */
                    }
                    .separator-text {
                        flex-shrink: 0;
                        padding: 0 1.5em;
                        font-size: 8pt;
                        font-weight: bold;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    }
                    
                    /* New Chapter styling */
                    .print-chapter-row {
                        page-break-before: auto;
                        page-break-after: avoid;
                        page-break-inside: avoid !important;
                    }
                    .print-chapter-row > td {
                        padding: 6px 4px 2px 4px !important; /* tighter */
                        border-bottom: none !important;
                        border-top: none !important;
                        text-align: center !important;
                    }
                    .print-chapter-row .print-col-content {
                        text-align: center !important;
                    }
                    .print-chapter-row .font-slab {
                        font-size: 14pt !important;
                        font-weight: bold !important;
                        color: #dc2626 !important; /* red-600 */
                    }

                    /* Header styling */
                    .print-header {
                        text-align: center;
                        margin-bottom: 12px;
                        padding-bottom: 8px;
                        border-bottom: 2px solid #374151; /* gray-700 */
                    }
                    .print-header h1 {
                        font-size: 11pt;
                        font-weight: bold;
                        margin: 0 0 4px 0;
                    }
                    .print-header h2 {
                        font-size: 14pt;
                        font-weight: bold;
                        margin: 0 0 4px 0;
                        font-family: 'Roboto Slab', serif;
                    }
                    .print-header h3 {
                        font-size: 10pt;
                        font-weight: normal;
                        margin: 0;
                        color: #4b5563; /* gray-600 */
                    }
                    /* Tighten content spacing inside content column */
                    .print-col-content p { margin: 0 0 2px 0; line-height: 1.18; }
                    .print-col-content h1,
                    .print-col-content h2,
                    .print-col-content h3 { margin: 4px 0 2px 0; line-height: 1.18; }
                    .print-col-content ul,
                    .print-col-content ol { margin: 0 0 3px 1.05em; padding-left: 1.05em; }
                    .print-col-content li { margin: 0 0 1px 0; line-height: 1.18; }
                }
            `}</style>
            
            {/* Header Section */}
            <div className="print-header">
                {config.establishmentName && (
                  <h1>{config.establishmentName}</h1>
                )}
                <h2>Cahier de Textes : {classInfo.teacherName || 'Non spécifié'}</h2>
                <h3>Classe: {classInfo.name || 'Non spécifiée'}</h3>
            </div>
            
            {/* Table */}
            <table className="print-table">
                <thead>
                    <tr>
                        <th className="print-col-date">Date</th>
                        <th className="print-col-content">Contenu</th>
                        <th className="print-col-remark">Remarque</th>
                    </tr>
                </thead>
                <tbody>
                    {flatData.length > 0 ? (
                        (() => {
                            let lastPrintedDate: string | null = null;
                            
                            return flatData.map((item, index) => {
                                const currentDate = item.data.date;
                                const isNew = !!(item.data._tempId && newlyAddedIds.includes(item.data._tempId));

                                if (item.elementType === 'separator') {
                                    const separatorData = item.data as Separator;
                                    const formattedDate = formatSeparatorDate(separatorData.date);
                                    const rowClassName = isNew ? 'new-item-print-highlight' : '';
                                    return (
                                        <tr key={`separator-${index}`} className={rowClassName}>
                                            <td colSpan={3} className="print-separator-cell">
                                                <div className="separator-content">
                                                    <span className="separator-line"></span>
                                                    <span className="separator-text">
                                                        {separatorData.content || '---'}
                                                        {formattedDate && ` | ${formattedDate}`}
                                                    </span>
                                                    <span className="separator-line"></span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }

                                // LOGIQUE UNIFIÉE: vérifier le changement de date pour TOUS les types d'éléments
                                const isNewDate = currentDate && currentDate !== lastPrintedDate;
                                if (isNewDate) {
                                    lastPrintedDate = currentDate;
                                }

                                const isChapter = item.elementType === 'chapter';
                                const compact = currentDate ? formatDateDDMMYYYY(currentDate) : null;
                                
                                if (isChapter) {
                                    const classNames: string[] = ['print-chapter-row'];
                                    if (isNewDate) classNames.push('new-date-row');
                                    if (isNew) classNames.push('new-item-print-highlight');
                                    const rowClassName = classNames.join(' ');

                                    return (
                                        <tr key={`content-${JSON.stringify(item.indices)}-${index}`} className={rowClassName}>
                                            {/* FORCE border-top sur la première cellule pour les chapitres avec nouvelle date */}
                                            <td className="print-col-date" style={{ 
                                                textAlign: 'center',
                                                borderTop: '1px solid #d1d5db !important',
                                                paddingTop: '6px'
                                            }}>
                                                {compact || ''}
                                            </td>
                                            <td className="print-col-content" style={{
                                                borderTop: '1px solid #d1d5db !important',
                                                paddingTop: '6px'
                                            }}>
                                                <MathJax hideUntilTypeset="first">
                                                    <ContentRenderer 
                                                        data={item.data} 
                                                        indices={item.indices} 
                                                        elementType={item.elementType} 
                                                        isPrint={true} 
                                                        showDescriptions={config.printShowDescriptions}
                                                        onCellUpdate={() => {}}
                                                    />
                                                </MathJax>
                                            </td>
                                            <td className="print-col-remark" style={{
                                                borderTop: '1px solid #d1d5db !important',
                                                paddingTop: '6px'
                                            }}></td>
                                        </tr>
                                    );
                                }
                                
                                // Éléments non-chapitre
                                let classNames = [];
                                if(isNewDate) classNames.push('new-date-row');
                                if(isNew) classNames.push('new-item-print-highlight');
                                
                                const rowClassName = classNames.join(' ');
                                const displayDate = isNewDate ? compact : null;
                                
                                return (
                                    <tr key={`content-${JSON.stringify(item.indices)}-${index}`} className={rowClassName}>
                                        <td className="print-col-date" style={{ 
                                            textAlign: 'center',
                                            borderTop: isNewDate ? '1px solid #d1d5db !important' : 'none'
                                        }}>
                                            {displayDate || ''}
                                        </td>
                                        <td className="print-col-content" style={{
                                            borderTop: isNewDate ? '1px solid #d1d5db !important' : 'none'
                                        }}>
                                            <MathJax hideUntilTypeset="first">
                                                <ContentRenderer 
                                                    data={item.data} 
                                                    indices={item.indices} 
                                                    elementType={item.elementType} 
                                                    isPrint={true} 
                                                    showDescriptions={config.printShowDescriptions}
                                                    onCellUpdate={() => {}}
                                                />
                                            </MathJax>
                                        </td>
                                        <td className="print-col-remark" style={{
                                            borderTop: isNewDate ? '1px solid #d1d5db !important' : 'none'
                                        }}>
                                            {item.data.remark || ''}
                                        </td>
                                    </tr>
                                );
                            });
                        })()
                    ) : (
                        <tr>
                            <td colSpan={3} style={{ textAlign: 'center', fontStyle: 'italic', padding: '20px' }}>
                                Aucun contenu à afficher
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};