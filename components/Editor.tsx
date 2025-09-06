

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [classInfo, setClassInfo] = useState<ClassInfo>(initialClassInfo);
  const { state: lessonsData, setState, undo, redo, canUndo, canRedo } = useHistoryState<LessonsData>([]);
  
  const [isClassLoading, setIsClassLoading] = useState(true);
  const { config, isLoading: isConfigLoading } = useConfigManager();

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
  
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [editingIndices, setEditingIndices] = useState<Indices | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndices, setSelectedIndices] = useState<Indices | null>(null);
  const [newlyAddedIds, setNewlyAddedIds] = useState<string[]>([]);

  const getStorageKey = useCallback(() => `classData_v1_${classInfo.id}`, [classInfo.id]);
  
  const showNotification = useCallback((message: string, type: NotificationType, duration = 3000) => {
    setNotification({ message, type });
  }, []);

  const addNewItemHighlight = useCallback((id: string) => {
    setNewlyAddedIds(prev => [...prev, id]);
    setTimeout(() => {
        setNewlyAddedIds(prev => prev.filter(i => i !== id));
    }, 2500);
  }, []);

  // --- Data Persistence ---
  const loadData = useCallback(() => {
    setIsClassLoading(true);
    const storageKey = getStorageKey();
    
    try {
      const savedData = localStorage.getItem(storageKey);
      const lessons = savedData ? JSON.parse(savedData) : [];
      const migratedLessons = migrateLessonsData(lessons);

      setState(() => migratedLessons, 'initial-load');
      showNotification(`Données pour "${classInfo.name}" chargées`, 'info');
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      showNotification("Erreur lors du chargement des données.", "error");
    } finally {
      setIsClassLoading(false);
    }
  }, [setState, getStorageKey, classInfo.name, showNotification]);

  const saveData = useCallback(() => {
    setSaveStatus('saving');
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(lessonsData));
      setTimeout(() => setSaveStatus('saved'), 500);
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
      showNotification("Erreur de sauvegarde.", "error");
      setSaveStatus('unsaved');
    }
  }, [lessonsData, getStorageKey, showNotification]);
  
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
        console.error("Failed to export data", error);
        showNotification("Erreur lors de l'exportation.", "error");
    }
  }, [classInfo, lessonsData, showNotification]);

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
  
  // Mettre à jour le nom de l'enseignant dans les informations de la classe lorsque la configuration change
  useEffect(() => {
    if (config.defaultTeacherName && config.defaultTeacherName !== classInfo.teacherName) {
      handleClassInfoChange({ teacherName: config.defaultTeacherName });
    }
  }, [config.defaultTeacherName]);

  useEffect(() => {
    // If parent component provides a new class info, update it
    setClassInfo(initialClassInfo);
  }, [initialClassInfo]);


  useEffect(() => {
    if (isClassLoading) return;
    if (window.tippy) {
      window.tippy('[data-tippy-content]', {
        animation: 'shift-away',
        theme: 'custom',
      });
    }
  }, [lessonsData, isClassLoading, searchQuery, selectedIndices, editingIndices, activeModal]);

  const handleClassInfoChange = useCallback((newInfo: Partial<ClassInfo>) => {
    const updatedClassInfo = { ...classInfo, ...newInfo };
    setClassInfo(updatedClassInfo);
    
    try {
        const allClasses: ClassInfo[] = JSON.parse(localStorage.getItem('classManager_v1') || '[]');
        const updatedClasses = allClasses.map(c => 
            c.id === updatedClassInfo.id ? updatedClassInfo : c
        );
        localStorage.setItem('classManager_v1', JSON.stringify(updatedClasses));
    } catch (e) {
        console.error("Failed to update class info in storage", e);
        showNotification("Erreur de mise à jour des infos de la classe", "error");
    }
  }, [classInfo, showNotification]);

  
  const handleCellUpdate = useCallback((indices: Indices, field: string, value: any) => {
    setState(draft => {
        const { item } = findItem(draft, indices);
        if (item) {
            (item as any)[field] = value;
        }
    }, 'cell-edit');
    setSaveStatus('unsaved');
  }, [setState]);

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
      setSaveStatus('unsaved');
      setSelectedIndices(null);
    }
  }, [setState, showNotification]);

  const handleOpenAddContentModal = (indices?: Indices) => {
      setSelectedIndices(indices || null);
      setActiveModal('addContent');
  };
  
  const handleModalClose = useCallback(() => {
    setActiveModal(null);
    setSelectedIndices(null);
  }, []);

  const handleConfirmAddContent = useCallback((type: string, data: any) => {
      const refIndices = selectedIndices;
      let notificationMessage = '';
      const newId = crypto.randomUUID();
      
      if (TOP_LEVEL_TYPE_CONFIG.hasOwnProperty(type) && type !== 'chapter' && refIndices) {
          let parentLevelIndices: Indices = { chapterIndex: refIndices.chapterIndex };
          if (refIndices.sectionIndex !== undefined) parentLevelIndices.sectionIndex = refIndices.sectionIndex;
          if (refIndices.subsectionIndex !== undefined) parentLevelIndices.subsectionIndex = refIndices.subsectionIndex;
          if (refIndices.subsubsectionIndex !== undefined) parentLevelIndices.subsubsectionIndex = refIndices.subsubsectionIndex;
          const insertAfterIndex = refIndices.itemIndex;
          const newItem: EmbeddableTopLevelItem = { type: type as EmbeddableTopLevelType, title: data.title, _tempId: newId };
          setState(draft => addItem(draft, parentLevelIndices, newItem, insertAfterIndex), 'add-embedded-item');
          notificationMessage = "Bloc inséré.";
          addNewItemHighlight(newId);
      } else if (TOP_LEVEL_TYPE_CONFIG.hasOwnProperty(type)) {
          const insertAfterIndex = refIndices?.chapterIndex;
          const newItem: TopLevelItem = { type: type as TopLevelItem['type'], title: data.title, _tempId: newId };
          setState(draft => addTopLevelItem(draft, newItem, insertAfterIndex), 'add-top-level');
          notificationMessage = "Élément principal ajouté.";
          addNewItemHighlight(newId);
      } else if (type === 'section' && refIndices) {
          const parentIndices = { chapterIndex: refIndices.chapterIndex };
          const insertAfterIndex = refIndices.sectionIndex;
          const newSection: Section = { name: data.name, items: [], _tempId: newId };
          setState(draft => addSection(draft, parentIndices, newSection, insertAfterIndex), 'add-section');
          notificationMessage = "Section ajoutée.";
          addNewItemHighlight(newId);
      } else if (type === 'item' && refIndices) {
          let parentLevelIndices: Indices = { chapterIndex: refIndices.chapterIndex };
          if (refIndices.sectionIndex !== undefined) parentLevelIndices.sectionIndex = refIndices.sectionIndex;
          if (refIndices.subsectionIndex !== undefined) parentLevelIndices.subsectionIndex = refIndices.subsectionIndex;
          if (refIndices.subsubsectionIndex !== undefined) parentLevelIndices.subsubsectionIndex = refIndices.subsubsectionIndex;
          const insertAfterIndex = refIndices.itemIndex;
          
          const normalizedType = TYPE_MAP[data.type.toLowerCase()] || data.type;
          const newItem: LessonItem = { ...data, type: normalizedType, _tempId: newId };
          setState(draft => addItem(draft, parentLevelIndices, newItem, insertAfterIndex), 'add-item');
          notificationMessage = "Élément ajouté.";
          addNewItemHighlight(newId);
      } else if (type === 'separator' && refIndices) {
          setState(draft => {
              const { item } = findItem(draft, refIndices);
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
        setSaveStatus('unsaved');
      }
      handleModalClose();
  }, [selectedIndices, setState, showNotification, handleModalClose, addNewItemHighlight]);
  
  const handleInitiateInlineEdit = useCallback((indices: Indices) => {
    setEditingIndices(indices);
    setSelectedIndices(null); // Deselect row to avoid visual conflicts
  }, []);

  const handleCancelInlineEdit = useCallback(() => {
    setEditingIndices(null);
  }, []);

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
      setSaveStatus('unsaved');
      setEditingIndices(null);
  }, [setState, showNotification]);

  const handleImport = useCallback((data: any, mode: 'replace' | 'append') => {
      const lessonsToImport = data.lessonsData || data; // supports full export or raw array
      const migratedData = migrateLessonsData(lessonsToImport);
      setState(currentData => (mode === 'replace' ? migratedData : [...currentData, ...migratedData]), 'import-data');
      handleModalClose();
      showNotification("Données importées avec succès!", "success");
      setSaveStatus('unsaved');
  }, [setState, showNotification, handleModalClose]);

  const handleUpdateLessons = useCallback((newLessons: LessonsData) => {
      setState(() => newLessons, 'manage-lessons');
      handleModalClose();
      showNotification(`Leçons mises à jour.`, 'success');
      setSaveStatus('unsaved');
  }, [setState, showNotification, handleModalClose]);
  
  const handleDeleteSeparator = useCallback((indices: Indices) => {
    setState(draft => deleteSeparator(draft, indices), 'delete-separator');
    showNotification("Séparateur supprimé.", "success");
    setSaveStatus('unsaved');
  }, [setState, showNotification]);
  
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
    <div className="relative p-2 sm:p-5 bg-slate-50">
      <div className="container mx-auto max-w-7xl bg-white shadow-2xl p-3 sm:p-6 min-h-[calc(100vh-2.5rem)] flex flex-col print:shadow-none print:border-none print:p-0">
        
        {/* Contenu pour l'écran */}
        <div className="print-hidden flex flex-col flex-1">
          <Header 
            classInfo={classInfo}
            establishmentName={config.establishmentName}
            onClassInfoChange={handleClassInfoChange}
            onBack={onBack}
          />
          <Toolbar
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            onSave={saveData}
            saveStatus={saveStatus}
            onOpenImport={() => setActiveModal('import')}
            onOpenManageLessons={() => setActiveModal('manageLessons')}
            onOpenGuide={() => setActiveModal('guide')}
            onExportData={handleExportData}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <main className="flex-1" onClick={() => setSelectedIndices(null)}>
            <MainTable
              lessonsData={filteredData}
              onCellUpdate={handleCellUpdate}
              onDeleteItem={handleDeleteItem}
              onDeleteSeparator={handleDeleteSeparator}
              onOpenAddContentModal={handleOpenAddContentModal}
              showDescriptions={config.printShowDescriptions}
              selectedIndices={selectedIndices}
              onSelectRow={setSelectedIndices}
              editingIndices={editingIndices}
              onInitiateInlineEdit={handleInitiateInlineEdit}
              onConfirmInlineEdit={handleConfirmInlineEdit}
              onCancelInlineEdit={handleCancelInlineEdit}
              newlyAddedIds={newlyAddedIds}
            />
          </main>
        </div>
        
        {/* Contenu pour l'impression */}
        <PrintView lessonsData={filteredData} classInfo={classInfo} config={config} newlyAddedIds={newlyAddedIds} />
        
      </div>

      {notification && <Notification {...notification} onDismiss={() => setNotification(null)} />}
      
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