import React from 'react';

interface LockedClassCardProps {
    name: string;
    subject: string;
    color: string;
    onContactAdmin: () => void;
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

const LockedClassCard: React.FC<LockedClassCardProps> = ({ name, subject, color, onContactAdmin }) => {
    // Helper to detect Arabic for font switching
    const isArabic = /[\u0600-\u06FF]/.test(name);
    const isSubjectArabic = /[\u0600-\u06FF]/.test(subject);

    return (
        <div 
            className="group relative rounded-xl border border-slate-400/30 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col aspect-[5/3] bg-slate-500"
            onClick={onContactAdmin}
        >
            {/* Overlay with pattern and blur */}
            <div 
                className="absolute inset-0 bg-repeat bg-center opacity-10"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")" }}
            ></div>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1.5px]"></div>

            <div className="relative flex flex-col h-full p-4 pt-12 sm:pt-8 pb-12 sm:pb-6 text-white">
                {/* Lock Icon top-left */}
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                    <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full border border-white/30 backdrop-blur-md">
                        <i className="fas fa-lock text-[11px] sm:text-sm text-white"></i>
                    </div>
                </div>

                {/* Premium badge top-right */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 sm:gap-1.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold bg-amber-400/20 text-amber-200 backdrop-blur-md shadow-sm border border-amber-300/30">
                        <i className="fas fa-crown text-[10px] sm:text-xs"></i>
                        <span>Premium</span>
                    </div>
                </div>
                
                {/* Class Name (Main Content) - centered */}
                <div className="flex-grow flex items-center justify-center text-center">
                    <h3 className={`font-extrabold break-words leading-tight tracking-tight ${isArabic ? 'font-ar text-[1.9rem]' : 'font-chic text-[1.6rem] sm:text-[1.7rem]'}`}>
                        {formatSuperscript(name)}
                    </h3>
                </div>

                {/* Subject chip */}
                <div className="flex-shrink-0 text-center pb-1">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 sm:gap-1.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-medium bg-white/20 text-white/90 backdrop-blur-sm">
                        <i className="fas fa-book-open text-[10px] sm:text-xs"></i>
                        <span className={isSubjectArabic ? 'font-ar' : 'font-chic'}>{subject}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LockedClassCard;
