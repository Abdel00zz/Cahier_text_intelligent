import { memo, MouseEvent, FC } from 'react';
import { ClassInfo } from '../types';

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

    return (
        <div 
            className="group relative rounded-xl border border-slate-200/50 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col aspect-[5/3]"
            style={{ backgroundColor: classInfo.color }}
            onClick={onSelect}
        >
            {/* Gradient Overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>

            <div className="relative flex flex-col h-full p-4 pt-12 sm:pt-8 pb-10 sm:pb-5 text-white">
                {/* Subject badge bottom-right (smaller for Latin/French) */}
                <div className="absolute bottom-3 right-3">
                    {(() => {
                        const sizeClasses = isSubjectArabic
                            ? 'gap-1.5 px-2.5 py-1 text-[11px] font-semibold'
                            : 'gap-1 px-2 py-0.5 text-[9px] font-medium'; // ~40% smaller
                        const iconSize = isSubjectArabic ? 'text-xs' : 'text-[10px]';
                        return (
                            <div className={`inline-flex items-center ${sizeClasses} rounded-full bg-white/20 text-white backdrop-blur-md shadow-sm border border-white/30`}>
                                <i className={`fas fa-book-open ${iconSize}`}></i>
                                <span className={isSubjectArabic ? 'font-ar' : 'font-chic'}>{classInfo.subject}</span>
                            </div>
                        );
                    })()}
                </div>
                
                {/* Class Name (Main Content) - centered */}
                <div className="flex-grow flex items-center justify-center text-center">
                    <h3 className={`font-medium break-words leading-tight tracking-normal -translate-y-0.5 sm:-translate-y-1 ${isArabic ? 'title-ar text-[1.7rem]' : 'title-chic text-[1.45rem] sm:text-[1.6rem]'}`}>
                        {classInfo.name}
                    </h3>
                </div>

                {/* Last Modified chip – raised slightly above bottom */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-12 sm:bottom-10">
                    <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-black/25 text-white/90 backdrop-blur-sm whitespace-nowrap">
                        <i className="fas fa-history"></i>
                        <span>{formatDate(lastModified)}</span>
                    </div>
                </div>
            </div>

            {/* Delete Button (visible on hover) - Moved to top-left */}
            <button 
                onClick={handleDeleteClick}
                className="absolute top-3 left-3 w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center bg-black/30 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 hover:scale-110 z-10"
                data-tippy-content="Supprimer la classe"
                aria-label="Supprimer la classe"
            >
                <i className="fas fa-times text-base sm:text-sm"></i>
            </button>
        </div>
    );
};

// Export memoized component for performance
export const ClassCard = memo(ClassCardComponent);