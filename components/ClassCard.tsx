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
    const subjectColor = getCreativeSubjectColor(classInfo.subject);

    return (
        <div 
            className="relative bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-auto min-h-[10rem] cursor-pointer border border-slate-100"
            onClick={() => onSelect()}
        >
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center bg-white/80 text-gray-500 rounded-full opacity-90 hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:text-red-600 active:bg-red-100 z-20 shadow-sm"
                data-tippy-content="Supprimer cette classe"
                aria-label="Supprimer cette classe"
            >
                <i className="fas fa-times text-base"></i>
            </button>

            {/* Header with Subject Badge */}
            <div className="flex justify-center mt-4 mb-2">
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" 
                     style={{
                         background: `linear-gradient(135deg, ${subjectColor}20 0%, ${subjectColor}40 100%)`,
                         color: subjectColor,
                         border: `1px solid ${subjectColor}30`
                     }}>
                    <span className={isSubjectArabic ? 'font-ar' : 'font-medium'}>
                        {displaySubject}
                    </span>
                </div>
            </div>
            
            {/* Main Content - Centered */}
            <div className="flex-grow flex flex-col justify-center items-center text-center px-4 py-3">
                <h3 className={`text-gray-900 font-semibold leading-tight ${isArabic ? 'font-ar text-xl' : 'text-lg'}`}>
                    {formatSuperscript(classInfo.name)}
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                    {classInfo.teacherName}
                </p>
            </div>

            {/* Footer with Last Modified Date */}
            <div className="bg-slate-50 py-3 px-3 text-xs text-slate-500 flex items-center justify-between">
                <div className="flex items-center">
                    {lastModified ? (
                        <>
                            <i className="fas fa-history mr-1.5 text-slate-400"></i>
                            <span>Modifié le {formatDate(lastModified)}</span>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-file-alt mr-1.5 text-slate-400"></i>
                            <span>Pas encore de contenu</span>
                        </>
                    )}
                </div>
                {classInfo.isTest && (
                    <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] uppercase font-medium">
                        Test
                    </span>
                )}
            </div>
        </div>
    );
};

// Export memoized component for performance
export const ClassCard = memo(ClassCardComponent);