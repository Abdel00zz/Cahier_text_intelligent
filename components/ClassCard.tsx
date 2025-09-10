import { memo, MouseEvent, FC } from 'react';
import { ClassInfo } from '../types';
import { SUBJECT_ABBREV_MAP } from '../constants';
import { getSubjectTextColor } from '../utils/subjectColors';

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
            className={`card-modern group relative rounded-xl shadow-lg cursor-pointer overflow-hidden flex flex-col aspect-[3/2] sm:aspect-[4/3] border border-slate-700/30`}
            onClick={onSelect}
        >
            {/* SVG Background with modern gradient */}
            <div className="absolute inset-0 w-full h-full opacity-40">
                <svg className="w-full h-full" viewBox="0 0 200 150" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id={`grad-${classInfo.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{stopColor: '#1e293b', stopOpacity: 1}} />
                            <stop offset="100%" style={{stopColor: classInfo.color || '#0f766e', stopOpacity: 1}} />
                        </linearGradient>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="10" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    <path d="M0,50 Q50,0 100,50 T200,50 V150 H0 Z" fill={`url(#grad-${classInfo.id})`} />
                    <path d="M0,70 Q50,20 100,70 T200,70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                </svg>
            </div>

            {/* Glass effect overlay */}
            <div className="absolute inset-0 glass-effect opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>

            <div className="relative flex flex-col h-full p-4 text-white z-10">
                {/* Delete Button with improved styling */}
                <button 
                    onClick={handleDeleteClick}
                    className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center bg-slate-800/60 text-slate-300 rounded-full opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:bg-red-500/80 hover:text-white hover:scale-110 z-20 shadow-lg"
                    data-tippy-content="Supprimer la classe"
                    aria-label="Supprimer la classe"
                >
                    <i className="fas fa-times text-xs"></i>
                </button>

                {/* Centered Content */}
                <div className="flex-grow flex flex-col items-center justify-center text-center px-2 -mt-4">
                    {/* Subject Badge - Modern style */}
                    <div className="badge-modern mb-3 transform transition-all duration-300 group-hover:scale-105">
                        <p className={`${isSubjectArabic ? 'font-ar' : 'font-poppins'} ${subjectColor} drop-shadow-sm`} style={{ color: '#3b82f6' }}>
                            {displaySubject}
                        </p>
                    </div>
                    
                    {/* Class Name with modern styling */}
                    <h3 className={`title-modern break-words leading-tight tracking-tight font-semibold relative z-20 ${isArabic ? 'title-ar text-5xl sm:text-6xl' : 'font-quicksand text-3xl sm:text-4xl'}`} style={{ fontSize: '115%' }}>
                        {formatSuperscript(classInfo.name)}
                    </h3>
                </div>

                {/* Last Modified chip with modern styling */}
                <div className="absolute left-3 bottom-3">
                    <div className="last-modified-chip">
                        <i className="fas fa-history text-blue-300"></i>
                        <span>{formatDate(lastModified)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Export memoized component for performance
export const ClassCard = memo(ClassCardComponent);