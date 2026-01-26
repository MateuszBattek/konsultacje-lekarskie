import React, { useState } from 'react';
import type { Appointment } from '../../types';
import { X, Calendar, Clock, User, FileText, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface AppointmentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
    onCancel: (appointmentId: string) => void;
    canCancel: boolean;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
    isOpen,
    onClose,
    appointment,
    onCancel,
    canCancel
}) => {
    const [isConfirming, setIsConfirming] = useState(false);

    if (!isOpen || !appointment) return null;

    const handleCancel = () => {
        onCancel(appointment.id);
        setIsConfirming(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Szczegóły konsultacji</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Main Info */}
                    <div className="space-y-4 text-sm">
                        <div className="flex items-start gap-3">
                            <User className="text-blue-600 mt-0.5" size={18} />
                            <div>
                                <p className="text-gray-500 font-medium">Pacjent</p>
                                <p className="text-gray-900 text-base font-semibold">{appointment.patientName || 'Anonimowy'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="text-blue-600 mt-0.5" size={18} />
                                <div>
                                    <p className="text-gray-500 font-medium">Data</p>
                                    <p className="text-gray-900 font-medium">{format(new Date(appointment.startTime), 'dd.MM.yyyy')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="text-blue-600 mt-0.5" size={18} />
                                <div>
                                    <p className="text-gray-500 font-medium">Czas</p>
                                    <p className="text-gray-900 font-medium">
                                        {format(new Date(appointment.startTime), 'HH:mm')} ({appointment.durationMinutes} min)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <FileText className="text-blue-600 mt-0.5" size={18} />
                            <div className="flex-1">
                                <p className="text-gray-500 font-medium">Typ & Uwagi</p>
                                <p className="text-gray-900 font-medium">
                                    {appointment.type === 'CONSULTATION' && 'Konsultacja'}
                                    {appointment.type === 'FOLLOW_UP' && 'Wizyta kontrolna'}
                                    {appointment.type === 'PRESCRIPTION' && 'Recepta'}
                                </p>
                                {appointment.notes && (
                                    <p className="text-gray-600 mt-1 bg-gray-50 p-2 rounded border italic">
                                        {appointment.notes}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${appointment.status === 'BOOKED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700'
                            }`}>
                            {appointment.status === 'BOOKED' ? 'Zatwierdzona' : 'Oczekuje na płatność'}
                        </span>
                    </div>

                    {canCancel && (
                        <div className="pt-6 border-t">
                            {isConfirming ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-red-700 mb-3">
                                        <AlertTriangle size={20} />
                                        <p className="font-semibold">Czy na pewno chcesz odwołać?</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCancel}
                                            className="flex-1 bg-red-600 text-white py-2 rounded font-medium hover:bg-red-700 transition-colors"
                                        >
                                            Tak, odwołaj
                                        </button>
                                        <button
                                            onClick={() => setIsConfirming(false)}
                                            className="flex-1 bg-white text-gray-700 py-2 border rounded font-medium hover:bg-gray-100 transition-colors"
                                        >
                                            Nie
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsConfirming(true)}
                                    className="w-full text-red-600 border border-red-600 py-2 rounded font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <X size={18} />
                                    Odwołaj konsultację
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Zamknij
                    </button>
                </div>
            </div>
        </div >
    );
};
