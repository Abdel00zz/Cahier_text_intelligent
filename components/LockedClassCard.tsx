import React from 'react';
import { SUBJECT_ABBREV_MAP, getSubjectBandClass } from '../constants';
import { getSubjectTextColor } from '../utils/subjectColors';

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
            className={`card-modern group relative rounded-xl shadow-lg cursor-pointer overflow-hidden flex flex-col aspect-[3/2] sm:aspect-[4/3] border border-slate-800/30`}
            onClick={onContactAdmin}
        >
            {/* Modern SVG Background for Locked Cards */}
            <div className="absolute inset-0 w-full h-full opacity-30">
                <svg className="w-full h-full" viewBox="0 0 200 150" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="grad-locked" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{stopColor: '#0f172a', stopOpacity: 1}} />
                            <stop offset="100%" style={{stopColor: '#f59e0b', stopOpacity: 0.3}} />
                        </linearGradient>
                        <pattern id="pattern-locked" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)">
                            <line x1="10" y1="0" x2="10" y2="20" stroke="#f59e0b" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="200" height="150" fill="url(#grad-locked)" />
                    <rect width="200" height="150" fill="url(#pattern-locked)" />
                </svg>
            </div>

            {/* Glass effect overlay */}
            <div className="absolute inset-0 glass-effect opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

            <div className="relative flex flex-col h-full p-3 sm:p-4 text-white z-10">
                {/* Delete Button with improved styling */}
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="absolute top-2.5 left-2.5 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-slate-800/60 text-slate-400 rounded-full opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:bg-red-500/80 hover:text-white hover:scale-110 z-20 shadow-lg"
                    data-tippy-content="Supprimer cette carte"
                    aria-label="Supprimer cette carte"
                >
                    <i className="fas fa-times text-[10px] sm:text-xs"></i>
                </button>

                {/* Premium badge with animation */}
                <div className="absolute top-2.5 right-2.5">
                    <div 
                        className="premium-badge"
                        data-tippy-content="Contenu Premium"
                    >
                        <i className="fas fa-crown text-white text-xs sm:text-sm"></i>
                    </div>
                </div>
                
                {/* Centered Content */}
                <div className="flex-grow flex flex-col items-center justify-center text-center px-2 -mt-2 sm:-mt-4">
                    {/* Subject Badge - Modern style */}
                    <div className="badge-modern mb-3 transform transition-all duration-300 group-hover:scale-105">
                        <p className={`${isSubjectArabic ? 'font-ar' : 'font-poppins'} ${subjectColor} drop-shadow-sm`} style={{ color: '#3b82f6' }}>
                            {displaySubject}
                        </p>
                    </div>
                    
                    {/* Class Name with modern styling */}
                    <h3 className={`title-modern break-words leading-tight tracking-tight font-semibold relative z-20 ${isArabic ? 'title-ar text-5xl sm:text-6xl' : 'font-quicksand text-3xl sm:text-4xl'}`} style={{ fontSize: '115%' }}>
                        {formatSuperscript(name)}
                    </h3>
                </div>
            </div>
        </div>
    );
};

export default LockedClassCard;
