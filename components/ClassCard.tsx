import { memo, MouseEvent, FC } from 'react';
import { ClassInfo } from '../types';
import { SUBJECT_ABBREV_MAP } from '../constants';
import { getSubjectTextColor } from '../utils/subjectColors';

// Fonction pour obtenir des couleurs créatives pour les matières
const getCreativeSubjectColor = (subject: string): string => {
    const colorMap: { [key: string]: string } = {
        'Mathématiques': '#8B5CF6', // Violet
        'الرياضيات': '#8B5CF6',
        'Physique': '#06B6D4', // Cyan
        'Physique-Chimie': '#06B6D4',
        'Sciences de la Vie et de la Terre': '#10B981', // Emerald
        'علوم الحياة والأرض': '#10B981',
        'SVT': '#10B981',
        'Chimie': '#F59E0B', // Amber
        'Français': '#EF4444', // Red
        'Anglais': '#3B82F6', // Blue
        'Arabe': '#EC4899', // Pink
        'العربية': '#EC4899',
        'Histoire': '#A855F7', // Purple
        'Géographie': '#059669', // Emerald-600
        'Philosophie': '#7C2D12', // Orange-900
        'Informatique': '#1F2937', // Gray-800
        'Sport': '#DC2626', // Red-600
        'Arts': '#BE185D' // Pink-700
    };
    return colorMap[subject] || '#6B7280'; // Gray-500 par défaut
};

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
    const displaySubject = SUBJECT_ABBREV_MAP[classInfo.subject] || classInfo.subject;
    const subjectColor = getSubjectTextColor(classInfo.subject);

    return (
        <div 
            className="group relative rounded-2xl cursor-pointer overflow-hidden flex flex-col aspect-[3/2] sm:aspect-[4/3] bg-white shadow-md hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-1 border border-gray-100"
            onClick={onSelect}
            style={{
                background: `linear-gradient(135deg, ${classInfo.color || '#0f766e'}15 0%, ${classInfo.color || '#0f766e'}08 100%)`
            }}
        >
            <div className="relative flex flex-col h-full p-4 z-10">
                {/* Delete Button - Material Design */}
                <button 
                    onClick={handleDeleteClick}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 text-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:scale-105 z-20 shadow-sm"
                    data-tippy-content="Supprimer la classe"
                    aria-label="Supprimer la classe"
                >
                    <i className="fas fa-times text-xs"></i>
                </button>

                {/* Header with Subject Badge */}
                <div className="flex justify-center mb-4">
                    <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" 
                         style={{
                             background: `linear-gradient(135deg, ${getCreativeSubjectColor(classInfo.subject)}20 0%, ${getCreativeSubjectColor(classInfo.subject)}40 100%)`,
                             color: getCreativeSubjectColor(classInfo.subject),
                             border: `1px solid ${getCreativeSubjectColor(classInfo.subject)}30`
                         }}>
                        <span className={isSubjectArabic ? 'font-ar' : 'font-medium'}>
                            {displaySubject}
                        </span>
                    </div>
                </div>

                {/* Main Content - Centered */}
                <div className="flex-grow flex flex-col justify-center items-center text-center">
                    <h3 className={`text-gray-900 font-semibold leading-tight mb-2 ${isArabic ? 'font-ar text-xl' : 'text-lg'}`}>
                        {formatSuperscript(classInfo.name)}
                    </h3>
                </div>

                {/* Footer with Last Modified */}
                <div className="mt-auto pt-3 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-500">
                        <i className="fas fa-clock mr-2 text-gray-400"></i>
                        <span>{formatDate(lastModified)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Export memoized component for performance
export const ClassCard = memo(ClassCardComponent);