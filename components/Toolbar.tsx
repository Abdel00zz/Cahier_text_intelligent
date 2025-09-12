

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { Dropdown, DropdownItem, DropdownDivider } from './ui/Dropdown';
import { TOP_LEVEL_TYPE_CONFIG } from '../constants';
import { TopLevelItem } from '../types';
import { printDocument } from '../utils/printUtils';

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  onOpenImport: () => void;
  onOpenManageLessons: () => void;
  onOpenGuide: () => void;
  onExportData: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = React.memo(({
  onUndo, onRedo, canUndo, canRedo, onSave, saveStatus,
  onOpenImport, onOpenManageLessons, onOpenGuide, onExportData,
  searchQuery, setSearchQuery
}) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  // Focus quand ouverture
  useEffect(() => {
    if (isSearchVisible) {
      // petit timeout pour laisser le panneau s'animer
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [isSearchVisible]);

  // Debounce propagation vers parent
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setSearchQuery(localSearch);
    }, 150);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [localSearch, setSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        if (!searchQuery) {
          setIsSearchVisible(false);
        }
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      // Raccourcis ouverture
      if ((e.key === '/' || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) && !isSearchVisible) {
        e.preventDefault();
        setIsSearchVisible(true);
        return;
      }
      if (e.key === 'Escape') {
        setIsSearchVisible(false);
        setLocalSearch('');
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        // Empêcher conflit avec recherche navigateur sur mobile web-app
        e.preventDefault();
        setIsSearchVisible(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchQuery, setSearchQuery, isSearchVisible]);

  // Sync local when external search cleared elsewhere
  useEffect(() => {
    if (!searchQuery && !isSearchVisible) setLocalSearch('');
  }, [searchQuery, isSearchVisible]);
  
  return (
    <div className="sticky top-2 z-[50] flex justify-between items-center flex-wrap gap-2 mb-4 p-2 bg-white/70 backdrop-blur-md rounded-t-lg shadow-sm border border-slate-200 print:hidden">
      <div className="flex items-center gap-2">
        {/* Add content button is now replaced by the FAB */}
      </div>
      
      <div className="flex-1 flex justify-center items-center gap-2">
        <Button variant="icon" onClick={onUndo} disabled={!canUndo} data-tippy-content="Annuler (Ctrl+Z)" className="h-12 w-12 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-xl shadow-sm transition-all duration-200">
          <i className="fas fa-undo text-blue-600 text-lg"></i>
        </Button>
        <Button variant="icon" onClick={onRedo} disabled={!canRedo} data-tippy-content="Rétablir (Ctrl+Y)">
          <i className="fas fa-redo"></i>
        </Button>
        <Button variant="icon" onClick={onSave} disabled={saveStatus === 'saving'} data-tippy-content="Sauvegarde manuelle">
          <i className="fas fa-save"></i>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div ref={searchContainerRef} className="relative flex items-center" role="search">
          <Button
            variant="icon"
            onClick={() => setIsSearchVisible(v => !v)}
            data-tippy-content="Rechercher (/ ou Ctrl+K)"
            aria-label="Rechercher"
            aria-expanded={isSearchVisible}
            aria-controls="toolbar-search-panel"
          >
            <i className="fas fa-search"></i>
          </Button>
          {/* Mobile overlay bar */}
          {isSearchVisible && (
            <div className="sm:hidden fixed top-0 left-0 right-0 z-30 px-3 pt-3 pb-2 bg-white/95 backdrop-blur border-b border-slate-200 shadow-md animate-slide-in-down" id="toolbar-search-panel">
              <div className="flex items-center gap-2">
                <i className="fas fa-search text-slate-400"></i>
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Rechercher..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="flex-1 h-10 px-2 text-sm bg-white rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                {localSearch && (
                  <button 
                    type="button" 
                    onClick={() => { setLocalSearch(''); setSearchQuery(''); }} 
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all duration-200 material-focus"
                    aria-label="Effacer la recherche"
                  >
                    <i className="fas fa-times text-sm"></i>
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={() => setIsSearchVisible(false)} 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700 transition-all duration-200 material-focus"
                  aria-label="Fermer la recherche"
                >
                  <i className="fas fa-chevron-up text-sm"></i>
                </button>
              </div>
            </div>
          )}
          {/* Desktop popover */}
          <div
            id="toolbar-search-panel"
            className={`absolute hidden sm:block transition-all duration-300 ease-in-out origin-right top-1/2 right-[calc(100%+0.5rem)] -translate-y-1/2 w-60 ${isSearchVisible ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`}
          >
            <div className="relative w-full">
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Rechercher..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full h-9 pl-4 pr-4 text-sm bg-white rounded-full border border-slate-300 shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <Dropdown buttonContent={<i className="fas fa-ellipsis-v"></i>} buttonProps={{ 'aria-label': "Menu d'actions" }}>
            <div className="sm:hidden">
                <DropdownItem onClick={onUndo} disabled={!canUndo}>
                  <div className="flex items-center">
                    <i className="fas fa-undo w-5 text-center mr-2 text-blue-600"></i>
                    <span className="flex-grow font-medium">Annuler</span>
                  </div>
                </DropdownItem>
                <DropdownItem onClick={onRedo} disabled={!canRedo}><i className="fas fa-redo w-5 text-center"></i> Rétablir</DropdownItem>
                <DropdownItem onClick={onSave} disabled={saveStatus === 'saving'}><i className="fas fa-save w-5 text-center"></i> Sauvegarder</DropdownItem>
                <DropdownDivider />
            </div>
            <DropdownItem onClick={onOpenImport}>
              <div className="flex items-center">
                <i className="fas fa-file-import w-5 text-center mr-2"></i>
                <span className="flex-grow">Importer JSON</span>
              </div>
            </DropdownItem>
            <DropdownItem onClick={onExportData}>
              <div className="flex items-center">
                <i className="fas fa-file-export w-5 text-center mr-2"></i>
                <span className="flex-grow">Exporter JSON</span>
              </div>
            </DropdownItem>
            <DropdownItem onClick={onOpenManageLessons}><i className="fas fa-edit w-5 text-center mr-2"></i> Gérer mes leçons</DropdownItem>
            <DropdownDivider />

            <DropdownItem onClick={() => printDocument('cahier-de-textes')}>
              <div className="flex items-center">
                <i className="fas fa-print w-5 text-center mr-2"></i>
                <span className="flex-grow font-medium">Imprimer</span>
              </div>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem onClick={onOpenGuide}>
              <div className="flex items-center">
                <i className="fas fa-question-circle w-5 text-center mr-2"></i>
                <span className="flex-grow">Aide</span>
              </div>
            </DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
});
