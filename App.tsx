import React, { useState, useCallback } from 'react';
import { MathJaxContext } from 'better-react-mathjax';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/Editor';
import { Spinner } from './components/ui/Spinner';
import { ClassInfo } from './types';
import { useClassManager } from './hooks/useClassManager';


declare global {
  interface Window {
    tippy: (targets: any, options?: any) => any;
  }
}

const mathJaxConfig = {
  loader: { load: ["input/tex", "output/chtml"] },
  tex: {
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    displayMath: [["$$", "$$"], ["\\[", "\\]"]],
  },
};

const App: React.FC = () => {
    const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
    const [activeClass, setActiveClass] = useState<ClassInfo | null>(null);
    const { isLoading: isClassManagerLoading } = useClassManager();

    const handleSelectClass = useCallback((classInfo: ClassInfo) => {
        setActiveClass(classInfo);
        setView('editor');
    }, []);

    const handleBackToDashboard = useCallback(() => {
        setActiveClass(null);
        setView('dashboard');
    }, []);

    const renderContent = () => {
        if (isClassManagerLoading) {
            return <Spinner fullPage text="Chargement de l'application..." />;
        }

        if (view === 'editor' && activeClass) {
            return <Editor classInfo={activeClass} onBack={handleBackToDashboard} />;
        }

        return <Dashboard onSelectClass={handleSelectClass} />;
    };

    return (
      <MathJaxContext config={mathJaxConfig}>
        <div className="min-h-screen bg-slate-100 text-slate-800">
          {renderContent()}
        </div>
      </MathJaxContext>
    );
};

export default App;