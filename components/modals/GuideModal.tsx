

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GUIDE_FR, GUIDE_AR } from '../../constants';
import { Button } from '../ui/Button';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  // Gestion simplifiée du focus et des événements
  useEffect(() => {
    if (!isOpen) return;

    const lastActiveElement = document.activeElement as HTMLElement;
    
    // Mettre le focus sur le modal
    modalRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Fermer avec la touche Echap
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Piéger le focus à l'intérieur du modal
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) { // Maj + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restaurer le focus sur l'élément précédent
      lastActiveElement?.focus();
    };
  }, [isOpen, onClose]);

  const slugify = (txt: string) =>
    encodeURIComponent(
      txt
        .toLowerCase()
        .replace(/<[^>]*>/g, '') // strip HTML tags like <i>
        .normalize('NFD')
        .replace(/\p{Diacritic}+/gu, '')
        .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
        .trim()
        .replace(/\s+/g, '-')
    );

  const toHtml = (markdown: string) => {
    return markdown
      .replace(/^# (.+)/gm, (_, t) => `<h1 id="${slugify(t)}" class="text-2xl font-bold font-slab mb-6 text-teal-700 text-center">${t}</h1>`)
      .replace(/^## (.+)/gm, (_, t) => `<h2 id="${slugify(t)}" class="text-xl font-semibold font-slab mt-8 mb-4 pb-2 border-b border-slate-200 text-teal-600 flex items-center gap-2">${t}</h2>`)
      .replace(/^### (.+)/gm, (_, t) => `<h3 id="${slugify(t)}" class="text-lg font-semibold mt-6 mb-3">${t}</h3>`)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code class="bg-slate-100 text-red-600 px-1.5 py-0.5 rounded-md text-sm">$1</code>')
      .replace(/^---$/gm, '<hr class="my-6 border-slate-200">')
      .replace(/\[(.+?)\]\(mailto:(.+?)\)/g, '<a href="mailto:$2" class="text-teal-600 hover:underline">$1</a>')
      .replace(/<i class="(.+?)"><\/i>/g, '<i class="$1"></i>')
      .split('\n').map(p => p.trim() ? `<p class="mb-3 leading-relaxed">${p}</p>` : '').join('')
      .replace(/<p><(h[1-3]|hr)>/g, (match) => match.replace('<p>', ''))
      .replace(/<\/(h[1-3]|hr)><\/p>/g, (match) => match.replace('</p>', ''));
  };

  const htmlFr = useMemo(() => toHtml(GUIDE_FR), []);
  const htmlAr = useMemo(() => toHtml(GUIDE_AR), []);

  const buildTOC = (md: string) => {
    return md
      .split('\n')
      .filter(l => /^## |^### /.test(l))
      .map(l => {
        const level = l.startsWith('###') ? 3 : 2;
        const text = l.replace(/^###?\s+/, '').trim();
        return { id: slugify(text), text, level };
      });
  };

  const tocFr = useMemo(() => buildTOC(GUIDE_FR), []);
  const tocAr = useMemo(() => buildTOC(GUIDE_AR), []);

  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [leftHasMore, setLeftHasMore] = useState(true);
  const [rightHasMore, setRightHasMore] = useState(true);

  // Update gradient visibility on mount and on resize
  useEffect(() => {
    const update = () => {
      const L = leftRef.current; const R = rightRef.current;
      if (L) setLeftHasMore(L.scrollTop + L.clientHeight < L.scrollHeight - 4);
      if (R) setRightHasMore(R.scrollTop + R.clientHeight < R.scrollHeight - 4);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-2 sm:p-4 animate-fade-in overflow-hidden" 
      onClick={onClose}
      data-modal-overlay
      style={{ backdropFilter: 'blur(2px)' }}
    >
      <div 
        ref={modalRef}
        className="bg-white shadow-2xl w-full max-w-7xl h-[96vh] sm:h-[90vh] flex flex-col animate-slide-in-up border border-slate-300" 
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-modal-title"
        aria-describedby="guide-modal-desc"
        style={{ 
          outline: '2px solid #0d9488',
          outlineOffset: '1px',
          borderRadius: '0px'
        }}
      >
        <div className="border-b border-slate-300 flex items-center gap-3 flex-shrink-0 bg-gradient-to-r from-teal-600 to-teal-700 text-white p-3 sm:p-4">
            <div className="flex-1 min-w-0">
              <h2 id="guide-modal-title" className="text-lg sm:text-xl font-bold font-slab flex items-center gap-3">
                <i className="fas fa-book-reader text-teal-200"></i>
                Guide d'Aide Complet | دليل المساعدة الشامل
              </h2>
              <p id="guide-modal-desc" className="text-xs sm:text-sm text-teal-100 mt-1">
                <i className="fas fa-keyboard mr-1"></i>
                Navigation: Flèches ↑↓, molette souris, barres de défilement • إغلاق: Échap/ESC • 
                <i className="fas fa-mouse mr-1"></i>
                Clic extérieur pour fermer
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                aria-label="Fermer le guide (Échap)" 
                variant="secondary" 
                size="sm" 
                onClick={onClose} 
                className="bg-red-500 hover:bg-red-600 text-white border border-red-400 px-3 py-2"
              >
                <i className="fas fa-times mr-1"></i>
                <span className="hidden sm:inline">Fermer</span>
              </Button>
            </div>
        </div>
        <div className="flex-1 min-h-0 bg-slate-50">
          <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_2px_1fr]">
            <div
              ref={leftRef}
              className="relative overflow-y-auto overscroll-contain guide-scroll bg-white"
              style={{ scrollbarGutter: 'stable' }}
              onScroll={(e) => {
                const el = e.currentTarget;
                setLeftHasMore(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
              }}
            >
              <div className="p-4 sm:p-6">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: htmlFr }} />
              </div>
              {leftHasMore && (
                <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-12 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-2">
                  <div className="text-xs text-slate-500 bg-white/90 px-2 py-1 rounded-full border">
                    <i className="fas fa-chevron-down animate-bounce"></i> Plus de contenu
                  </div>
                </div>
              )}
            </div>
            <div className="hidden lg:block bg-gradient-to-b from-slate-300 to-slate-400" aria-hidden="true"></div>
            <div
              ref={rightRef}
              className="relative overflow-y-auto overscroll-contain guide-scroll bg-amber-50/30"
              style={{ scrollbarGutter: 'stable' }}
              dir="rtl" lang="ar"
              onScroll={(e) => {
                const el = e.currentTarget;
                setRightHasMore(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
              }}
            >
              <div className="p-4 sm:p-6">
                <div className="prose max-w-none text-right font-ar text-base sm:text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: htmlAr }} />
              </div>
              {rightHasMore && (
                <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-12 bg-gradient-to-t from-amber-50 via-amber-50/80 to-transparent flex items-end justify-center pb-2">
                  <div className="text-xs text-amber-700 bg-amber-100/90 px-2 py-1 rounded-full border border-amber-300 font-ar">
                    <i className="fas fa-chevron-down animate-bounce"></i> المزيد من المحتوى
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};