import React, { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isToday,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2, Plus, ClipboardCheck, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EventItem {
  id: string;
  title: string;
  date: string; // formato YYYY-MM-DD
}

export const CalendarSimples: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Inicia sem nenhuma data selecionada
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventTitle, setEventTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Busca os eventos do mês atual
  const fetchEvents = async () => {
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar eventos:', error);
    } else if (data) {
      setEvents(data);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  // Alterna a seleção de uma data (marca ou desmarca)
  const handleDateClick = (day: Date) => {
    if (selectedDate && isSameDay(day, selectedDate)) {
      // Se já estiver selecionada, desmarca e fecha o formulário
      setSelectedDate(null);
    } else {
      // Se não, seleciona a nova data
      setSelectedDate(day);
    }
  };

  // Adiciona um novo evento
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !selectedDate) return;

    setLoading(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('events')
      .insert([{ title: eventTitle, date: dateStr }])
      .select();

    if (error) {
      console.error('Erro ao adicionar evento:', error);
    } else if (data) {
      setEvents((prev) => [...prev, ...data].sort((a, b) => a.date.localeCompare(b.date)));
      setEventTitle('');
      setSelectedDate(null); // Desmarca a data e fecha o formulário
    }
    setLoading(false);
  };

  // Exclui um evento
  const handleDeleteEvent = async (id: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir evento:', error);
    } else {
      setEvents((prev) => prev.filter((event) => event.id !== id));
    }
  };

  // Cabeçalho com o mês e navegação
  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white rounded-t-xl">
        <div className="flex items-center space-x-2">
          <ClipboardCheck className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
        </div>
        <div className="flex space-x-1">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white"
            title="Mês anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white"
            title="Próximo mês"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderDaysHeader = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return (
      <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200 text-center py-2">
        {days.map((day, i) => (
          <div key={i} className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'yyyy-MM-dd');
        const cloneDay = day;
        
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
        const isCurrentDay = isToday(day);
        const hasEvent = events.some((event) => event.date === formattedDate);

        // Estilização dinâmica por dia
        let dayClasses = "h-14 border border-slate-100 p-1 relative flex flex-col justify-between cursor-pointer transition-all transition-duration-150 ";

        if (!isCurrentMonth) {
          dayClasses += "bg-slate-50 text-slate-300 cursor-not-allowed ";
        } else {
          dayClasses += "hover:bg-amber-50/50 ";
          
          if (isSelected) {
            dayClasses += "ring-2 ring-amber-500 bg-amber-50 font-semibold text-slate-900 z-10 ";
          } else if (isCurrentDay) {
            dayClasses += "bg-slate-900 text-white font-bold ";
          } else {
            dayClasses += "text-slate-700 ";
          }

          if (hasEvent && !isCurrentDay && !isSelected) {
            dayClasses += "border-l-4 border-l-amber-500 bg-amber-50/30 ";
          }
        }

        days.push(
          <div
            key={day.toString()}
            className={dayClasses}
            onClick={() => isCurrentMonth && handleDateClick(cloneDay)}
          >
            <span className={`text-xs p-1 rounded-full w-5 h-5 flex items-center justify-center ${isCurrentDay ? 'bg-amber-400 text-slate-900 font-bold' : ''}`}>
              {format(day, 'd')}
            </span>
            {hasEvent && isCurrentMonth && (
              <div className="flex items-center justify-end">
                <span className={`w-2 h-2 rounded-full ${isCurrentDay ? 'bg-amber-400' : 'bg-amber-500'}`}></span>
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="bg-white">{rows}</div>;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 font-sans">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-6">
        {renderHeader()}
        {renderDaysHeader()}
        {renderCells()}
      </div>

      {/* Formulário de Adição de Agendamento - Só exibe se uma data estiver selecionada */}
      {selectedDate && (
        <div className="bg-white rounded-xl shadow-md border border-amber-300 p-4 mb-6 transition-all">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-500" />
              Agendar Vistoria / Evento para: <span className="text-amber-600 font-bold">{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</span>
            </h3>
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
              title="Desmarcar data"
            >
              <X className="w-3.5 h-3.5" />
              Desmarcar
            </button>
          </div>
          <form onSubmit={handleAddEvent} className="space-y-3">
            <textarea
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Endereço do imóvel, nome do cliente ou detalhes da vistoria..."
              rows={3}
              className="w-full p-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-y"
              autoFocus
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Salvar Vistoria'}
            </button>
          </form>
        </div>
      )}

      {/* Lista de Eventos do Mês */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3 border-b pb-2 flex justify-between items-center">
          <span>Agendamentos do Mês</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-normal">
            {events.length} {events.length === 1 ? 'evento' : 'eventos'}
          </span>
        </h3>

        {events.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            Nenhuma vistoria agendada para este mês.
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => {
              const eventDate = parseISO(event.date);
              return (
                <div
                  key={event.id}
                  className="flex items-start justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-amber-300 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                      {format(eventDate, "dd/MM/yyyy ('- 'EEEE)", { locale: ptBR })}
                    </span>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">
                      {event.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors ml-2"
                    title="Excluir agendamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarSimples;