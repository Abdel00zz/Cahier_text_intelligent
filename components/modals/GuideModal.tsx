

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GUIDE_FR, GUIDE_AR } from '../../constants';
import { Button } from '../ui/Button';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const lastActiveElRef = useRef<HTMLElement | null>(null);

  // Gestion simplifiée du focus et des événements
  useEffect(() => {
    if (!isOpen) return;
    // store element that had focus before opening modal
    lastActiveElRef.current = document.activeElement as HTMLElement;
    
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
      lastActiveElRef.current?.focus();
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

  // Context-aware section focus: detect current page
  useEffect(() => {
    if (!isOpen) return;
    const isEditor = !!document.querySelector('[data-editor-root]');
    const isDashboard = !!document.querySelector('[data-dashboard-root]');
    const anchor = isEditor ? '#barre-doutils-haut-de-lediteur' : isDashboard ? '#tableau-de-bord' : null;
    if (!anchor) return;
    // try both languages
    const target = document.getElementById(anchor.replace('#',''))
      || document.getElementById(encodeURIComponent(anchor.replace('#','')));
    // Fallback: find by heading text contains
    if (!target) return;
    // scroll containers
    const left = leftRef.current; const right = rightRef.current;
    left?.scrollTo({ top: target.offsetTop - 24, behavior: 'smooth' });
    right?.scrollTo({ top: target.offsetTop - 24, behavior: 'smooth' });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 animate-fade-in overflow-hidden" 
      onClick={onClose}
      data-modal-overlay
    >
      <div 
        ref={modalRef}
  className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl h-[92vh] sm:h-[88vh] flex flex-col animate-slide-in-up border border-gray-100 overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-modal-title"
        aria-describedby="guide-modal-desc"
      >
        {/* Header modern, aligned with Configuration modal */}
  <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center rounded-xl sm:rounded-2xl shadow-lg">
              <i className="fas fa-book-reader text-sm sm:text-base"></i>
            </div>
            <div className="min-w-0">
              <h2 id="guide-modal-title" className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Aide | مساعدة</h2>
              <p id="guide-modal-desc" className="text-xs sm:text-sm text-gray-500 hidden sm:block">Guide bilingue avec astuces, raccourcis et options d’affichage</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
            aria-label="Fermer le guide (Échap)"
          >
            <i className="fas fa-times text-sm sm:text-base"></i>
          </button>
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
              {/* bottom hint removed for compactness */}
            </div>
            <div className="hidden lg:block bg-gradient-to-b from-gray-200 to-gray-300" aria-hidden="true"></div>
            <div
              ref={rightRef}
              className="relative overflow-y-auto overscroll-contain guide-scroll bg-[#FFFBEA]"
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
              {/* bottom hint removed for compactness (Arabic) */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};