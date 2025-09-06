

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { Dropdown, DropdownItem, DropdownDivider } from './ui/Dropdown';
import { TOP_LEVEL_TYPE_CONFIG } from '../constants';
import { TopLevelItem } from '../types';

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
    <div className="sticky top-2 z-20 flex justify-between items-center flex-wrap gap-2 mb-4 p-2 bg-white/70 backdrop-blur-md rounded-t-lg shadow-sm border border-slate-200 print:hidden">
      <div className="flex items-center gap-2">
        {/* Add content button is now replaced by the FAB */}
      </div>
      
      <div className="flex-1 flex justify-center items-center gap-2">
        <Button variant="icon" onClick={onUndo} disabled={!canUndo} data-tippy-content="Annuler (Ctrl+Z)">
          <i className="fas fa-undo"></i>
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
                  <Button variant="secondary" size="sm" onClick={() => { setLocalSearch(''); setSearchQuery(''); }} aria-label="Effacer la recherche">
                    <i className="fas fa-times"></i>
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => setIsSearchVisible(false)} aria-label="Fermer">
                  <i className="fas fa-chevron-up"></i>
                </Button>
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
                className="w-full h-9 pl-4 pr-8 text-sm bg-white rounded-full border border-slate-300 shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              {localSearch && (
                <button type="button" onClick={() => { setLocalSearch(''); setSearchQuery(''); searchInputRef.current?.focus(); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Effacer">
                  <i className="fas fa-times-circle"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        <Dropdown buttonContent={<i className="fas fa-ellipsis-v"></i>}>
            <div className="sm:hidden">
                <DropdownItem onClick={onUndo} disabled={!canUndo}><i className="fas fa-undo w-4 text-center"></i> Annuler</DropdownItem>
                <DropdownItem onClick={onRedo} disabled={!canRedo}><i className="fas fa-redo w-4 text-center"></i> Rétablir</DropdownItem>
                <DropdownItem onClick={onSave} disabled={saveStatus === 'saving'}><i className="fas fa-save w-4 text-center"></i> Sauvegarder</DropdownItem>
                <DropdownDivider />
            </div>
            <DropdownItem onClick={onOpenImport}><i className="fas fa-file-import w-4 text-center"></i> Importer JSON</DropdownItem>
            <DropdownItem onClick={onExportData}><i className="fas fa-file-export w-4 text-center"></i> Exporter JSON</DropdownItem>
            <DropdownItem onClick={onOpenManageLessons}><i className="fas fa-edit w-4 text-center"></i> Gérer mes leçons</DropdownItem>
            <DropdownDivider />
            <DropdownItem onClick={() => window.print()}><i className="fas fa-print w-4 text-center"></i> Imprimer</DropdownItem>
            <DropdownDivider />
            <DropdownItem onClick={onOpenGuide}><i className="fas fa-question-circle w-4 text-center"></i> Aide</DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
});
