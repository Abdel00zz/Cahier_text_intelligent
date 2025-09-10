import { memo, MouseEvent, FC } from 'react';
import { ClassInfo } from '../types';
import { SUBJECT_ABBREV_MAP, getSubjectBandClass } from '../constants';

interface ClassCardProps {
    classInfo: ClassInfo;
    lastModified: string | null | undefined;
    onSelect: () => void;
    onDelete: () => void;
}

// Helper function to detect Arabic characters
const containsArabic = (text: string): boolean => {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
};

// Helper to render ordinal suffixes (er, ème, etc.) as superscript
const formatSuperscript = (text: string) => {
    const parts = text.split(/(\d+(?:er|ère|ème))/);
    return parts.map((part, idx) => {
        if (part.endsWith('er')) {
            return <span key={idx}>{part.slice(0, -2)}<sup>er</sup></span>;
        }
        if (part.endsWith('ère')) {
            return <span key={idx}>{part.slice(0, -3)}<sup>ère</sup></span>;
        }
        if (part.endsWith('ème')) {
            return <span key={idx}>{part.slice(0, -3)}<sup>ème</sup></span>;
        }
        return part;
    });
};

const ClassCardComponent: FC<ClassCardProps> = ({ classInfo, lastModified, onSelect, onDelete }) => {

    const handleDeleteClick = (e: MouseEvent) => {
        e.stopPropagation();
        onDelete();
    };

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) {
            return "Aucune activité récente";
        }
        try {
            const date = new Date(dateString);
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            const correctedDate = new Date(date.getTime() + userTimezoneOffset);
            
            return `Dernière modif. le ${correctedDate.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })}`;
        } catch {
            return "Date invalide";
        }
    };

    const isArabic = containsArabic(classInfo.name);
    const isSubjectArabic = containsArabic(classInfo.subject);
    // Determine display text for subject badge
    const displaySubject = SUBJECT_ABBREV_MAP[classInfo.subject] || classInfo.subject;

    return (
        <div 
            className={`group relative rounded-xl bg-white shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden flex flex-col aspect-[4/3] sm:aspect-[5/3] border ${getSubjectBandClass(classInfo.subject)}`}
            onClick={onSelect}
        >
            {/* Full band via border/ring from subject color mapping */}

            <div className="relative flex flex-col h-full p-3 sm:p-4 pt-10 sm:pt-8 pb-8 sm:pb-5 text-slate-800">
                {/* Subject badge bottom-right (smaller for Latin/French) */}
                <div className="absolute bottom-3 right-3">
                    {(() => {
                        const sizeClasses = isSubjectArabic
                            ? 'gap-1.5 px-2.5 py-1 text-[11px] font-semibold'
                            : 'gap-1 px-2 py-0.5 text-[10px] font-medium';
                        const iconSize = isSubjectArabic ? 'text-xs' : 'text-[11px]';
                        return (
                            <div className={`inline-flex items-center ${sizeClasses} rounded-full bg-slate-100 text-slate-700 border border-slate-200`}> 
                                <i className={`fas fa-book-open ${iconSize} text-slate-500`}></i>
                                <span className={isSubjectArabic ? 'font-ar' : 'font-chic'}>{displaySubject}</span>
                            </div>
                        );
                    })()}
                </div>
                
                {/* Class Name (Main Content) - centered */}
                <div className="flex-grow flex items-center justify-center text-center px-2">
                    <h3 className={`break-words leading-snug tracking-tight -translate-y-0.5 sm:-translate-y-1 ${isArabic ? 'title-ar text-[1.65rem] font-semibold' : 'title-chic font-merri text-[1.5rem] sm:text-[1.6rem] font-semibold'}`}>
                        {formatSuperscript(classInfo.name)}
                    </h3>
                </div>

                {/* Last Modified chip */}
                <div className="absolute left-3 bottom-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                        <i className="fas fa-history"></i>
                        <span>{formatDate(lastModified)}</span>
                    </div>
                </div>
            </div>

            {/* Delete Button (visible on hover) - top-left subtle */}
            <button 
                onClick={handleDeleteClick}
                className="absolute top-2 left-2 w-8 h-8 sm:w-8 sm:h-8 flex items-center justify-center bg-white text-slate-500 border border-slate-200 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-red-600 hover:border-red-200 z-10"
                data-tippy-content="Supprimer la classe"
                aria-label="Supprimer la classe"
            >
                <i className="fas fa-times text-sm"></i>
            </button>
        </div>
    );
};

// Export memoized component for performance
export const ClassCard = memo(ClassCardComponent);