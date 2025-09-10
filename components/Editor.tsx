

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useImmer } from 'use-immer';
import { Header } from './Header';
import { Toolbar } from './Toolbar';
import { MainTable } from './MainTable';
import { Notification, NotificationType } from './ui/Notification';
import { Spinner } from './ui/Spinner';
import { useHistoryState } from '../hooks/useHistoryState';
import { useConfigManager } from '../hooks/useConfigManager';
import { findItem, addTopLevelItem, addSection, addItem, deleteSeparator, migrateLessonsData } from '../utils/dataUtils';
import { LessonsData, Indices, TopLevelItem, LessonItem, Section, ClassInfo, EmbeddableTopLevelType, EmbeddableTopLevelItem, ElementType, Separator } from '../types';
import { ImportModal } from './modals/ImportModal';
import { ManageLessonsModal } from './modals/ManageLessonsModal';
import { GuideModal } from './modals/GuideModal';
import { PrintView } from './PrintView';
import { TOP_LEVEL_TYPE_CONFIG, TYPE_MAP } from '../constants';
import { logger } from '../utils/logger';
import { AddContentModal } from './modals/EditItemModal';


interface EditorProps {
    classInfo: ClassInfo;
    onBack: () => void;
}

type ActiveModal = 
  | 'import' 
  | 'manageLessons' 
  | 'guide' 
  | 'addContent'
  | null;

