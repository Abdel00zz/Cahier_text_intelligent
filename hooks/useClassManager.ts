import { useCallback, useEffect, useState } from 'react';
import { useImmer } from 'use-immer';
import { ClassInfo } from '../types';
import { logger } from '../utils/logger';

const STORAGE_KEY = 'classManager_v1';
const CLASS_DATA_PREFIX = 'classData_v1_';
const FIRST_LAUNCH_KEY = 'app_first_launch_v1';

const generateColor = () => {
    // Soft, cool palette: cold blues, teals, soft greens, gentle oranges
    const colors = [
        '#93c5fd', // blue-300
        '#bfdbfe', // blue-200
        '#7dd3fc', // sky-300
        '#a5f3fc', // cyan-200
        '#99f6e4', // teal-200
        '#86efac', // green-300
        '#fde68a', // amber-300
        '#fbbf24', // amber-400 (gentle orange)
        '#fca5a5', // red-300 (soft)
        '#c4b5fd', // violet-300
        '#a78bfa', // violet-400 (soft)
        '#f9a8d4'  // pink-300 (soft)
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

export const useClassManager = () => {
    const [classes, setClasses] = useImmer<ClassInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadClasses = async () => {
            try {
                const storedClasses = localStorage.getItem(STORAGE_KEY);
                const isFirstLaunch = !localStorage.getItem(FIRST_LAUNCH_KEY);

                if (storedClasses) {
                    // Always ensure demo class is present
                    const existing: ClassInfo[] = JSON.parse(storedClasses);
                    const hasDemo = existing.some(c => c.name === 'Tronc commun scientifique');
                    if (hasDemo) {
                        setClasses(existing);
                    } else {
                        try {
                            const base = (import.meta as any).env?.BASE_URL || '/';
                            const demoFilename = 'Tronc commun scientifique.json';
                            const resp = await fetch(`${base}Demo/${encodeURIComponent(demoFilename)}`);
                            if (resp.ok) {
                                const defaultClassData = await resp.json();
                                const demoClass: ClassInfo = {
                                    id: crypto.randomUUID(),
                                    name: defaultClassData.classInfo?.name || 'Tronc commun scientifique',
                                    subject: defaultClassData.classInfo?.subject || 'Mathématiques',
                                    teacherName: defaultClassData.classInfo?.teacherName || 'Professeur',
                                    createdAt: new Date().toISOString(),
                                    color: '#99f6e4',
                                    cycle: 'lycee',
                                };
                                const combined = [...existing, demoClass];
                                setClasses(combined);
                                localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
                                localStorage.setItem(`${CLASS_DATA_PREFIX}${demoClass.id}`, JSON.stringify(defaultClassData.lessonsData || []));
                            } else {
                                setClasses(existing);
                            }
                            // Always ensure '1ère année collégiale' demo is present
                            try {
                                const allClasses: ClassInfo[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                                const hasMathDemo = allClasses.some(c => c.name === '1ère année collégiale');
                                if (!hasMathDemo) {
                                    const base = (import.meta as any).env?.BASE_URL || '/';
                                    const demoFilename2 = '1er anne collegial math.json';
                                    const resp2 = await fetch(`${base}Demo/${encodeURIComponent(demoFilename2)}`);
                                    if (resp2.ok) {
                                        const data2 = await resp2.json();
                                        const demoClass2: ClassInfo = {
                                            id: crypto.randomUUID(),
                                            name: data2.classInfo?.name || '1ère année collégiale',
                                            subject: data2.classInfo?.subject || 'Mathématiques',
                                            teacherName: data2.classInfo?.teacherName || 'Professeur',
                                            createdAt: new Date().toISOString(),
                                            color: data2.classInfo?.color || generateColor(),
                                            cycle: data2.classInfo?.cycle || 'college',
                                        };
                                        const updated = [...allClasses, demoClass2];
                                        setClasses(updated);
                                        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                                        localStorage.setItem(`${CLASS_DATA_PREFIX}${demoClass2.id}`, JSON.stringify(data2.lessonsData || []));
                                    }
                                }
                            } catch {
                                // ignore demo math seed errors
                            }
                        } catch {
                            setClasses(existing);
                        }
                    }
                } else if (isFirstLaunch) {
                    // Load default class on first launch
                    let createdDefault = false;
                    try {
                        // Use Vite BASE_URL to work under subpaths in production
                        const base = (import.meta as any).env?.BASE_URL || '/';
                        const demoFilename = 'Tronc commun scientifique.json';
                        const response = await fetch(`${base}Demo/${encodeURIComponent(demoFilename)}`);
                        if (response.ok) {
                            const defaultClassData = await response.json();

                            const defaultClass: ClassInfo = {
                                id: crypto.randomUUID(),
                                name: defaultClassData.classInfo?.name || 'Tronc commun scientifique',
                                subject: defaultClassData.classInfo?.subject || 'Mathématiques',
                                teacherName: defaultClassData.classInfo?.teacherName || 'Professeur',
                                createdAt: new Date().toISOString(),
                                color: '#99f6e4',
                                cycle: 'lycee',
                            };

                            setClasses([defaultClass]);
                            localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultClass]));
                            localStorage.setItem(`${CLASS_DATA_PREFIX}${defaultClass.id}`, JSON.stringify(defaultClassData.lessonsData || []));
                            createdDefault = true;
                            logger.info("Default class 'Tronc commun scientifique' loaded from JSON");
                        } else {
                            logger.warn?.("Default JSON not found (HTTP " + response.status + "), creating empty default class.");
                        }
                    } catch (error) {
                        logger.error("Failed to load default class JSON, creating empty default class", error);
                    }

                    if (!createdDefault) {
                        const defaultClass: ClassInfo = {
                            id: crypto.randomUUID(),
                            name: 'Tronc commun scientifique',
                            subject: 'Mathématiques',
                            teacherName: 'Professeur',
                            createdAt: new Date().toISOString(),
                            color: '#99f6e4',
                            cycle: 'lycee',
                        };
                        setClasses([defaultClass]);
                        localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultClass]));
                        localStorage.setItem(`${CLASS_DATA_PREFIX}${defaultClass.id}`, JSON.stringify([]));
                    }

                    // Also seed '1ère année collégiale' demo class on first launch
                    try {
                        const base2 = (import.meta as any).env?.BASE_URL || '/';
                        const demoFilename2 = '1er anne collegial math.json';
                        const respMath = await fetch(`${base2}Demo/${encodeURIComponent(demoFilename2)}`);
                        if (respMath.ok) {
                            const dataMath = await respMath.json();
                            const mathDemo: ClassInfo = {
                                id: crypto.randomUUID(),
                                name: dataMath.classInfo?.name || '1ère année collégiale',
                                subject: dataMath.classInfo?.subject || 'Mathématiques',
                                teacherName: dataMath.classInfo?.teacherName || 'Professeur',
                                createdAt: new Date().toISOString(),
                                color: dataMath.classInfo?.color || generateColor(),
                                cycle: dataMath.classInfo?.cycle || 'college',
                            };
                            // Append to existing classes
                            setClasses(draft => {
                                draft.push(mathDemo);
                            });
                            // Save to storage
                            const updatedList = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                            updatedList.push(mathDemo);
                            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
                            localStorage.setItem(`${CLASS_DATA_PREFIX}${mathDemo.id}`, JSON.stringify(dataMath.lessonsData || []));
                        }
                    } catch {
                        // ignore math demo errors
                    }
                    // Mark that the app has been launched
                    localStorage.setItem(FIRST_LAUNCH_KEY, 'true');
                }
            } catch (error) {
                logger.error("Failed to load classes from localStorage", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadClasses();
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
            cycle: classDetails.cycle ?? 'college',
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