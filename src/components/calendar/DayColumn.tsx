import { addDays, differenceInMinutes, format, isSameDay, isToday, parseISO, startOfDay, startOfWeek } from "date-fns";
import type { Appointment, Absence } from "../../types";
import { cn } from "../../lib/utils";
import React from "react";

interface DayColumnProps {
    date: Date;
    appointments: Appointment[];
    absences: Absence[];
    startHour?: number;
    endHour?: number;
    onSlotClick?: (appointment: Appointment) => void;
    currentPatientId?: string;
}

const SLOT_HEIGHT = 60;


export const DayColumn: React.FC<DayColumnProps> = ({
    date,
    appointments,
    absences,
    startHour = 8,
    endHour = 8,
    onSlotClick,
    currentPatientId
}) => {
    const isCurrentDay = isToday(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    const isAbsenceDay = absences.some(absence => {
        const startStr = format(absence.startDate, 'yyyy-MM-dd');
        const endStr = format(absence.endDate, 'yyyy-MM-dd');
        return dateStr >= startStr && dateStr <= endStr;
    });

    const dayAppointments = appointments.filter(app => isSameDay(parseISO(app.startTime), date) && !app.isSubSlot);

    const now = new Date();
    const minutesSinceStartOfDay = differenceInMinutes(now, startOfDay(now));
    const indicatorTop = (minutesSinceStartOfDay - startHour * 60) * (SLOT_HEIGHT / 60);
    const showIndicator = isCurrentDay && indicatorTop >= 0 && indicatorTop <= (endHour - startHour) * SLOT_HEIGHT;

    return (
        <div
            className={cn("relative border-r border-gray-200 flex-1", isCurrentDay && "bg-blue-50/30")}
            style={{ height: (endHour - startHour + 1) * SLOT_HEIGHT }}
        >
            {Array.from({ length: endHour - startHour }).map((_, i) => (
                <React.Fragment key={i}>
                    <div className="absolute w-full border-t border-gray-100" style={{ top: i * SLOT_HEIGHT }} />
                    <div className="absolute w-full border-t border-dashed border-gray-50" style={{ top: (i + 0.5) * SLOT_HEIGHT }} />
                </React.Fragment>
            ))}

            {dayAppointments.map(app => {
                const startDate = parseISO(app.startTime);
                const startMinutes = differenceInMinutes(startDate, startOfDay(startDate));
                const top = (startMinutes - startHour * 60) * (SLOT_HEIGHT / 60);
                const height = (app.durationMinutes) * (SLOT_HEIGHT / 60);

                const colors = {
                    AVAILABLE: 'bg-green-100 border-green-300 hover:bg-green-200 text-green-700',
                    PENDING_PAYMENT: 'bg-orange-100 border-orange-300 hover:bg-orange-200 text-orange-700',
                    BOOKED: 'bg-blue-100 border-blue-300 hover:bg-blue-200 text-blue-700',
                    COMPLETED: 'bg-gray-100 border-gray-300 text-gray-500 grayscale opacity-80',
                    CANCELLED: 'bg-red-50 border-red-200 text-red-500 diagonal-pattern opacity-60'
                }

                const typeColors = {
                    CONSULTATION: 'border-l-4 border-l-blue-500',
                    FOLLOW_UP: 'border-l-4 border-l-purple-500',
                    PRESCRIPTION: 'border-l-4 border-l-yellow-500',
                }

                const isPast = startDate < new Date();
                const baseClass = isPast && app.status === 'AVAILABLE' ? 'bg-gray-50 border-gray-100 text-gray-400 opacity-50' : colors[app.status]
                const isOwn = currentPatientId && app.patientId === currentPatientId;
                const isDoctorView = !currentPatientId;
                const isClickable = onSlotClick && !isPast && !isAbsenceDay && (
                    app.status === 'AVAILABLE' ||
                    (app.status === 'BOOKED' && (isDoctorView || isOwn)) ||
                    (app.status === 'PENDING_PAYMENT' && isOwn)
                );

                return (
                    <div
                        key={app.id}
                        className={cn("absolute inset-x-1 rounded border text-xs p-1 overflow-hidden transition-all group z-10",
                            baseClass,
                            app.status !== 'AVAILABLE' && typeColors[app.type],
                            isClickable ? "cursor-pointer hover:ring-2 hover:ring-blue-400" : "cursor-default",
                            isOwn && "ring-2 ring-blue-600 ring-offset-0 shadow-md",
                            isAbsenceDay && "opacity-40 grayscale pointer-events-none"
                        )}
                        style={{ top: top, height: height, minHeight: 20 }}
                        title={`${app.status} - ${app.type}`}
                        onClick={() => isClickable && onSlotClick(app)}
                    >

                        <div className="flex items-center gap-2 font-semibold truncate">
                            {format(startDate, "HH:mm")}
                            {app.status === 'BOOKED' && <span className="truncate font-bold">{app.patientId ? 'Reserved' : 'Booked'}</span>}
                        </div>

                        <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 bg-white border border-gray-200 shadow-xl rounded p-2 text-sm z-50 w-48 text-gray-800">
                            <p><strong>Time:</strong>{format(startDate, 'HH:mm')} - {format(new Date(startDate.getTime() + app.durationMinutes * 60000), 'HH:mm')}</p>
                            <p><strong>Type:</strong>{app.type}</p>
                            <p><strong>Status:</strong>{app.status}</p>
                            {app.notes && <p className="italic mt-1 text-xs">{app.notes}</p>}
                        </div>
                    </div>
                );
            })}

            {showIndicator && (
                <div className="absolute w-full border-t-2 border-red-500 z-20 pointer-events-none" style={{ top: indicatorTop }}>
                    <div className="w-2 h-2 bg-red-500 rounded-full -mt-[5px] -ml-[1px]"></div>
                </div>
            )}

            {isAbsenceDay && (
                <div className="absolute inset-0 bg-red-500/5 pointer-events-none z-0" />
            )}
        </div>
    )
}