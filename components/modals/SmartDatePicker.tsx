import { useState, useEffect, useMemo, FC } from 'react';
import { Button } from '../ui/Button';

interface SmartDatePickerProps {
  isOpen: boolean;
  initialDate?: string;
  onClose: () => void;
  onSave: (date: string | '') => void;
}

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const WEEKDAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export const SmartDatePicker: FC<SmartDatePickerProps> = ({ isOpen, initialDate, onClose, onSave }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'quick'>('quick');

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  useEffect(() => {
    if (isOpen) {
      if (initialDate) {
        const parsed = new Date(initialDate);
        if (!isNaN(parsed.getTime())) {
          setSelectedDate(parsed);
        }
      } else {
        setSelectedDate(today);
      }
      setViewMode('quick');
    }
  }, [isOpen, initialDate]);

  const quickOptions = useMemo(() => [
    { 
      label: 'Aujourd\'hui', 
      shortLabel: 'Aujourd\'hui',
      date: today, 
      icon: 'fas fa-calendar-day', 
      color: 'bg-teal-500',
      description: today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    },
    { 
      label: 'Demain', 
      shortLabel: 'Demain',
      date: tomorrow, 
      icon: 'fas fa-calendar-plus', 
      color: 'bg-blue-500',
      description: tomorrow.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    },
    { 
      label: 'Dans une semaine', 
      shortLabel: 'Semaine +',
      date: nextWeek, 
      icon: 'fas fa-calendar-week', 
      color: 'bg-purple-500',
      description: nextWeek.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    },
  ], [today, tomorrow, nextWeek]);

  const generateCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().slice(0, 10);
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const handleQuickSelect = (date: Date) => {
    onSave(formatDate(date));
    onClose();
  };

  const handleCalendarSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSave = () => {
    onSave(formatDate(selectedDate));
    onClose();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  if (!isOpen) return null;

  const calendarDays = generateCalendar();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[90vh] sm:max-h-[90vh] overflow-hidden animate-slide-in-up flex flex-col" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="smart-date-title">
        
        {/* Header - Fixed */}
        <div className="p-4 sm:p-4 border-b border-slate-200 flex-shrink-0 bg-white">
          <div className="flex items-center justify-between">
            <h3 id="smart-date-title" className="text-lg font-semibold font-slab text-slate-900">Choisir une date</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'quick' ? 'calendar' : 'quick')}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:text-teal-600 hover:bg-slate-100 transition-colors"
                aria-label={viewMode === 'quick' ? 'Voir calendrier' : 'Sélection rapide'}
              >
                <i className={`text-lg ${viewMode === 'quick' ? 'fas fa-calendar-alt' : 'fas fa-bolt'}`}></i>
              </button>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Fermer"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'quick' ? (
            <div className="p-4 sm:p-4 space-y-4">
              <h4 className="text-sm font-medium text-slate-700 mb-4">Sélection rapide</h4>
              
              {/* Quick Options - Mobile Optimized */}
              <div className="space-y-3">
                {quickOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSelect(option.date)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all group active:scale-[0.98] touch-manipulation"
                  >
                    <div className={`w-12 h-12 rounded-full ${option.color} flex items-center justify-center text-white flex-shrink-0`}>
                      <i className={`${option.icon} text-lg`}></i>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-slate-800 group-hover:text-teal-700 text-base">{option.label}</p>
                      <p className="text-sm text-slate-500 truncate">{option.description}</p>
                    </div>
                    <i className="fas fa-chevron-right text-slate-400 group-hover:text-teal-500 text-sm flex-shrink-0"></i>
                  </button>
                ))}
              </div>
              
              {/* Custom Date Button */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => setViewMode('calendar')}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition-all touch-manipulation"
                >
                  <i className="fas fa-calendar-alt text-lg"></i>
                  <span className="font-medium">Choisir une autre date...</span>
                </button>
              </div>

              {/* Clear Date Option */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onSave('');
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-600 hover:text-red-700 transition-all touch-manipulation"
                >
                  <i className="fas fa-eraser"></i>
                  <span className="font-medium">Effacer la date</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-4 space-y-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-800 touch-manipulation"
                >
                  <i className="fas fa-chevron-left text-lg"></i>
                </button>
                <h4 className="text-lg font-semibold text-slate-800 text-center">
                  {MONTHS_FR[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </h4>
                <button
                  onClick={() => navigateMonth('next')}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-800 touch-manipulation"
                >
                  <i className="fas fa-chevron-right text-lg"></i>
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Weekday headers */}
                {WEEKDAYS_FR.map(day => (
                  <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-slate-500">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                  const isTodayDate = isToday(day);
                  const isSelected = isSameDay(day, selectedDate);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleCalendarSelect(day)}
                      className={`
                        h-12 flex items-center justify-center text-sm rounded-xl transition-all touch-manipulation
                        ${isCurrentMonth ? 'text-slate-800' : 'text-slate-400'}
                        ${isTodayDate ? 'bg-teal-100 text-teal-700 font-semibold' : ''}
                        ${isSelected ? 'bg-teal-600 text-white font-semibold shadow-lg' : 'hover:bg-slate-100'}
                        ${!isCurrentMonth ? 'opacity-50' : ''}
                      `}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            {viewMode === 'calendar' && (
              <Button 
                variant="primary" 
                onClick={handleSave}
                className="flex-1 h-12 text-base"
              >
                <i className="fas fa-check mr-2"></i>
                Confirmer
              </Button>
            )}
            <Button 
              variant="secondary" 
              onClick={onClose}
              className={`h-12 text-base ${viewMode === 'calendar' ? 'px-6' : 'flex-1'}`}
            >
              Annuler
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