export const Editor: React.FC<EditorProps> = ({ classInfo: initialClassInfo, onBack }) => {
  const { state: lessonsData, setState, undo, redo, canUndo, canRedo } = useHistoryState<LessonsData>([]);
  const { config, isLoading: isConfigLoading } = useConfigManager();

  const [editorState, setEditorState] = useImmer({
    classInfo: initialClassInfo,
    isClassLoading: true,
    saveStatus: 'saved' as 'saved' | 'saving' | 'unsaved',
    notification: null as { message: string; type: NotificationType } | null,
    activeModal: null as ActiveModal,
    editingIndices: null as Indices | null,
    searchQuery: '',
    selectedIndices: null as Indices | null,
    newlyAddedIds: [] as string[],
  });

  const {
    classInfo,
    isClassLoading,
    saveStatus,
    notification,
    activeModal,
    editingIndices,
    searchQuery,
    selectedIndices,
    newlyAddedIds,
  } = editorState;

  const getStorageKey = useCallback(() => `classData_v1_${classInfo.id}`, [classInfo.id]);
  
  const showNotification = useCallback((message: string, type: NotificationType, duration = 3000) => {
    setEditorState(draft => { draft.notification = { message, type }; });
  }, [setEditorState]);

  const addNewItemHighlight = useCallback((id: string) => {
    setEditorState(draft => { draft.newlyAddedIds.push(id); });
    setTimeout(() => {
        setEditorState(draft => { draft.newlyAddedIds = draft.newlyAddedIds.filter(i => i !== id); });
    }, 2500);
  }, [setEditorState]);

  // --- Data Persistence ---
  const loadData = useCallback(() => {
    setEditorState(draft => { draft.isClassLoading = true; });
    const storageKey = getStorageKey();
    
    try {
      const savedData = localStorage.getItem(storageKey);
      const lessons = savedData ? JSON.parse(savedData) : [];
      const migratedLessons = migrateLessonsData(lessons);

      setState(() => migratedLessons, 'initial-load');
      showNotification(`Données pour "${classInfo.name}" chargées`, 'info');
    } catch (error) {
      logger.error("Failed to load data from localStorage", error);
      showNotification("Erreur lors du chargement des données.", "error");
    } finally {
      setEditorState(draft => { draft.isClassLoading = false; });
    }
  }, [setState, getStorageKey, classInfo.name, showNotification, setEditorState]);

  const saveData = useCallback(() => {
    setEditorState(draft => { draft.saveStatus = 'saving'; });
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(lessonsData));
      setTimeout(() => setEditorState(draft => { draft.saveStatus = 'saved'; }), 500);
    } catch (error) {
      logger.error("Failed to save data to localStorage", error);
      showNotification("Erreur de sauvegarde.", "error");
      setEditorState(draft => { draft.saveStatus = 'unsaved'; });
    }
  }, [lessonsData, getStorageKey, showNotification, setEditorState]);
  
  const handleExportData = useCallback(() => {
    try {
        const dataToExport = {
            classInfo,
            lessonsData,
        };
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cahier-de-textes-${classInfo.name}-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification("Données exportées avec succès!", "success");
    } catch (error) {
        logger.error("Failed to export data", error);
        showNotification("Erreur lors de l'exportation.", "error");
    }
  }, [classInfo, lessonsData, showNotification]);

  const handleClassInfoChange = useCallback((newInfo: Partial<ClassInfo>) => {
    setEditorState(draft => {
        Object.assign(draft.classInfo, newInfo);
        
        try {
            const allClasses: ClassInfo[] = JSON.parse(localStorage.getItem('classManager_v1') || '[]');
            const updatedClasses = allClasses.map(c => 
                c.id === draft.classInfo.id ? { ...draft.classInfo } : c
            );
            localStorage.setItem('classManager_v1', JSON.stringify(updatedClasses));
        } catch (e) {
            console.error("Failed to update class info in storage", e);
            showNotification("Erreur de mise à jour des infos de la classe", "error");
        }
    });
  }, [setEditorState, showNotification]);

  useEffect(() => {
    if (isClassLoading || isConfigLoading || saveStatus === 'saved') return;
    const handler = setTimeout(() => {
      saveData();
    }, 1500);
    return () => clearTimeout(handler);
  }, [lessonsData, isClassLoading, isConfigLoading, saveStatus, saveData]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  useEffect(() => {
    if (config.defaultTeacherName && config.defaultTeacherName !== classInfo.teacherName) {
      handleClassInfoChange({ teacherName: config.defaultTeacherName });
    }
  }, [config.defaultTeacherName, classInfo.teacherName, handleClassInfoChange]);

  useEffect(() => {
    setEditorState(draft => { draft.classInfo = initialClassInfo; });
  }, [initialClassInfo, setEditorState]);


  useEffect(() => {
    if (isClassLoading) return;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (window.tippy && !isTouch) {
      window.tippy('[data-tippy-content]', {
        animation: 'shift-away',
        theme: 'custom',
      });
    }
  }, [lessonsData, isClassLoading, searchQuery, selectedIndices, editingIndices, activeModal]);
  
  const handleCellUpdate = useCallback((indices: Indices, field: string, value: any) => {
    setState(draft => {
        const { item } = findItem(draft, indices);
        if (item) {
            (item as any)[field] = value;
        }
    }, 'cell-edit');
    setEditorState(draft => { draft.saveStatus = 'unsaved'; });
  }, [setState, setEditorState]);

  const handleDeleteItem = useCallback((indices: Indices) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élément et tout son contenu ?")) {
      setState(draft => {
        const { parent, targetIndex } = findItem(draft, indices);
        if (parent && typeof targetIndex === 'number' && Array.isArray(parent)) {
            parent.splice(targetIndex, 1);
        } else {
            console.error("Impossible de supprimer l'élément, parent ou index introuvable pour", indices);
        }
      }, 'delete-item');
      showNotification("Élément supprimé.", "success");
      setEditorState(draft => {
        draft.saveStatus = 'unsaved';
        draft.selectedIndices = null;
      });
    }
  }, [setState, showNotification, setEditorState]);

  const handleOpenAddContentModal = (indices?: Indices) => {
      setEditorState(draft => {
        draft.selectedIndices = indices || null;
        draft.activeModal = 'addContent';
      });
  };
  
  const handleModalClose = useCallback(() => {
    setEditorState(draft => {
      draft.activeModal = null;
      draft.selectedIndices = null;
    });
  }, [setEditorState]);

  const handleConfirmAddContent = useCallback((type: string, data: any) => {
      let notificationMessage = '';
      const newId = crypto.randomUUID();
      
      if (TOP_LEVEL_TYPE_CONFIG.hasOwnProperty(type) && type !== 'chapter' && selectedIndices) {
          let parentLevelIndices: Indices = { chapterIndex: selectedIndices.chapterIndex };
          if (selectedIndices.sectionIndex !== undefined) parentLevelIndices.sectionIndex = selectedIndices.sectionIndex;
          if (selectedIndices.subsectionIndex !== undefined) parentLevelIndices.subsectionIndex = selectedIndices.subsectionIndex;
          if (selectedIndices.subsubsectionIndex !== undefined) parentLevelIndices.subsubsectionIndex = selectedIndices.subsubsectionIndex;
          const insertAfterIndex = selectedIndices.itemIndex;
          const newItem: EmbeddableTopLevelItem = { type: type as EmbeddableTopLevelType, title: data.title, _tempId: newId };
          setState(draft => addItem(draft, parentLevelIndices, newItem, insertAfterIndex), 'add-embedded-item');
          notificationMessage = "Bloc inséré.";
          addNewItemHighlight(newId);
      } else if (TOP_LEVEL_TYPE_CONFIG.hasOwnProperty(type)) {
          const insertAfterIndex = selectedIndices?.chapterIndex;
          const newItem: TopLevelItem = { type: type as TopLevelItem['type'], title: data.title, _tempId: newId };
          setState(draft => addTopLevelItem(draft, newItem, insertAfterIndex), 'add-top-level');
          notificationMessage = "Élément principal ajouté.";
          addNewItemHighlight(newId);
      } else if (type === 'section' && selectedIndices) {
          const parentIndices = { chapterIndex: selectedIndices.chapterIndex };
          const insertAfterIndex = selectedIndices.sectionIndex;
          const newSection: Section = { name: data.name, items: [], _tempId: newId };
          setState(draft => addSection(draft, parentIndices, newSection, insertAfterIndex), 'add-section');
          notificationMessage = "Section ajoutée.";
          addNewItemHighlight(newId);
      } else if (type === 'item' && selectedIndices) {
          let parentLevelIndices: Indices = { chapterIndex: selectedIndices.chapterIndex };
          if (selectedIndices.sectionIndex !== undefined) parentLevelIndices.sectionIndex = selectedIndices.sectionIndex;
          if (selectedIndices.subsectionIndex !== undefined) parentLevelIndices.subsectionIndex = selectedIndices.subsectionIndex;
          if (selectedIndices.subsubsectionIndex !== undefined) parentLevelIndices.subsubsectionIndex = selectedIndices.subsubsectionIndex;
          const insertAfterIndex = selectedIndices.itemIndex;
          
          const normalizedType = TYPE_MAP[data.type.toLowerCase()] || data.type;
          const newItem: LessonItem = { ...data, type: normalizedType, _tempId: newId };
          setState(draft => addItem(draft, parentLevelIndices, newItem, insertAfterIndex), 'add-item');
          notificationMessage = "Élément ajouté.";
          addNewItemHighlight(newId);
      } else if (type === 'separator' && selectedIndices) {
          setState(draft => {
              const { item } = findItem(draft, selectedIndices);
              if (item) {
                  if(item.separatorAfter) {
                      showNotification("Un séparateur existe déjà à cet endroit.", "info");
                      return;
                  }
                  const newSeparator: Separator = { content: data.content || '---', date: data.date || item.date || '', manual: true, _tempId: newId };
                  item.separatorAfter = newSeparator;
                  notificationMessage = "Séparateur ajouté.";
                  addNewItemHighlight(newId);
              }
          }, 'add-separator');
      }

      if (notificationMessage) {
        showNotification(notificationMessage, "success");
        setEditorState(draft => { draft.saveStatus = 'unsaved'; });
      }
      handleModalClose();
  }, [selectedIndices, setState, showNotification, handleModalClose, addNewItemHighlight, setEditorState]);
  
  const handleInitiateInlineEdit = useCallback((indices: Indices) => {
    setEditorState(draft => {
      draft.editingIndices = indices;
      draft.selectedIndices = null;
    });
  }, [setEditorState]);

  const handleCancelInlineEdit = useCallback(() => {
    setEditorState(draft => { draft.editingIndices = null; });
  }, [setEditorState]);

  const handleConfirmInlineEdit = useCallback((indices: Indices, updatedData: Partial<LessonItem>) => {
      const normalizedType = updatedData.type ? (TYPE_MAP[updatedData.type.toLowerCase()] || updatedData.type) : undefined;
      const finalItem = { ...updatedData };
      if (normalizedType) {
          finalItem.type = normalizedType;
      }
  
      setState(draft => {
          const { item } = findItem(draft, indices);
          if (item) {
              Object.assign(item, finalItem);
          }
      }, 'inline-edit-item');
      showNotification("Élément mis à jour.", "success");
      setEditorState(draft => {
        draft.saveStatus = 'unsaved';
        draft.editingIndices = null;
      });
  }, [setState, showNotification, setEditorState]);

  const handleImport = useCallback((data: any, mode: 'replace' | 'append') => {
      const lessonsToImport = data.lessonsData || data; // supports full export or raw array
      const migratedData = migrateLessonsData(lessonsToImport);
      setState(currentData => (mode === 'replace' ? migratedData : [...currentData, ...migratedData]), 'import-data');
      handleModalClose();
      showNotification("Données importées avec succès!", "success");
      setEditorState(draft => { draft.saveStatus = 'unsaved'; });
  }, [setState, showNotification, handleModalClose, setEditorState]);

  const handleUpdateLessons = useCallback((newLessons: LessonsData) => {
      setState(() => newLessons, 'manage-lessons');
      handleModalClose();
      showNotification(`Leçons mises à jour.`, 'success');
      setEditorState(draft => { draft.saveStatus = 'unsaved'; });
  }, [setState, showNotification, handleModalClose, setEditorState]);
  
  const handleDeleteSeparator = useCallback((indices: Indices) => {
    setState(draft => deleteSeparator(draft, indices), 'delete-separator');
    showNotification("Séparateur supprimé.", "success");
    setEditorState(draft => { draft.saveStatus = 'unsaved'; });
  }, [setState, showNotification, setEditorState]);
  
  const filteredData = useMemo(() => {
    if (!searchQuery) return lessonsData;
    const query = searchQuery.toLowerCase();
    
    const filterRecursively = (items: any[]): any[] => {
        return items.reduce((acc: any[], item: any) => {
            let itemText = JSON.stringify(item).toLowerCase();
            let children: any = {};
            
            if (item.sections) children.sections = filterRecursively(item.sections);
            if (item.subsections) children.subsections = filterRecursively(item.subsections);
            if (item.subsubsections) children.subsubsections = filterRecursively(item.subsubsections);
            if (item.items) children.items = filterRecursively(item.items);

            const hasVisibleChildren = Object.values(children).some((arr: any) => arr.length > 0);

            if (itemText.includes(query) || hasVisibleChildren) {
                acc.push({ ...item, ...children });
            }
            return acc;
        }, []);
    };
    return filterRecursively(lessonsData);
  }, [searchQuery, lessonsData]);

  const isLoading = isClassLoading || isConfigLoading;

  if (isLoading) {
    return <Spinner fullPage text={`Chargement du cahier de textes pour ${classInfo.name}...`} />;
  }

