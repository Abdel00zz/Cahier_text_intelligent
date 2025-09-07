import React, { useState, useEffect, useMemo } from 'react';
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

export const SmartDatePicker: React.FC<SmartDatePickerProps> = ({ isOpen, initialDate, onClose, onSave }) => {
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
    { label: 'Aujourd\'hui', date: today, icon: 'fas fa-calendar-day', color: 'bg-teal-500' },
    { label: 'Demain', date: tomorrow, icon: 'fas fa-calendar-plus', color: 'bg-blue-500' },
    { label: 'Dans une semaine', date: nextWeek, icon: 'fas fa-calendar-week', color: 'bg-purple-500' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold font-slab text-slate-900">Choisir une date</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'quick' ? 'calendar' : 'quick')}
              className="text-slate-500 hover:text-teal-600 transition-colors"
            >
              <i className={viewMode === 'quick' ? 'fas fa-calendar-alt' : 'fas fa-bolt'}></i>
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="p-4">
          {viewMode === 'quick' ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Sélection rapide</h4>
              {quickOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSelect(option.date)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-full ${option.color} flex items-center justify-center text-white`}>
                    <i className={option.icon}></i>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-slate-800 group-hover:text-teal-700">{option.label}</p>
                    <p className="text-sm text-slate-500">{option.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  </div>
                  <i className="fas fa-chevron-right text-slate-400 group-hover:text-teal-500"></i>
                </button>
              ))}
              
              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={() => setViewMode('calendar')}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition-all"
                >
                  <i className="fas fa-calendar-alt"></i>
                  <span>Autre date...</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-800"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <h4 className="text-lg font-semibold text-slate-800">
                  {MONTHS_FR[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </h4>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-800"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS_FR.map(day => (
                  <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-slate-500">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                  const isTodayDate = isToday(day);
                  const isSelected = isSameDay(day, selectedDate);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleCalendarSelect(day)}
                      className={`
                        h-10 flex items-center justify-center text-sm rounded-lg transition-all
                        ${isCurrentMonth ? 'text-slate-800' : 'text-slate-400'}
                        ${isTodayDate ? 'bg-teal-100 text-teal-700 font-semibold' : ''}
                        ${isSelected ? 'bg-teal-600 text-white font-semibold' : 'hover:bg-slate-100'}
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

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => onSave('')}>
              <i className="fas fa-eraser mr-1"></i> Effacer
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>Annuler</Button>
            {viewMode === 'calendar' && (
              <Button variant="primary" onClick={handleSave}>Confirmer</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
