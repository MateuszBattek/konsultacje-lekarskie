import { addWeeks, format, subWeeks, addMinutes } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import type React from "react";
import { useState, useMemo } from "react";
import { WeekGrid } from "./WeekGrid";
import { BookingModal } from "./BookingModal";
import { AppointmentDetailModal } from "./AppointmentDetailModal";
import { CartPanel, calculatePrice } from "../cart/CartPanel";
import { PaymentModal } from "../cart/PaymentModal";
import type { Appointment, BookingFormData, Absence, CartItem } from "../../types";
import { consultationService } from "../../services/consultationServices";

interface PatientCalendarViewProps {
    appointments: Appointment[];
    setAppointments: (appointments: Appointment[]) => void;
    absences: Absence[];
    currentPatientId: string;
}

export const PatientCalendarView: React.FC<PatientCalendarViewProps> = ({
    appointments,
    setAppointments,
    absences,
    currentPatientId
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<Appointment | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const handleToday = () => setCurrentDate(new Date());

    const handleSlotClick = (appointment: Appointment) => {
        if (appointment.status === 'AVAILABLE') {
            setSelectedSlot(appointment);
            setIsBookingModalOpen(true);
        } else if ((appointment.status === 'BOOKED' || appointment.status === 'PENDING_PAYMENT') && appointment.patientId === currentPatientId) {
            setSelectedAppointment(appointment);
            setIsDetailModalOpen(true);
        }
    };

    const handleBooking = async (bookingData: BookingFormData) => {
        if (!selectedSlot) return;

        const requiredSlots = bookingData.durationMinutes / 30;
        const slotStart = new Date(selectedSlot.startTime);

        const updates: { id: string, data: Partial<Appointment> }[] = [];

        appointments.forEach(apt => {
            const aptTime = new Date(apt.startTime);

            for (let i = 0; i < requiredSlots; i++) {
                const checkTime = addMinutes(slotStart, i * 30);
                if (aptTime.getTime() === checkTime.getTime() && apt.status === 'AVAILABLE') {
                    updates.push({
                        id: apt.id,
                        data: {
                            status: 'PENDING_PAYMENT',
                            patientId: currentPatientId,
                            patientName: bookingData.patientName,
                            type: bookingData.consultationType,
                            durationMinutes: i === 0 ? bookingData.durationMinutes : 30,
                            notes: i === 0 ? bookingData.notes : `Część konsultacji (${bookingData.patientName})`,
                            isSubSlot: i > 0
                        }
                    });
                }
            }
        });

        try {
            await consultationService.bulkUpdateAppointments(updates);
            const freshAppointments = await consultationService.getAllAppointments();
            setAppointments(freshAppointments);
            setIsCartOpen(true);
        } catch (error) {
            console.error("Failed to book slots:", error);
        }
    };

    const cartItems = useMemo<CartItem[]>(() => {
        return appointments
            .filter(apt => apt.status === 'PENDING_PAYMENT' && apt.patientId === currentPatientId && !apt.isSubSlot)
            .map(apt => ({
                appointment: apt,
                price: calculatePrice(apt)
            }));
    }, [appointments, currentPatientId]);

    const handleRemoveFromCart = async (appointmentId: string) => {
        const appointmentToRemove = appointments.find(a => a.id === appointmentId);
        if (!appointmentToRemove) return;

        const slotStart = new Date(appointmentToRemove.startTime);
        const duration = appointmentToRemove.durationMinutes;
        const requiredSlots = duration / 30;

        const updates: { id: string, data: Partial<Appointment> }[] = [];

        appointments.forEach(apt => {
            const aptTime = new Date(apt.startTime);
            for (let i = 0; i < requiredSlots; i++) {
                const checkTime = addMinutes(slotStart, i * 30);
                if (aptTime.getTime() === checkTime.getTime() && apt.status === 'PENDING_PAYMENT' && apt.patientId === currentPatientId) {
                    updates.push({
                        id: apt.id,
                        data: {
                            status: 'AVAILABLE',
                            patientId: undefined,
                            patientName: undefined,
                            notes: undefined,
                            isSubSlot: undefined
                        }
                    });
                }
            }
        });

        try {
            await consultationService.bulkUpdateAppointments(updates);
            const freshAppointments = await consultationService.getAllAppointments();
            setAppointments(freshAppointments);
        } catch (error) {
            console.error("Failed to remove from cart:", error);
        }
    };

    const handlePaymentComplete = async () => {
        const updates = appointments
            .filter(apt => apt.status === 'PENDING_PAYMENT' && apt.patientId === currentPatientId)
            .map(apt => ({
                id: apt.id,
                data: { status: 'BOOKED' as const }
            }));

        try {
            await consultationService.bulkUpdateAppointments(updates);
            const freshAppointments = await consultationService.getAllAppointments();
            setAppointments(freshAppointments);
            setIsPaymentModalOpen(false);
            setIsCartOpen(false);
        } catch (error) {
            console.error("Failed to complete payment:", error);
        }
    };

    const handleCancelAppointment = async (appointmentId: string) => {
        const appointmentToCancel = appointments.find(a => a.id === appointmentId);
        if (!appointmentToCancel) return;

        const slotStart = new Date(appointmentToCancel.startTime);
        const duration = appointmentToCancel.durationMinutes;
        const requiredSlots = duration / 30;

        const updates: { id: string, data: Partial<Appointment> }[] = [];

        appointments.forEach(apt => {
            const aptTime = new Date(apt.startTime);
            for (let i = 0; i < requiredSlots; i++) {
                const checkTime = addMinutes(slotStart, i * 30);
                if (aptTime.getTime() === checkTime.getTime() && (apt.status === 'BOOKED' || apt.status === 'PENDING_PAYMENT') && apt.patientId === currentPatientId) {
                    updates.push({
                        id: apt.id,
                        data: {
                            status: 'AVAILABLE',
                            patientId: undefined,
                            patientName: undefined,
                            notes: undefined,
                            isSubSlot: undefined
                        }
                    });
                }
            }
        });

        try {
            await consultationService.bulkUpdateAppointments(updates);
            const freshAppointments = await consultationService.getAllAppointments();
            setAppointments(freshAppointments);
            console.log(`❌ Appointment ${appointmentId} cancelled by patient.`);
        } catch (error) {
            console.error("Failed to cancel appointment:", error);
        }
    };

    const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="flex flex-col h-screen max-h-screen bg-gray-50 p-6 relative">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">dr Jan Kowalski</h1>
                        <p className="text-sm text-gray-500">Kardiolog - Rezerwacja konsultacji</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                        <ShoppingCart size={24} />
                        {cartItems.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[18px]">
                                {cartItems.length}
                            </span>
                        )}
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
                    appointments={appointments}
                    absences={absences}
                    onSlotClick={handleSlotClick}
                    currentPatientId={currentPatientId}
                />
            </div>

            <div className="mt-4 flex space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
                    Dostępne (kliknij aby zarezerwować)
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded mr-2"></div>
                    W koszyku
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2 relative">
                        <div className="absolute inset-0 border-2 border-blue-600 rounded"></div>
                    </div>
                    Moje wizyty
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

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                onSave={handleBooking}
                selectedSlot={selectedSlot}
                availableSlots={appointments.filter(apt => apt.status === 'AVAILABLE')}
            />

            <CartPanel
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                onRemoveItem={handleRemoveFromCart}
                onProceedToPayment={() => setIsPaymentModalOpen(true)}
            />

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                cartItems={cartItems}
                totalPrice={totalPrice}
                onPaymentComplete={handlePaymentComplete}
            />

            <AppointmentDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                appointment={selectedAppointment}
                onCancel={handleCancelAppointment}
                canCancel={true}
            />
        </div>
    );
};
