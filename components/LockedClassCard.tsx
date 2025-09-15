import React from 'react';
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

interface LockedClassCardProps {
    name: string;
    subject: string;
    color: string;
    votes?: number;
    requiredVotes?: number;
    onVote: () => void;
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

const LockedClassCard: React.FC<LockedClassCardProps> = ({ name, subject, color, votes = 0, requiredVotes = 500, onVote, onDelete }) => {
    const progressPercentage = Math.min((votes / requiredVotes) * 100, 100);
    const isUnlockable = votes >= requiredVotes;
    // Helper to detect Arabic for font switching
    const isArabic = /[\u0600-\u06FF]/.test(name);
    const isSubjectArabic = /[\u0600-\u06FF]/.test(subject);
    // Determine display text for subject badge
    const displaySubject = SUBJECT_ABBREV_MAP[subject] || subject;
    const subjectColor = getSubjectTextColor(subject);

    return (
        <div 
            className="w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden group flex flex-col"
            style={{
                background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
                borderColor: `${color}30`,
                minHeight: '280px'
            }}
        >

            
            {/* Content */}
            <div className="flex-1 flex flex-col p-4">
                {/* Delete button - bien placé en haut à droite */}
                <div className="flex justify-end mb-2">
                    <button
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            if (window.confirm(`Êtes-vous sûr de vouloir masquer la classe "${name}" ?\n\nVous pourrez la réafficher depuis le panneau d'administration.`)) {
                                onDelete();
                            }
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-white/90 text-gray-400 rounded-full opacity-80 hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:scale-110 shadow-md z-10"
                        title="Masquer cette carte"
                        aria-label="Masquer cette carte"
                    >
                        <i className="fas fa-times text-sm"></i>
                    </button>
                </div>

                {/* Lock/Unlock icon and status */}
                <div className="flex items-center justify-center mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isUnlockable ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                        <i className={`fas ${isUnlockable ? 'fa-unlock text-green-500' : 'fa-lock text-gray-500'} text-lg`}></i>
                    </div>
                </div>
                
                <div className="text-center mb-4">
                    <h3 className={`font-bold text-lg mb-1 ${isArabic ? 'font-arabic' : ''}`} style={{ color: getSubjectTextColor(subject) }}>
                        {formatSuperscript(name)}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                        {SUBJECT_ABBREV_MAP[subject] || subject}
                    </p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        isUnlockable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        <i className={`fas ${isUnlockable ? 'fa-check-circle' : 'fa-vote-yea'} mr-1`}></i>
                        {isUnlockable ? 'Débloquée !' : 'Vote requis'}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Progression</span>
                        <span className="text-xs font-medium text-gray-800">
                            {votes} / {requiredVotes}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                                width: `${progressPercentage}%`,
                                backgroundColor: color
                            }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-1">
                        {isUnlockable 
                            ? '🎉 Prête à être débloquée !'
                            : `${requiredVotes - votes} votes restants`
                        }
                    </p>
                </div>

                {/* Action button */}
                <div className="mt-auto">
                    <button
                        onClick={(e) => { e.stopPropagation(); onVote(); }}
                        disabled={isUnlockable}
                        className={`w-full text-white text-sm font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                            isUnlockable 
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 transform hover:scale-105'
                        }`}
                    >
                        <i className={`fas ${isUnlockable ? 'fa-check' : 'fa-vote-yea'} text-sm`}></i>
                        {isUnlockable ? 'Classe débloquée' : 'Voter pour cette classe'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LockedClassCard;
