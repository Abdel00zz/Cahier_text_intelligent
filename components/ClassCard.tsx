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

    return (
        <div 
            className="group relative rounded-xl border border-slate-200/50 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col aspect-[5/3]"
            style={{ backgroundColor: classInfo.color }}
            onClick={onSelect}
        >
            {/* Gradient Overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>

            <div className="relative flex flex-col h-full p-4 text-white">
                {/* Subject badge top-right */}
                <div className="absolute top-3 right-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/20 text-white backdrop-blur-md shadow-sm border border-white/30">
                        <i className="fas fa-book-open text-xs"></i>
                        <span>{classInfo.subject}</span>
                    </div>
                </div>
                
                {/* Class Name (Main Content) - centered */}
                <div className="flex-grow flex items-center justify-center text-center">
                    <h3 className={`font-extrabold break-words leading-tight tracking-tight ${isArabic ? 'font-ar text-4xl' : 'font-slab text-3xl'} text-shadow-lg`}>
                        {classInfo.name}
                    </h3>
                </div>

                {/* Last Modified chip */}
                <div className="flex-shrink-0 text-center pb-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/25 text-white/90 backdrop-blur-sm">
                        <i className="fas fa-history"></i>
                        <span>{formatDate(lastModified)}</span>
                    </div>
                </div>
            </div>

            {/* Delete Button (visible on hover) - Moved to top-left */}
            <button 
                onClick={handleDeleteClick}
                className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center bg-black/30 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 hover:scale-110 z-10"
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