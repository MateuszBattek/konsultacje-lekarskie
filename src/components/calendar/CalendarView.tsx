import { addDays, addMinutes, format, isBefore, isSameDay, set, subWeeks, addWeeks } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { WeekGrid } from "./WeekGrid";
import { AvailabilityModal } from "./AvailabilityModal";
import { AbsenceModal } from "./AbsenceModal";
import { AppointmentDetailModal } from "./AppointmentDetailModal";
import type { Appointment, AvailabilityRule, WeekDay, Absence } from "../../types";

interface CalendarViewProps {
    appointments: Appointment[];
    setAppointments: (appointments: Appointment[]) => void;
    absences: Absence[];
    setAbsences: (absences: Absence[]) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
    appointments,
    setAppointments,
    absences,
    setAbsences
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const handleToday = () => setCurrentDate(new Date());

    const handleSaveAvailability = (rule: AvailabilityRule) => {
        const newAppointments: Appointment[] = [];
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
            rule.timeRanges.forEach(range => {
                const [startHour, startMinute] = range.start.split(':').map(Number);
                const [endHour, endMinute] = range.end.split(':').map(Number);

                let slotStart = set(date, { hours: startHour, minutes: startMinute, seconds: 0, milliseconds: 0 });
                const rangeEnd = set(date, { hours: endHour, minutes: endMinute, seconds: 0, milliseconds: 0 });

                while (isBefore(slotStart, rangeEnd)) {
                    const slotEnd = addMinutes(slotStart, 30);

                    // Check logic to not exceed range end
                    if (isBefore(slotEnd, rangeEnd) || slotEnd.getTime() === rangeEnd.getTime()) {
                        // Check for overlaps with existing appointments
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
                                id: Math.random().toString(36).substr(2, 9),
                                doctorId: '1', // Hardcoded for now
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

        setAppointments([...appointments, ...newAppointments]);
    };

    const handleSaveAbsence = (absenceData: Omit<Absence, 'id'>) => {
        const newAbsence: Absence = {
            id: Math.random().toString(36).substr(2, 9),
            ...absenceData
        };

        // Process appointments: remove AVAILABLE slots and cancel BOOKED ones
        const updatedAppointments = appointments.reduce<Appointment[]>((acc, apt) => {
            const aptDate = new Date(apt.startTime);
            const aptDateStr = format(aptDate, 'yyyy-MM-dd');
            const startStr = format(absenceData.startDate, 'yyyy-MM-dd');
            const endStr = format(absenceData.endDate, 'yyyy-MM-dd');

            const isConflicting = aptDateStr >= startStr && aptDateStr <= endStr;

            if (isConflicting) {
                if (apt.status === 'AVAILABLE' || apt.status === 'PENDING_PAYMENT') {
                    return acc; // Skip available or pending slots
                }
                if (apt.status === 'BOOKED') {
                    // Mock patient notification
                    console.log(`🔔 Notification sent to patient: Appointment on ${format(aptDate, 'yyyy-MM-dd HH:mm')} has been cancelled due to doctor absence.`);
                    alert(`Powiadomienie wysłane do pacjenta: Konsultacja ${format(aptDate, 'yyyy-MM-dd HH:mm')} została odwołana z powodu nieobecności lekarza.`);

                    acc.push({ ...apt, status: 'CANCELLED' as const });
                    return acc;
                }
            }

            acc.push(apt);
            return acc;
        }, []);

        setAbsences([...absences, newAbsence]);
        setAppointments(updatedAppointments);
    };

    const handleSlotClick = (appointment: Appointment) => {
        // Only handle BOOKED appointments for doctor detail view
        // (PENDING_PAYMENT is obscured to AVAILABLE for doctor, so they won't trigger this for those)
        if (appointment.status === 'BOOKED') {
            setSelectedAppointment(appointment);
            setIsDetailModalOpen(true);
        }
    };

    const handleCancelAppointment = (appointmentId: string) => {
        const appointmentToCancel = appointments.find(a => a.id === appointmentId);
        if (!appointmentToCancel) return;

        const slotStart = new Date(appointmentToCancel.startTime);
        const duration = appointmentToCancel.durationMinutes;
        const requiredSlots = duration / 30;

        const updatedAppointments = appointments.map(apt => {
            const aptTime = new Date(apt.startTime);
            for (let i = 0; i < requiredSlots; i++) {
                const checkTime = addMinutes(slotStart, i * 30);
                if (aptTime.getTime() === checkTime.getTime() && (apt.status === 'BOOKED' || apt.status === 'PENDING_PAYMENT')) {
                    return {
                        ...apt,
                        status: 'AVAILABLE' as const,
                        patientId: undefined,
                        patientName: undefined,
                        notes: undefined,
                        isSubSlot: undefined
                    };
                }
            }
            return apt;
        });

        setAppointments(updatedAppointments);
        console.log(`❌ Appointment ${appointmentId} cancelled by doctor.`);
    };

    return (
        <div className="flex flex-col h-screen max-h-screen bg-gray-50 p-6">


            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">dr Jan Kowalski</h1>
                        <p className="text-sm text-gray-500">Kardiolog - Harmonogram</p>
                    </div>
                </div>

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
                            Today
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

            <div className="mt-4 flex space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
                    Available
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2"></div>
                    Booked
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                    Completed
                </div>
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