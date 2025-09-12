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
            className="relative bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-auto min-h-[10rem] cursor-pointer border border-slate-100 opacity-80 hover:opacity-100"
            onClick={onContactAdmin}
        >
            {/* Overlay with blur effect */}
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] z-10"></div>

            <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center bg-white/80 text-gray-500 rounded-full opacity-90 hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:text-red-600 active:bg-red-100 z-20 shadow-sm"
                data-tippy-content="Supprimer cette carte"
                aria-label="Supprimer cette carte"
            >
                <i className="fas fa-times text-base"></i>
            </button>

            {/* Header with Subject Badge */}
            <div className="flex justify-center mt-4 mb-2">
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
            <div className="flex-grow flex flex-col justify-center items-center text-center px-4 py-3">
                <h3 className={`text-gray-900 font-semibold leading-tight ${isArabic ? 'font-ar text-xl' : 'text-lg'}`}>
                    {formatSuperscript(name)}
                </h3>
            </div>

            {/* Footer with Action */}
            <div className="bg-slate-50 py-3 px-3 text-xs text-slate-500 flex items-center justify-center border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <i className="fas fa-lock text-amber-500"></i>
                    <span>Cliquez pour débloquer</span>
                </div>
            </div>
        </div>
    );
};

export default LockedClassCard;
