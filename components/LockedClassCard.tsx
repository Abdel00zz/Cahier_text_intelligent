import React from 'react';
import { SUBJECT_ABBREV_MAP, getSubjectBandClass } from '../constants';
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

interface LockedClassCardProps {
    name: string;
    subject: string;
    color: string;
    onContactAdmin: () => void;
    onDelete: () => void;
}

const formatSuperscript = (text: string) => {
    const parts = text.split(/(\d+(?:er|ère|ème))/); 
    return parts.map((part, index) => {
        if (part.endsWith('er')) {
            return <span key={index}>{part.slice(0, -2)}<sup>er</sup></span>;
        }
        if (part.endsWith('ère')) {
            return <span key={index}>{part.slice(0, -3)}<sup>ère</sup></span>;
        }
        if (part.endsWith('ème')) {
            return <span key={index}>{part.slice(0, -3)}<sup>ème</sup></span>;
        }
        return part;
    });
};

const LockedClassCard: React.FC<LockedClassCardProps> = ({ name, subject, color, onContactAdmin, onDelete }) => {
    // Helper to detect Arabic for font switching
    const isArabic = /[\u0600-\u06FF]/.test(name);
    const isSubjectArabic = /[\u0600-\u06FF]/.test(subject);
    // Determine display text for subject badge
    const displaySubject = SUBJECT_ABBREV_MAP[subject] || subject;
    const subjectColor = getSubjectTextColor(subject);

    return (
        <div 
            className="group relative rounded-2xl cursor-pointer overflow-hidden flex flex-col aspect-[3/2] sm:aspect-[4/3] bg-gradient-to-br from-amber-50 to-orange-50 shadow-md hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-1 border border-amber-200"
            onClick={onContactAdmin}
        >
            {/* Premium overlay pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${color}20 10px, ${color}20 20px)`
                }}></div>
            </div>

            <div className="relative flex flex-col h-full p-3 sm:p-4 z-10">
                {/* Delete Button - Material Design */}
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 text-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:scale-105 z-20 shadow-sm"
                    data-tippy-content="Supprimer cette carte"
                    aria-label="Supprimer cette carte"
                >
                    <i className="fas fa-times text-xs"></i>
                </button>

                {/* Header with Subject Badge */}
                <div className="flex justify-center mb-4">
                    <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" 
                         style={{
                             background: `linear-gradient(135deg, ${getCreativeSubjectColor(subject)}20 0%, ${getCreativeSubjectColor(subject)}40 100%)`,
                             color: getCreativeSubjectColor(subject),
                             border: `1px solid ${getCreativeSubjectColor(subject)}30`
                         }}>
                        <span className={isSubjectArabic ? 'font-ar' : 'font-medium'}>
                            {displaySubject}
                        </span>
                    </div>
                </div>
                
                {/* Main Content - Centered */}
                <div className="flex-grow flex flex-col justify-center items-center text-center">
                    <h3 className={`text-gray-900 font-semibold leading-tight ${isArabic ? 'font-ar text-xl' : 'text-lg'}`}>
                        {formatSuperscript(name)}
                    </h3>
                </div>

                {/* Footer with Action */}
                <div className="mt-auto pt-3 border-t border-amber-100">
                    <div className="flex items-center justify-center text-xs text-amber-700 font-medium">
                        <i className="fas fa-lock mr-2"></i>
                        <span>Cliquez pour débloquer</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LockedClassCard;
