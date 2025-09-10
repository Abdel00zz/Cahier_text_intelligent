// Subject color mapping for scientific subjects only
export const getSubjectTextColor = (subject: string): string => {
    // Normalize the subject string (trim and lowercase for comparison)
    const normalizedSubject = subject.trim().toLowerCase();
    
    const subjectColors: Record<string, string> = {
        // Mathematics - Blue tones
        'mathématiques': 'text-blue-600',
        'الرياضيات': 'text-blue-600',
        'math': 'text-blue-600',
        
        // Physics - Purple tones
        'physique': 'text-purple-600',
        'physique-chimie': 'text-purple-600',
        'علوم فيزيائية': 'text-purple-600',
        'sciences physiques': 'text-purple-600',
        
        // Biology/Life Sciences - Green tones
        'sciences de la vie et de la terre': 'text-green-600',
        'sciences de la vie': 'text-green-600',
        'علوم الحياة والأرض': 'text-green-600',
        'biologie': 'text-green-600',
    };
    
    // Try exact match first
    if (subjectColors[normalizedSubject]) {
        return subjectColors[normalizedSubject];
    }
    
    // Try partial match for compound subjects
    for (const [key, color] of Object.entries(subjectColors)) {
        if (normalizedSubject.includes(key) || key.includes(normalizedSubject)) {
            return color;
        }
    }
    
    // Default color if no match found
    return 'text-slate-600';
};

// Get subject badge background color (lighter version for badges) - Scientific subjects only
export const getSubjectBadgeColor = (subject: string): string => {
    const textColor = getSubjectTextColor(subject);
    
    const badgeColors: Record<string, string> = {
        'text-blue-600': 'bg-blue-100 text-blue-800',        // Mathematics
        'text-purple-600': 'bg-purple-100 text-purple-800',  // Physics
        'text-green-600': 'bg-green-100 text-green-800',     // Biology/SVT
        'text-slate-600': 'bg-slate-100 text-slate-800',     // Default
    };
    
    return badgeColors[textColor] || 'bg-slate-100 text-slate-800';
};
