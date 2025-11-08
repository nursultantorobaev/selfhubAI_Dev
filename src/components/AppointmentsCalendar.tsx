import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, User, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/hooks/useAppointments";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  service?: {
    name: string;
    duration_minutes: number;
    price: number;
  };
  notes?: string;
}

interface AppointmentsCalendarProps {
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onDateClick?: (date: Date) => void;
  onCreateAppointment?: (date: Date, time?: string) => void;
}

const statusColors: Record<AppointmentStatus, string> = {
  pending: "bg-yellow-500/20 border-yellow-500/50 text-yellow-700 dark:text-yellow-400",
  confirmed: "bg-blue-500/20 border-blue-500/50 text-blue-700 dark:text-blue-400",
  completed: "bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-400",
  cancelled: "bg-red-500/20 border-red-500/50 text-red-700 dark:text-red-400",
};

const statusLabels: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const AppointmentsCalendar = ({ 
  appointments, 
  onAppointmentClick,
  onDateClick,
  onCreateAppointment,
}: AppointmentsCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    appointments.forEach((apt) => {
      if (!grouped[apt.appointment_date]) {
        grouped[apt.appointment_date] = [];
      }
      grouped[apt.appointment_date].push(apt);
    });
    // Sort appointments by time within each date
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => {
        return a.appointment_time.localeCompare(b.appointment_time);
      });
    });
    return grouped;
  }, [appointments]);

  // Get calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: Date) => {
    if (onDateClick) {
      onDateClick(day);
    } else if (onCreateAppointment) {
      onCreateAppointment(day);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={handleToday}>
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((day) => (
              <div
                key={day}
                className="p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold text-muted-foreground border-r last:border-r-0"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 1)}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day, dayIdx) => {
              const dayKey = format(day, "yyyy-MM-dd");
              const dayAppointments = appointmentsByDate[dayKey] || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);

              const hasMore = dayAppointments.length > 3;
              const showCount = 3;

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[80px] sm:min-h-[120px] md:min-h-[140px] border-r border-b p-1 sm:p-2 transition-colors group relative",
                    !isCurrentMonth && "bg-muted/20 opacity-60",
                    isTodayDate && "bg-primary/10 border-primary/20",
                    "hover:bg-muted/50 active:bg-muted/70"
                  )}
                >
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <button
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "text-xs sm:text-sm font-semibold transition-all hover:scale-110 active:scale-95 touch-manipulation min-w-[24px] sm:min-w-[28px]",
                        isTodayDate && "bg-primary text-primary-foreground rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shadow-md",
                        !isCurrentMonth && "text-muted-foreground",
                        !isTodayDate && "hover:text-primary"
                      )}
                    >
                      {format(day, "d")}
                    </button>
                    {dayAppointments.length > 0 && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs font-semibold px-1 sm:px-1.5 py-0 sm:py-0.5">
                        {dayAppointments.length}
                      </Badge>
                    )}
                    {onCreateAppointment && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 sm:h-5 sm:w-5 opacity-0 sm:group-hover:opacity-100 sm:transition-opacity touch-manipulation"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateAppointment(day);
                        }}
                        title="Create appointment"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    {dayAppointments.slice(0, showCount).map((appointment) => (
                      <button
                        key={appointment.id}
                        onClick={() => onAppointmentClick?.(appointment)}
                        className={cn(
                          "w-full text-left p-1 sm:p-2 rounded-md text-[10px] sm:text-xs border transition-all hover:shadow-md hover:scale-[1.02] active:scale-95 touch-manipulation",
                          statusColors[appointment.status],
                          "cursor-pointer group/appt"
                        )}
                        title={`${formatTime(appointment.appointment_time)} - ${appointment.customer_name || "Customer"} - ${appointment.service?.name || "Service"}`}
                      >
                        <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                          <span className="font-semibold truncate">{formatTime(appointment.appointment_time)}</span>
                        </div>
                        <div className="flex items-center gap-0.5 sm:gap-1 truncate">
                          <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                          <span className="truncate font-medium">{appointment.customer_name || "Customer"}</span>
                        </div>
                        {appointment.service && (
                          <div className="truncate text-muted-foreground text-[9px] sm:text-[10px] mt-0.5 hidden sm:block">
                            {appointment.service.name}
                          </div>
                        )}
                      </button>
                    ))}
                    {hasMore && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="w-full text-xs text-primary hover:text-primary/80 font-medium p-2 rounded-md hover:bg-primary/10 transition-colors flex items-center justify-center gap-1"
                          >
                            +{dayAppointments.length - 3} more
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="start" onClick={(e) => e.stopPropagation()}>
                          <ScrollArea className="h-[300px]">
                            <div className="p-3 space-y-2">
                              <div className="text-sm font-semibold mb-2">
                                All Appointments - {format(day, "MMM dd, yyyy")}
                              </div>
                              {dayAppointments.map((appointment) => (
                                <button
                                  key={appointment.id}
                                  onClick={() => {
                                    onAppointmentClick?.(appointment);
                                  }}
                                  className={cn(
                                    "w-full text-left p-2 rounded-md text-xs border transition-all hover:shadow-md",
                                    statusColors[appointment.status],
                                    "cursor-pointer"
                                  )}
                                >
                                  <div className="flex items-center gap-1 mb-1">
                                    <Clock className="h-3 w-3" />
                                    <span className="font-semibold">{formatTime(appointment.appointment_time)}</span>
                                  </div>
                                  <div className="flex items-center gap-1 truncate">
                                    <User className="h-3 w-3" />
                                    <span className="truncate font-medium">{appointment.customer_name || "Customer"}</span>
                                  </div>
                                  {appointment.service && (
                                    <div className="truncate text-muted-foreground text-[10px] mt-0.5">
                                      {appointment.service.name}
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </ScrollArea>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                  {onCreateAppointment && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateAppointment(day);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm p-4 bg-muted/30 rounded-lg border">
        <span className="font-semibold text-muted-foreground">Status:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border bg-yellow-500/20 border-yellow-500/50 shadow-sm" />
          <span className="text-xs">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border bg-blue-500/20 border-blue-500/50 shadow-sm" />
          <span className="text-xs">Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border bg-green-500/20 border-green-500/50 shadow-sm" />
          <span className="text-xs">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border bg-red-500/20 border-red-500/50 shadow-sm" />
          <span className="text-xs">Cancelled</span>
        </div>
      </div>
    </div>
  );
};