return (
  <div className="relative p-2 sm:p-5 bg-slate-50 safe-bottom" data-editor-root>
      <div className="container mx-auto max-w-7xl bg-white shadow-2xl p-3 sm:p-6 min-h-[calc(100vh-2.5rem)] flex flex-col print:shadow-none print:border-none print:p-0">
        
        <div className="print-hidden flex flex-col flex-1">
          <Header 
            classInfo={classInfo}
            establishmentName={config.establishmentName}
            onClassInfoChange={handleClassInfoChange}
            onBack={onBack}
          />
          <div className="sticky bottom-0 sm:static z-30 bg-white/70 sm:bg-transparent backdrop-blur supports-[backdrop-filter]:backdrop-blur print:hidden">
          <Toolbar
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            onSave={saveData}
            saveStatus={saveStatus}
            onOpenImport={() => setEditorState(draft => { draft.activeModal = 'import'; })}
            onOpenManageLessons={() => setEditorState(draft => { draft.activeModal = 'manageLessons'; })}
            onOpenGuide={() => setEditorState(draft => { draft.activeModal = 'guide'; })}
            onExportData={handleExportData}
            searchQuery={searchQuery}
            setSearchQuery={value => setEditorState(draft => { draft.searchQuery = value; })}
          />
          </div>
          <main className="flex-1" onClick={() => setEditorState(draft => { draft.selectedIndices = null; })}>
            <MainTable
              lessonsData={filteredData}
              onCellUpdate={handleCellUpdate}
              onDeleteItem={handleDeleteItem}
              onDeleteSeparator={handleDeleteSeparator}
              onOpenAddContentModal={handleOpenAddContentModal}
              showDescriptions={config.screenDescriptionMode === 'all' ? true : config.screenDescriptionMode === 'none' ? false : undefined}
              descriptionTypes={config.screenDescriptionTypes}
              selectedIndices={selectedIndices}
              onSelectRow={indices => setEditorState(draft => { draft.selectedIndices = indices; })}
              editingIndices={editingIndices}
              onInitiateInlineEdit={handleInitiateInlineEdit}
              onConfirmInlineEdit={handleConfirmInlineEdit}
              onCancelInlineEdit={handleCancelInlineEdit}
              newlyAddedIds={newlyAddedIds}
            />
          </main>
        </div>
        
  <PrintView lessonsData={filteredData} classInfo={classInfo} config={config} newlyAddedIds={newlyAddedIds} />
        
      </div>

      {notification && <Notification {...notification} onDismiss={() => setEditorState(draft => { draft.notification = null; })} />}
      
      <ImportModal isOpen={activeModal === 'import'} onClose={handleModalClose} onImport={handleImport} />
      <ManageLessonsModal isOpen={activeModal === 'manageLessons'} onClose={handleModalClose} lessons={lessonsData} onUpdate={handleUpdateLessons} />
      <GuideModal isOpen={activeModal === 'guide'} onClose={handleModalClose} />
      
      <AddContentModal
        isOpen={activeModal === 'addContent'}
        onClose={handleModalClose}
        onConfirm={handleConfirmAddContent}
        lessonsData={lessonsData}
        selectedIndices={selectedIndices}
      />

    </div>
);
};