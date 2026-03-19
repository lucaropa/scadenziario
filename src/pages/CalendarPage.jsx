import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  getMaintenanceItems, 
  getCategoryColor, 
  getCategoryLabel,
  getAutoStatusColor,
  getAutoStatusLabel,
  calculateAutoStatus
} from "@/lib/storage";
import { format, isSameDay, isToday } from "date-fns";
import { it } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Eye, Calendar as CalendarIcon } from "lucide-react";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [items, setItems] = useState([]);
  const [selectedDayItems, setSelectedDayItems] = useState([]);

  useEffect(() => {
    setItems(getMaintenanceItems());
  }, []);

  useEffect(() => {
    const dayItems = items.filter(item => 
      isSameDay(new Date(item.scadenza), selectedDate)
    );
    setSelectedDayItems(dayItems);
  }, [selectedDate, items]);

  // Get dates with events for the current month
  const getEventDates = () => {
    const eventDates = {};
    items.forEach(item => {
      const date = format(new Date(item.scadenza), 'yyyy-MM-dd');
      if (!eventDates[date]) {
        eventDates[date] = [];
      }
      eventDates[date].push(item);
    });
    return eventDates;
  };

  const eventDates = getEventDates();

  // Custom day render
  const modifiers = {
    hasEvent: (date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return !!eventDates[dateStr];
    },
    hasUrgent: (date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const events = eventDates[dateStr];
      if (!events) return false;
      return events.some(e => {
        const status = calculateAutoStatus(e.scadenza);
        return status === 'ritardo' || status === 'prossima_scadenza';
      });
    }
  };

  const modifiersStyles = {
    hasEvent: {
      fontWeight: 'bold'
    },
    hasUrgent: {
      color: '#dc2626'
    }
  };

  return (
    <div className="space-y-6" data-testid="calendar-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 font-['Manrope']">Calendario</h1>
          <p className="text-sm text-zinc-500 mt-1">Visualizza le scadenze nel calendario</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2" data-testid="calendar-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold font-['Manrope']">
                {format(currentMonth, 'MMMM yyyy', { locale: it })}
              </CardTitle>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  data-testid="prev-month-btn"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCurrentMonth(new Date())}
                  data-testid="today-btn"
                >
                  <CalendarIcon className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  data-testid="next-month-btn"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              locale={it}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md w-full"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4 w-full",
                caption: "hidden",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                table: "w-full border-collapse space-y-1",
                head_row: "flex w-full",
                head_cell: "text-zinc-500 rounded-md w-full font-normal text-[0.8rem] uppercase",
                row: "flex w-full mt-2",
                cell: "relative h-12 w-full text-center text-sm p-0 focus-within:relative focus-within:z-20",
                day: "h-12 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-zinc-100 rounded-lg transition-colors",
                day_selected: "bg-zinc-900 text-white hover:bg-zinc-800",
                day_today: "bg-zinc-100 font-bold",
                day_outside: "text-zinc-300 opacity-50",
                day_disabled: "text-zinc-300",
                day_hidden: "invisible",
              }}
              components={{
                DayContent: ({ date }) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const dayEvents = eventDates[dateStr] || [];
                  const hasRitardo = dayEvents.some(e => calculateAutoStatus(e.scadenza) === 'ritardo');
                  const hasProssima = dayEvents.some(e => calculateAutoStatus(e.scadenza) === 'prossima_scadenza');
                  
                  return (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <span>{date.getDate()}</span>
                      {dayEvents.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {dayEvents.slice(0, 3).map((e, i) => {
                            const status = calculateAutoStatus(e.scadenza);
                            return (
                              <div 
                                key={i} 
                                className={`w-1.5 h-1.5 rounded-full ${
                                  status === 'ritardo' ? 'bg-red-500' : 
                                  status === 'prossima_scadenza' ? 'bg-amber-500' : 
                                  'bg-emerald-500'
                                }`}
                              />
                            );
                          })}
                          {dayEvents.length > 3 && (
                            <span className="text-[8px] text-zinc-500">+{dayEvents.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              }}
            />
            
            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-zinc-500">Conforme</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs text-zinc-500">Prossima Scadenza</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-zinc-500">In Ritardo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Events */}
        <Card data-testid="selected-day-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold font-['Manrope']">
              {isToday(selectedDate) ? 'Oggi' : format(selectedDate, 'dd MMMM yyyy', { locale: it })}
            </CardTitle>
            <p className="text-sm text-zinc-500">
              {selectedDayItems.length} scadenz{selectedDayItems.length === 1 ? 'a' : 'e'}
            </p>
          </CardHeader>
          <CardContent>
            {selectedDayItems.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">Nessuna scadenza in questa data</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-3 border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors"
                    data-testid={`day-item-${item.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">{item.oggetto}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <Badge variant="outline" className={`${getCategoryColor(item.categoria)} text-[10px]`}>
                            {getCategoryLabel(item.categoria)}
                          </Badge>
                          <Badge variant="outline" className={`${getAutoStatusColor(item.scadenza)} text-[10px]`}>
                            {getAutoStatusLabel(item.scadenza)}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">{item.responsabile}</p>
                      </div>
                      <Link to={`/modifica/${item.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`view-item-${item.id}`}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
