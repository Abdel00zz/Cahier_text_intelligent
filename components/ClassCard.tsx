import React from 'react';
import { ClassInfo } from '../types';

interface ClassCardProps {
    classInfo: ClassInfo;
    lastModified: string | null | undefined;
    onSelect: () => void;
    onDelete: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({ classInfo, lastModified, onSelect, onDelete }) => {
    
    const handleDeleteClick = (e: React.MouseEvent) => {
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

    return (
        <div 
            className="group relative rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 overflow-hidden flex flex-col aspect-[4/3]"
            style={{ backgroundColor: classInfo.color }}
            onClick={onSelect}
        >
            <div className="flex flex-col h-full p-5 text-white text-center">
                {/* Class Name (Main Content) */}
                <div className="flex-grow flex items-center justify-center">
                    <h3 className="text-3xl font-bold font-slab break-words leading-tight filter drop-shadow-sm">
                        {classInfo.name}
                    </h3>
                </div>

                {/* Last Modified Date (Footer) */}
                <div className="flex-shrink-0 mt-auto">
                    <p className="text-xs text-white/80 transition-opacity group-hover:opacity-100">
                        <i className="fas fa-history mr-2"></i>
                        {formatDate(lastModified)}
                    </p>
                </div>
            </div>

            {/* Delete Button (visible on hover) */}
            <button 
                onClick={handleDeleteClick}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/25 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-10"
                data-tippy-content="Supprimer la classe"
                aria-label="Supprimer la classe"
            >
                <i className="fas fa-times text-sm"></i>
            </button>
        </div>
    );
};