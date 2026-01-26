import { addDays, addMinutes, format, isBefore, isSameDay, set, subWeeks, addWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { WeekGrid } from "./WeekGrid";
import { AvailabilityModal } from "./AvailabilityModal";
import { AbsenceModal } from "./AbsenceModal";
import { AppointmentDetailModal } from "./AppointmentDetailModal";
import type { Appointment, AvailabilityRule, WeekDay, Absence } from "../../types";
import { consultationService } from "../../services/consultationServices";

interface CalendarViewProps {
    appointments: Appointment[];
    setAppointments: (appointments: Appointment[]) => void;
    absences: Absence[];
    setAbsences: (absences: Absence[]) => void;
    doctorId: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
    appointments,
    setAppointments,
    absences,
    setAbsences,
    doctorId
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const handleToday = () => setCurrentDate(new Date());

    const handleSaveAvailability = async (rule: AvailabilityRule) => {
        const newAppointments: Omit<Appointment, 'id'>[] = [];
        let datesToProcess: Date[] = [];

        if (rule.type === 'ONETIME' && rule.singleDate) {
            datesToProcess = [rule.singleDate];
        } else if (rule.type === 'CYCLIC' && rule.dateRange) {
            let current = rule.dateRange.start;
            const end = rule.dateRange.end;
            while (current <= end) {
                if (rule.daysOfWeek?.includes(format(current, 'EEEE').toLowerCase() as WeekDay)) {
                    datesToProcess.push(current);
                }
                current = addDays(current, 1);
            }
        }

        datesToProcess.forEach(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isAbsenceDay = absences.some(abs => {
                const startStr = format(abs.startDate, 'yyyy-MM-dd');
                const endStr = format(abs.endDate, 'yyyy-MM-dd');
                return dateStr >= startStr && dateStr <= endStr;
            });

            if (isAbsenceDay) return;

            rule.timeRanges.forEach(range => {
                const [startHour, startMinute] = range.start.split(':').map(Number);
                const [endHour, endMinute] = range.end.split(':').map(Number);

                let slotStart = set(date, { hours: startHour, minutes: startMinute, seconds: 0, milliseconds: 0 });
                const rangeEnd = set(date, { hours: endHour, minutes: endMinute, seconds: 0, milliseconds: 0 });

                while (isBefore(slotStart, rangeEnd)) {
                    const slotEnd = addMinutes(slotStart, 30);

                    if (isBefore(slotEnd, rangeEnd) || slotEnd.getTime() === rangeEnd.getTime()) {
                        const isOverlapping = appointments.some(existing => {
                            const existingStart = new Date(existing.startTime);
                            const existingEnd = addMinutes(existingStart, existing.durationMinutes);
                            return (
                                isSameDay(slotStart, existingStart) &&
                                (
                                    (slotStart >= existingStart && slotStart < existingEnd) ||
                                    (slotEnd > existingStart && slotEnd <= existingEnd) ||
                                    (slotStart <= existingStart && slotEnd >= existingEnd)
                                )
                            );
                        });

                        if (!isOverlapping) {
                            newAppointments.push({
                                doctorId: doctorId,
                                startTime: slotStart.toISOString(),
                                durationMinutes: 30,
                                status: 'AVAILABLE',
                                type: 'CONSULTATION'
                            });
                        }
                    }
                    slotStart = slotEnd;
                }
            });
        });

        try {
            const savedAppointments = await consultationService.bulkCreateAppointments(newAppointments);
            setAppointments([...appointments, ...savedAppointments]);
        } catch (error) {
            console.error("Failed to save availability:", error);
        }
    };

    const handleSaveAbsence = async (absenceData: Omit<Absence, 'id'>) => {
        try {
            // Add doctorId to absence data
            const absenceWithDoctor = {
                ...absenceData,
                doctorId: doctorId
            };

            const newAbsence = await consultationService.createAbsence(absenceWithDoctor);

            const toDelete: string[] = [];
            const toCancel: string[] = [];

            appointments.forEach(apt => {
                const aptDate = new Date(apt.startTime);
                const aptDateStr = format(aptDate, 'yyyy-MM-dd');
                const startStr = format(absenceData.startDate, 'yyyy-MM-dd');
                const endStr = format(absenceData.endDate, 'yyyy-MM-dd');

                const isConflicting = aptDateStr >= startStr && aptDateStr <= endStr;

                if (isConflicting) {
                    if (apt.status === 'AVAILABLE' || apt.status === 'PENDING_PAYMENT') {
                        toDelete.push(apt.id);
                    } else if (apt.status === 'BOOKED') {
                        toCancel.push(apt.id);
                    }
                }
            });

            // Process conflicts
            await Promise.all([
                ...toDelete.map(id => consultationService.deleteAppointment(id)),
                ...toCancel.map(id => consultationService.updateAppointment(id, { status: 'CANCELLED' }))
            ]);

            setAbsences([...absences, newAbsence]);

            // Refresh appointments from server
            const freshAppointments = await consultationService.getAllAppointments(doctorId);
            setAppointments(freshAppointments);

            if (toCancel.length > 0) {
                alert(`Dodano nieobecność. ${toCancel.length} rezerwacji zostało odwołanych.`);
            }
        } catch (error) {
            console.error("Failed to handle absence:", error);
        }
    };

    const handleSlotClick = (appointment: Appointment) => {
        // Only handle BOOKED appointments for doctor detail view
        // (PENDING_PAYMENT is obscured to AVAILABLE for doctor, so they won't trigger this for those)
        if (appointment.status === 'BOOKED') {
            setSelectedAppointment(appointment);
            setIsDetailModalOpen(true);
        }
    };

    const handleCancelAppointment = async (appointmentId: string) => {
        const appointmentToCancel = appointments.find(a => a.id === appointmentId);
        if (!appointmentToCancel) return;

        const slotStart = new Date(appointmentToCancel.startTime);
        const duration = appointmentToCancel.durationMinutes;
        const requiredSlots = duration / 30;

        const toUpdate: string[] = [];

        appointments.forEach(apt => {
            const aptTime = new Date(apt.startTime);
            for (let i = 0; i < requiredSlots; i++) {
                const checkTime = addMinutes(slotStart, i * 30);
                if (aptTime.getTime() === checkTime.getTime() && (apt.status === 'BOOKED' || apt.status === 'PENDING_PAYMENT')) {
                    toUpdate.push(apt.id);
                }
            }
        });

        try {
            await Promise.all(toUpdate.map(id =>
                consultationService.deleteAppointment(id)
            ));

            const freshAppointments = await consultationService.getAllAppointments(doctorId);
            setAppointments(freshAppointments);
            console.log(`❌ Appointment ${appointmentId} cancelled by doctor.`);
        } catch (error) {
            console.error("Failed to cancel appointment:", error);
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-screen bg-gray-50 p-6">


            <div className="flex items-center justify-end mb-6">

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsAvailabilityModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Definiuj dostępność
                    </button>

                    <button
                        onClick={() => setIsAbsenceModalOpen(true)}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Dodaj nieobecność
                    </button>

                    <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                        <button onClick={handlePrevWeek} className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="font-semibold text-lg w-48 text-center select-none">
                            {format(currentDate, 'MMMM yyyy')}
                        </div>
                        <button onClick={handleNextWeek} className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
                            <ChevronRight size={20} />
                        </button>
                        <div className="h-6 w-px bg-gray-300 mx-2" />
                        <button
                            onClick={handleToday}
                            className="px-4 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                        >
                            Dzisiaj
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <WeekGrid
                    startDate={currentDate}
                    appointments={appointments.map(apt =>
                        apt.status === 'PENDING_PAYMENT'
                            ? { ...apt, status: 'AVAILABLE' as const, patientId: undefined, patientName: undefined, notes: undefined }
                            : apt
                    )}
                    absences={absences}
                    onSlotClick={handleSlotClick}
                />
            </div>

            <div className="mt-4 flex justify-between items-start">
                <div className="flex space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
                        Dostępne
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2"></div>
                        Zarezerwowane
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                        Zakończone
                    </div>
                </div>

                {/* Absences List */}
                {absences.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 max-w-md">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Twoje nieobecności:</h3>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {absences.map(absence => (
                                <div key={absence.id} className="flex items-center justify-between text-xs bg-red-50 p-2 rounded border border-red-200">
                                    <div>
                                        <div className="font-medium text-red-700">
                                            {format(absence.startDate, 'dd.MM.yyyy')} - {format(absence.endDate, 'dd.MM.yyyy')}
                                        </div>
                                        {absence.reason && <div className="text-gray-600 text-[10px]">{absence.reason}</div>}
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (confirm('Czy na pewno chcesz usunąć tę nieobecność?')) {
                                                try {
                                                    await consultationService.deleteAbsence(absence.id);
                                                    setAbsences(absences.filter(a => a.id !== absence.id));
                                                    const freshAppointments = await consultationService.getAllAppointments(doctorId);
                                                    setAppointments(freshAppointments);
                                                } catch (error) {
                                                    console.error("Failed to delete absence:", error);
                                                }
                                            }
                                        }}
                                        className="ml-2 px-2 py-1 text-red-600 hover:bg-red-100 rounded text-[10px] font-medium"
                                    >
                                        Usuń
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <AvailabilityModal
                isOpen={isAvailabilityModalOpen}
                onClose={() => setIsAvailabilityModalOpen(false)}
                onSave={handleSaveAvailability}
            />

            <AbsenceModal
                isOpen={isAbsenceModalOpen}
                onClose={() => setIsAbsenceModalOpen(false)}
                onSave={handleSaveAbsence}
            />

            <AppointmentDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                appointment={selectedAppointment}
                onCancel={handleCancelAppointment}
                canCancel={true}
            />
        </div>
    )
}