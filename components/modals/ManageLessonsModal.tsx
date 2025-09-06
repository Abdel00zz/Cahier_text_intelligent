

import React, { useState, useRef, useEffect } from 'react';
import { TopLevelItem } from '../../types';
import { Button } from '../ui/Button';
import { TOP_LEVEL_TYPE_CONFIG } from '../../constants';

interface ManageLessonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (lessons: TopLevelItem[]) => void;
  lessons: TopLevelItem[];
}

export const ManageLessonsModal: React.FC<ManageLessonsModalProps> = ({ isOpen, onClose, onUpdate, lessons }) => {
  const [localLessons, setLocalLessons] = useState<TopLevelItem[]>([]);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
        setLocalLessons([...lessons]);
    }
  }, [isOpen, lessons]);

  const handleDelete = (index: number) => {
    setLocalLessons(current => current.filter((_, i) => i !== index));
  };

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
    const newList = [...localLessons];
    if (dragItem.current === null) return;
    const draggedItemContent = newList.splice(dragItem.current, 1)[0];
    newList.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = dragOverItem.current;
    setLocalLessons(newList);
  };
  
  const handleDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleSubmit = () => {
      onUpdate(localLessons);
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-200 flex-shrink-0">
            <h2 className="text-lg font-semibold font-slab text-slate-900">Gérer les contenus principaux</h2>
        </div>
        <div className="p-6 flex-grow overflow-y-auto bg-slate-50/50">
          <p className="mb-4 text-slate-600 text-sm">Réorganisez vos chapitres et devoirs par glisser-déposer ou supprimez-les.</p>
          {localLessons.length > 0 ? (
            <ul className="space-y-2">
              {localLessons.map((item, index) => {
                const config = TOP_LEVEL_TYPE_CONFIG[item.type];

                // Defensive check for corrupted data
                if (!config) {
                  return (
                    <li key={index} className="flex items-center p-3 rounded-lg bg-red-100 border border-red-300">
                       <i className="fas fa-exclamation-triangle text-red-500 mr-4"></i>
                       <span className="flex-grow text-red-700 font-medium">Contenu corrompu: "{item.title}"</span>
                       <Button variant="icon" size="sm" onClick={() => handleDelete(index)} data-tippy-content="Supprimer cet élément corrompu" className="w-7 h-7 text-xs bg-red-200 hover:bg-red-300 text-red-800">
                          <i className="fas fa-trash-alt"></i>
                       </Button>
                    </li>
                  )
                }

                return (
                  <li 
                    key={index} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex items-center p-3 rounded-lg bg-white border border-slate-200 cursor-grab active:cursor-grabbing active:bg-teal-50 active:border-teal-300 active:shadow-lg transition-all duration-150"
                  >
                    <i className="fas fa-grip-vertical text-slate-400 mr-4 cursor-grab"></i>
                    <i className={`${config.icon} ${config.color} w-5 text-center`}></i>
                    <span className="ml-3 flex-grow text-slate-800 font-medium">{item.title}</span>
                    <Button variant="icon" size="sm" onClick={() => handleDelete(index)} data-tippy-content="Supprimer" className="w-7 h-7 text-xs bg-red-100 hover:bg-red-200 text-red-700">
                      <i className="fas fa-trash-alt"></i>
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-center text-slate-500 italic py-8">Aucun contenu à gérer.</p>
          )}
        </div>
        <div className="p-4 bg-slate-50 flex justify-end items-center rounded-b-2xl border-t border-slate-200 flex-shrink-0">
            <div className="flex gap-3">
                <Button type="button" onClick={onClose} variant="secondary">Annuler</Button>
                <Button type="button" onClick={handleSubmit} variant="primary">
                    Enregistrer les modifications
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};