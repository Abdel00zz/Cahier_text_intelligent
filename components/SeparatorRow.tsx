import React, { useRef } from 'react';
import { Indices, Separator } from '../types';
import { Button } from './ui/Button';

interface SeparatorRowProps {
    data: Separator;
    indices: Indices;
    onCellUpdate: (indices: Indices, field: string, value: any) => void;
    onDelete: () => void;
    isNew?: boolean;
}

export const SeparatorRow: React.FC<SeparatorRowProps> = React.memo(({ data, indices, onCellUpdate, onDelete, isNew = false }) => {
    const separatorIndices: Indices = {...indices, isSeparator: true};
    
    const contentRef = useRef<HTMLDivElement>(null);
    const isChanged = useRef(false);

    const handleContentSave = () => {
        if (contentRef.current && isChanged.current) {
            onCellUpdate(separatorIndices, 'content', contentRef.current.textContent || '');
            isChanged.current = false;
        }
    };
  
    const handleContentKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        isChanged.current = true;
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.blur();
        }
    };

    const rowClasses = [
        "group",
        "flex",
        "items-center",
        "w-full",
        "px-2 sm:px-4 py-2",
        isNew ? "new-item-highlight" : "",
    ].filter(Boolean).join(" ");

    return (
        <div className={rowClasses}>
            <div className="flex-grow border-t border-slate-200"></div>
            <div className="flex-shrink-0 px-4 flex items-center gap-2">
                <input
                    type="date"
                    value={data.date || ''}
                    onChange={(e) => onCellUpdate(separatorIndices, 'date', e.target.value)}
                    className="bg-transparent text-slate-500 text-xs rounded-md border-none p-1 focus:ring-2 focus:ring-teal-500 cursor-pointer w-28"
                    title="Modifier la date du séparateur"
                />
                <div
                    ref={contentRef}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={handleContentSave}
                    onKeyDown={handleContentKeyDown}
                    className="text-center text-xs italic text-slate-500 px-2 py-1 rounded hover:bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-text min-w-[100px]"
                    dangerouslySetInnerHTML={{ __html: data.content || '' }}
                />
            </div>
            <div className="flex-grow border-t border-slate-200"></div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <Button
                    variant="icon"
                    size="sm"
                    onClick={onDelete}
                    data-tippy-content="Supprimer le séparateur"
                    className="w-7 h-7 text-xs text-gray-700 hover:text-white hover:bg-black"
                >
                  <i className="fas fa-times"></i>
                </Button>
            </div>
        </div>
    );
});