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
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la classe "${classInfo.name}" ?\n\nCette action est irréversible et supprimera définitivement tous les contenus de cette classe.`)) {
            onDelete();
        }
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
            className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-2 overflow-hidden group flex flex-col"
            style={{
                background: `linear-gradient(135deg, ${classInfo.color}15 0%, ${classInfo.color}08 100%)`,
                borderColor: `${classInfo.color}80`,
                minHeight: '280px'
            }}
            onClick={() => onSelect()}
        >
            {/* Content */}
            <div className="flex-1 flex flex-col p-4 cursor-pointer">
                {/* Delete button - bien placé en haut à droite */}
                <div className="flex justify-end mb-2">
                    <button
                        onClick={handleDeleteClick}
                        className="w-8 h-8 flex items-center justify-center bg-white/90 text-gray-400 rounded-full opacity-80 hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:scale-110 shadow-md z-10"
                        title="Supprimer cette classe"
                        aria-label="Supprimer cette classe"
                    >
                        <i className="fas fa-times text-sm"></i>
                    </button>
                </div>

                {/* Unlocked icon - cadenas déverrouillé vert en haut */}
                <div className="flex items-center justify-center mb-3">
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-300 shadow-lg">
                        <i className="fas fa-unlock text-green-600 text-xl"></i>
                    </div>
                </div>
                
                <div className="text-center mb-4">
                    <h3 className={`font-bold text-lg mb-1 ${isArabic ? 'font-arabic' : ''}`} style={{ color: getSubjectTextColor(classInfo.subject) }}>
                        {formatSuperscript(classInfo.name)}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                        {displaySubject}
                    </p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <i className="fas fa-user mr-1"></i>
                        {classInfo.teacherName}
                    </div>
                </div>



                {/* Status indicator */}
                <div className="mt-auto">
                    <div className="bg-green-50 border border-green-300 rounded-lg p-2 text-center">
                        <p className="text-green-700 font-semibold text-xs uppercase tracking-wide">
                            <i className="fas fa-unlock mr-1"></i>
                            Classe déverrouillée
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Export memoized component for performance
export const ClassCard = memo(ClassCardComponent);