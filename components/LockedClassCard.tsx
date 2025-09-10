import React from 'react';
import { SUBJECT_ABBREV_MAP, getSubjectBandClass } from '../constants';

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

    return (
        <div 
            className={`group relative rounded-xl bg-white shadow-sm cursor-pointer transition-all duration-150 sm:duration-200 sm:hover:shadow-md sm:hover:-translate-y-0.5 overflow-hidden flex flex-col aspect-[4/3] sm:aspect-[5/3] border-2 ${getSubjectBandClass(subject)}`}
            onClick={onContactAdmin}
        >
            {/* Band is rendered via border/ring; no separate accent bar */}

            <div className="relative flex flex-col h-full p-3 sm:p-4 pt-9 sm:pt-7 pb-9 sm:pb-6 text-slate-800">
                {/* Delete Button top-left */}
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="absolute top-2 left-2 sm:top-2 sm:left-2 w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center bg-white text-slate-500 border border-slate-200 rounded-full transition-all duration-200 hover:text-red-600 hover:border-red-200 z-10"
                    data-tippy-content="Supprimer cette carte"
                    aria-label="Supprimer cette carte"
                >
                    <i className="fas fa-times text-sm"></i>
                </button>

                {/* Premium badge top-right */}
                <div className="absolute top-2 right-2 sm:top-2 sm:right-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <i className="fas fa-crown text-[10px] sm:text-xs"></i>
                        <span>Premium</span>
                    </div>
                </div>
                
                {/* Class Name (Main Content) - centered */}
                <div className="flex-grow flex items-center justify-center text-center px-2">
                    <h3 className={`break-words leading-snug tracking-tight -translate-y-0.5 sm:-translate-y-1 ${isArabic ? 'title-ar text-[1.65rem] font-semibold' : 'title-chic font-merri text-[1.5rem] sm:text-[1.6rem] font-semibold'}`}>
                        {formatSuperscript(name)}
                    </h3>
                </div>

                {/* Subject chip (smaller for Latin/French) */}
                <div className="flex-shrink-0 text-center pb-1 absolute bottom-3 right-3">
                    {(() => {
                        const sizeClasses = isSubjectArabic
                            ? 'gap-1.5 px-3 py-1.5 text-[11px] sm:text-[11px] font-semibold'
                            : 'gap-1 px-2.5 py-1 text-[11px] sm:text-[11px] font-medium';
                        const iconSize = isSubjectArabic ? 'text-[11px] sm:text-xs' : 'text-[11px] sm:text-[12px]';
                        return (
                            <div className={`inline-flex items-center ${sizeClasses} rounded-full bg-slate-100 text-slate-700 border border-slate-200`}>
                                <i className={`fas fa-book-open ${iconSize} text-slate-500`}></i>
                                <span className={isSubjectArabic ? 'font-ar' : 'font-chic'}>{displaySubject}</span>
                            </div>
                        );
                    })()}
                </div>
                {/* CTA: demander l'accès */}
                <div className="absolute bottom-3 left-3">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onContactAdmin(); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-teal-600 text-white hover:bg-teal-700"
                    >
                        <i className="fas fa-paper-plane"></i>
                        <span>Demander</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LockedClassCard;
