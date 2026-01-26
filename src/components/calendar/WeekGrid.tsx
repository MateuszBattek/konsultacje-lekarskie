import { addDays, format, isSameDay, startOfWeek, parseISO } from "date-fns";
import { pl } from 'date-fns/locale';
import type { Appointment, Absence } from "../../types";
import { cn } from "../../lib/utils";
import { DayColumn } from "./DayColumn";
import React from 'react';

interface WeekGridProps {
    startDate: Date,
    appointments: Appointment[];
    absences: Absence[];
    onSlotClick?: (appointment: Appointment) => void;
    currentPatientId?: string;
    doctors?: Record<string, { name: string; specialization?: string }>;
}

export const WeekGrid: React.FC<WeekGridProps> = ({ startDate, appointments, absences, onSlotClick, currentPatientId, doctors }) => {
    const weekStart = startOfWeek(startDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const START_HOUR = 8;
    const END_HOUR = 18;

    return (
        <div className="flex flex-col h-full bg-white border rounded-lg shadow-sm overflow-hidden min-w-[800px]">
            <div className="flex border-b border-gray-200 overflow-y-auto [scrollbar-gutter:stable]">
                <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-gray-50"></div>
                {days.map(day => {
                    const count = appointments.filter(a =>
                        isSameDay(parseISO(a.startTime), day) &&
                        a.status === 'BOOKED' &&
                        !a.isSubSlot
                    ).length;
                    const dateStr = format(day, 'yyyy-MM-dd');

                    const isAbsenceDay = !currentPatientId && absences.some(absence => {
                        const startStr = format(absence.startDate, 'yyyy-MM-dd');
                        const endStr = format(absence.endDate, 'yyyy-MM-dd');
                        return dateStr >= startStr && dateStr <= endStr;
                    });

                    return (
                        <div key={day.toString()} className={cn("flex-1 text-center py-2 border-r border-gray-100 last:border-0",
                            isAbsenceDay ? "bg-red-100" : (isSameDay(day, new Date()) ? "bg-blue-50" : "bg-gray-50")
                        )}>
                            <div className={cn("text-xs font-semibold uppercase",
                                isAbsenceDay ? "text-red-600" : "text-gray-500"
                            )}>{format(day, 'EEE', { locale: pl })}</div>
                            <div className={cn("text-xl font-bold rounded-full w-8 h-8 flex items-center justify-center mx-auto my-1",
                                isAbsenceDay ? "bg-red-600 text-white shadow-md" : (isSameDay(day, new Date()) ? "bg-blue-600 text-white shadow-md" : "text-gray-900")
                            )}>
                                {format(day, 'd')}
                            </div>
                            <div className={cn("text-xs",
                                isAbsenceDay ? "text-red-500" : "text-gray-400"
                            )}>{isAbsenceDay ? 'Nieobecność' : `${count} wizyt`}</div>
                        </div>
                    )
                })}
            </div>

            <div className="flex flex-1 overflow-y-auto relative h-[500px] [scrollbar-gutter:stable]">
                <div className="w-16 flex-shrink-0 border-r border-gray-200 bg-gray-50 text-xs text-gray-500 text-right pt-[6px]">
                    {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                        <div key={i} className="h-[60px] pr-2 relative flex items-start justify-end">
                            {START_HOUR + i}:00
                        </div>
                    ))}
                </div>

                <div className="flex flex-1 relative">
                    {days.map(day => (
                        <DayColumn
                            key={day.toString()}
                            date={day}
                            appointments={appointments}
                            absences={absences}
                            startHour={START_HOUR}
                            endHour={END_HOUR}
                            onSlotClick={onSlotClick}
                            currentPatientId={currentPatientId}
                            doctors={doctors}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}