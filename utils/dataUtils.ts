


import { produce, Draft } from 'immer';
import { LessonsData, Indices, TopLevelItem, LessonItem, Section, SubSection, SubSubSection, EmbeddableTopLevelItem, Separator } from '../types';
import { logger } from './logger';
import { memoize } from './performance';

type DataItem = TopLevelItem | Section | SubSection | SubSubSection | LessonItem;

export const findItem = (data: LessonsData | any, indices: Indices): { item: DataItem | null, parent: DataItem | any[] | null, targetIndex: number | string | null } => {
    if (indices.chapterIndex === undefined || !data[indices.chapterIndex]) {
        return { item: null, parent: null, targetIndex: null };
    }
    
    let parent: any = data;
    let item: any = data[indices.chapterIndex];
    let targetIndex: number | string = indices.chapterIndex;

    if (indices.sectionIndex !== undefined) {
        if (!item.sections?.[indices.sectionIndex]) return { item: null, parent: null, targetIndex: null };
        parent = item.sections;
        targetIndex = indices.sectionIndex;
        item = parent[targetIndex];
    }

    if (indices.subsectionIndex !== undefined) {
        if (!item.subsections?.[indices.subsectionIndex]) return { item: null, parent: null, targetIndex: null };
        parent = item.subsections;
        targetIndex = indices.subsectionIndex;
        item = parent[targetIndex];
    }
    
    if (indices.subsubsectionIndex !== undefined) {
        if (!item.subsubsections?.[indices.subsubsectionIndex]) return { item: null, parent: null, targetIndex: null };
        parent = item.subsubsections;
        targetIndex = indices.subsubsectionIndex;
        item = parent[targetIndex];
    }
    
    if (indices.itemIndex !== undefined) {
        if (!item.items?.[indices.itemIndex]) return { item: null, parent: null, targetIndex: null };
        parent = item.items;
        targetIndex = indices.itemIndex;
        item = parent[targetIndex];
    }

    if (indices.isSeparator) {
      const container = item;
      return { item: container?.separatorAfter ?? null, parent: container, targetIndex: 'separatorAfter' };
    }
    
    return { item, parent, targetIndex };
};


export const addTopLevelItem = (draft: Draft<LessonsData>, newItem: TopLevelItem, insertAfterIndex?: number): void => {
    // Initialiser les sections pour les chapitres et les évaluations
    if ((newItem.type === 'chapter' || newItem.type.startsWith('evaluation_') || newItem.type.startsWith('devoir_') || newItem.type.startsWith('controle_') || newItem.type.startsWith('correction_')) && !newItem.sections) {
        (newItem as any).sections = [];
    }
    const index = insertAfterIndex !== undefined ? insertAfterIndex + 1 : draft.length;
    draft.splice(index, 0, newItem);
};

export const addSection = (draft: Draft<LessonsData>, chapterIndices: Indices, newSection: Section, insertAfterIndex?: number): void => {
    const { item: topLevelItem } = findItem(draft, { chapterIndex: chapterIndices.chapterIndex });
    if (topLevelItem && 'sections' in topLevelItem && 
        (topLevelItem.type === 'chapter' || 
         topLevelItem.type.startsWith('evaluation_') || 
         topLevelItem.type.startsWith('devoir_') || 
         topLevelItem.type.startsWith('controle_') || 
         topLevelItem.type.startsWith('correction_'))) {
        
        if (!topLevelItem.sections) {
            topLevelItem.sections = [];
        }
        if (!newSection.items) {
            newSection.items = [];
        }
        const index = insertAfterIndex !== undefined ? insertAfterIndex + 1 : topLevelItem.sections.length;
        topLevelItem.sections.splice(index, 0, newSection);
    }
};

export const addItem = (draft: Draft<LessonsData>, parentIndices: Indices, newItem: LessonItem | EmbeddableTopLevelItem, insertAfterIndex?: number): void => {
    const { item: container } = findItem(draft, parentIndices);
    if (container && 'items' in container) {
        if (!container.items) {
            container.items = [];
        }
        // If inserting into a section without a specific item reference, add to the top.
        // Otherwise, insert after the specified item.
        const index = insertAfterIndex !== undefined ? insertAfterIndex + 1 : 0;
        container.items.splice(index, 0, newItem);
    }
};

export const deleteSeparator = (draft: Draft<LessonsData>, itemIndices: Indices): void => {
    const { item } = findItem(draft, itemIndices);
    if (item && 'separatorAfter' in item) {
        delete item.separatorAfter;
    }
};

export const formatModernDate = memoize((dateString: string): { day: string; month: string; year: string } | null => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return null;
        }
        const day = date.toLocaleDateString('fr-FR', { day: '2-digit' });
        const month = date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
        const year = date.toLocaleDateString('fr-FR', { year: 'numeric' });
        return { day, month, year };
    } catch (error) {
        logger.error("Error formatting date:", dateString, error);
        return null;
    }
});

// Compact date formatter: returns dd/mm/yyyy from ISO (yyyy-mm-dd) without timezone shifts
export const formatDateDDMMYYYY = memoize((dateString: string): string | null => {
    if (!dateString || typeof dateString !== 'string') return null;
    // Prefer strict ISO split to avoid local timezone issues
    const m = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
        const [, y, mo, d] = m;
        return `${d}/${mo}/${y}`;
    }
    // Fallback: try to parse a general date string
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = String(date.getFullYear());
        return `${dd}/${mm}/${yyyy}`;
    } catch {
        return null;
    }
});

export const migrateLessonsData = (data: any): LessonsData => {
    if (!Array.isArray(data)) {
        logger.warn("Migration attempted on non-array data. Returning empty array.", data);
        return [];
    }

    return produce(data, draft => {
        draft.forEach((item: any, index: number) => {
            if (typeof item !== 'object' || item === null) {
                logger.error(`Invalid data at index ${index}, skipping.`, item);
                return;
            }

            // Case 1: Oldest format with 'chapter' property (string) instead of 'title'
            if (typeof item.chapter === 'string' && item.title === undefined) {
                item.title = item.chapter;
                delete item.chapter;
            }

            // Case 2: Missing 'type' property. Default to 'chapter'.
            if (item.type === undefined) {
                item.type = 'chapter';
            }

            // Ensure title is a string. If it's missing or not a string, set to empty string.
            if (typeof item.title !== 'string') {
                item.title = '';
            }
        });
    }) as LessonsData;
};