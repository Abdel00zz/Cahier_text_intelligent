import { useCallback, useEffect, useState } from 'react';
import { useImmer } from 'use-immer';
import { ClassInfo } from '../types';
import { logger } from '../utils/logger';

const STORAGE_KEY = 'classManager_v1';
const CLASS_DATA_PREFIX = 'classData_v1_';

const generateColor = () => {
    const colors = [
        '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

export const useClassManager = () => {
    const [classes, setClasses] = useImmer<ClassInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedClasses = localStorage.getItem(STORAGE_KEY);
            if (storedClasses) {
                setClasses(JSON.parse(storedClasses));
            }
        } catch (error) {
            logger.error("Failed to load classes from localStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, [setClasses]);

    const saveClasses = useCallback((updatedClasses: ClassInfo[] | ((draft: ClassInfo[]) => void)) => {
        try {
            // use-immer's updater function can be a new array or a function
            if (typeof updatedClasses === 'function') {
                // If it's a function, we need to get the current state to save it
                setClasses(draft => {
                    updatedClasses(draft);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
                });
            } else {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClasses));
                setClasses(updatedClasses);
            }
        } catch (error) {
            logger.error("Failed to save classes to localStorage", error);
        }
    }, [setClasses]);

    const addClass = useCallback((classDetails: Omit<ClassInfo, 'id' | 'createdAt' | 'color'>) => {
        const newClass: ClassInfo = {
            ...classDetails,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            color: generateColor(),
        };
        
        saveClasses(draft => {
            draft.push(newClass);
        });

        localStorage.setItem(`${CLASS_DATA_PREFIX}${newClass.id}`, JSON.stringify([]));
        return newClass;
    }, [saveClasses]);

    const deleteClass = useCallback((classId: string) => {
        const classToDelete = classes.find(c => c.id === classId);
        if (!classToDelete) return;

        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la classe "${classToDelete.name}" ? Cette action est irréversible.`)) {
            saveClasses(draft => {
                const index = draft.findIndex(c => c.id === classId);
                if (index !== -1) {
                    draft.splice(index, 1);
                }
            });
            localStorage.removeItem(`${CLASS_DATA_PREFIX}${classId}`);
        }
    }, [classes, saveClasses]);
    
    const updateClass = useCallback((classId: string, updatedInfo: Partial<Omit<ClassInfo, 'id'>>) => {
        saveClasses(draft => {
            const classToUpdate = draft.find(c => c.id === classId);
            if (classToUpdate) {
                Object.assign(classToUpdate, updatedInfo);
            }
        });
    }, [saveClasses]);

    return { classes, addClass, deleteClass, updateClass, isLoading };
};