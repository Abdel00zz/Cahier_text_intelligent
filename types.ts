

export type Cycle = 'college' | 'lycee' | 'prepa';

export interface ClassInfo {
  id: string;
  name: string; // Formerly className
  teacherName: string;
  subject: string;
  createdAt: string;
  color: string;
    cycle?: Cycle; // optional for backward compatibility
}

export interface AppSettings {
    // This can be used for future class-specific settings, like curriculum, etc.
}

export interface AppConfig {
  establishmentName: string;
  defaultTeacherName: string;
  printShowDescriptions: boolean;
  theme: 'light' | 'dark' | 'system';
    // New flexible description visibility controls
    screenDescriptionMode?: 'all' | 'none' | 'custom';
    screenDescriptionTypes?: string[];
    printDescriptionMode?: 'all' | 'none' | 'custom';
    printDescriptionTypes?: string[];
    // User preferences for display filtering
    selectedCycles?: Cycle[];
    selectedSubjects?: string[];
    showAllCycles?: boolean;
    showAllSubjects?: boolean;
    // Welcome flow control
    hasCompletedWelcome?: boolean;
}

export type TopLevelType = 
    | 'chapter' 
    | 'evaluation_diagnostic'
    | 'devoir_maison'
    | 'controle_continu'
    | 'correction_devoir_maison'
    | 'correction_controle_continu';

export type EmbeddableTopLevelType = Exclude<TopLevelType, 'chapter'>;

export type ElementType = 
    | TopLevelType
    | 'section' 
    | 'subsection' 
    | 'subsubsection' 
    | 'item'
    | 'separator';

export interface Indices {
    chapterIndex: number;
    sectionIndex?: number;
    subsectionIndex?: number;
    subsubsectionIndex?: number;
    itemIndex?: number;
    isSeparator?: boolean;
}

export interface Separator {
    content: string;
    date: string;
    manual?: boolean;
    remark?: string;
    _tempId?: string;
}

export interface LessonItem {
    type: string;
    number?: string | number;
    title?: string;
    description?: string;
    page?: string | number;
    date?: string;
    remark?: string;
    separatorAfter?: Separator;
    _tempId?: string;
}

interface BaseTopLevelItem {
    title: string;
    date?: string;
    remark?: string;
    separatorAfter?: Separator;
    _tempId?: string;
}

export type EmbeddableTopLevelItem = BaseTopLevelItem & {
    type: EmbeddableTopLevelType;
};


export interface SubSubSection {
    name: string;
    items?: (LessonItem | EmbeddableTopLevelItem)[];
    date?: string;
    remark?: string;
    separatorAfter?: Separator;
    _tempId?: string;
}

export interface SubSection {
    name: string;
    subsubsections?: SubSubSection[];
    items?: (LessonItem | EmbeddableTopLevelItem)[];
    date?: string;
    remark?: string;
    separatorAfter?: Separator;
    _tempId?: string;
}

export interface Section {
    name: string;
    subsections?: SubSection[];
    items?: (LessonItem | EmbeddableTopLevelItem)[];
    date?: string;
    remark?: string;
    separatorAfter?: Separator;
    _tempId?: string;
}


export interface TopLevelItem extends BaseTopLevelItem {
    type: 'chapter' | EmbeddableTopLevelType;
    sections?: Section[];
}

export type LessonsData = TopLevelItem[];