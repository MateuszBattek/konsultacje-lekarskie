import React, { useState, useEffect } from 'react';
import type { Appointment, BookingFormData, Gender, AppointmentType } from '../../types';
import { X, Upload, FileText } from 'lucide-react';
import { format, addMinutes, differenceInYears } from 'date-fns';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (bookingData: BookingFormData) => void;
    selectedSlot: Appointment | null;
    availableSlots: Appointment[];
    currentUser: any;
}

export const BookingModal: React.FC<BookingModalProps> = ({
    isOpen,
    onClose,
    onSave,
    selectedSlot,
    availableSlots,
    currentUser
}) => {
    const [patientName, setPatientName] = useState('');
    const [patientGender, setPatientGender] = useState<Gender>('MALE');
    const [patientAge, setPatientAge] = useState('');
    const [consultationType, setConsultationType] = useState<AppointmentType>('CONSULTATION');
    const [durationMinutes, setDurationMinutes] = useState(30);
    const [notes, setNotes] = useState('');
    const [documents, setDocuments] = useState<File[]>([]);
    const [conflictError, setConflictError] = useState('');

    useEffect(() => {
        if (isOpen && currentUser) {
            setPatientName(currentUser.name || '');
            if (currentUser.dateOfBirth) {
                const age = differenceInYears(new Date(), new Date(currentUser.dateOfBirth));
                setPatientAge(age.toString());
            }
        }
    }, [isOpen, currentUser]);

    if (!isOpen || !selectedSlot) return null;

    const checkConflict = (duration: number): boolean => {
        if (!selectedSlot) return true;

        const slotStart = new Date(selectedSlot.startTime);
        const requiredSlots = duration / 30;

        for (let i = 0; i < requiredSlots; i++) {
            const checkTime = addMinutes(slotStart, i * 30);

            const slotAtTime = availableSlots.find(slot =>
                new Date(slot.startTime).getTime() === checkTime.getTime()
            );

            if (!slotAtTime || slotAtTime.status !== 'AVAILABLE') {
                return true; // Conflict found
            }
        }

        return false; // No conflict
    };

    const handleDurationChange = (newDuration: number) => {
        setDurationMinutes(newDuration);
        const hasConflict = checkConflict(newDuration);

        if (hasConflict) {
            setConflictError(`Nie można zarezerwować ${newDuration} minut - brak kolejnych wolnych slotów lub konflikt z inną konsultacją.`);
        } else {
            setConflictError('');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDocuments(Array.from(e.target.files));
        }
    };

    const handleSave = () => {
        if (!patientName || !patientAge || conflictError) {
            return;
        }

        onSave({
            patientName,
            patientGender,
            patientAge: parseInt(patientAge),
            consultationType,
            durationMinutes,
            notes,
            documents
        });

        // Reset form
        setPatientName('');
        setPatientAge('');
        setDurationMinutes(30);
        setNotes('');
        setDocuments([]);
        setConflictError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <div>
                        <h2 className="text-lg font-semibold">Rezerwacja konsultacji</h2>
                        <p className="text-sm text-gray-500">
                            {format(new Date(selectedSlot.startTime), 'dd.MM.yyyy HH:mm')}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto">
                    {/* Patient Details */}
                    <div className="space-y-3">
                        <h3 className="font-medium text-gray-900">Dane pacjenta</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Imię i nazwisko <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full border rounded-md p-2 text-sm"
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                placeholder="Jan Kowalski"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Płeć <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full border rounded-md p-2 text-sm"
                                    value={patientGender}
                                    onChange={(e) => setPatientGender(e.target.value as Gender)}
                                >
                                    <option value="MALE">Mężczyzna</option>
                                    <option value="FEMALE">Kobieta</option>
                                    <option value="OTHER">Inna</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Wiek <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    className="w-full border rounded-md p-2 text-sm"
                                    value={patientAge}
                                    onChange={(e) => setPatientAge(e.target.value)}
                                    placeholder="30"
                                    min="0"
                                    max="150"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Consultation Details */}
                    <div className="space-y-3 pt-3 border-t">
                        <h3 className="font-medium text-gray-900">Szczegóły konsultacji</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Typ konsultacji
                            </label>
                            <select
                                className="w-full border rounded-md p-2 text-sm"
                                value={consultationType}
                                onChange={(e) => setConsultationType(e.target.value as AppointmentType)}
                            >
                                <option value="CONSULTATION">Konsultacja</option>
                                <option value="FOLLOW_UP">Wizyta kontrolna</option>
                                <option value="PRESCRIPTION">Recepta</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Długość konsultacji
                            </label>
                            <div className="flex gap-2">
                                {[30, 60, 90].map(duration => (
                                    <button
                                        key={duration}
                                        onClick={() => handleDurationChange(duration)}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${durationMinutes === duration
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {duration} min
                                    </button>
                                ))}
                            </div>
                            {conflictError && (
                                <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                    <span className="text-red-500">⚠</span>
                                    {conflictError}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Informacje dla lekarza
                            </label>
                            <textarea
                                className="w-full border rounded-md p-2 text-sm"
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Opisz swoje dolegliwości, pytania lub inne istotne informacje..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dokumenty zewnętrzne
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    multiple
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="flex flex-col items-center cursor-pointer"
                                >
                                    <Upload className="text-gray-400 mb-2" size={32} />
                                    <span className="text-sm text-gray-600">
                                        Kliknij aby dodać pliki
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1">
                                        PDF, JPG, PNG, DOC (max 10MB)
                                    </span>
                                </label>
                            </div>

                            {documents.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {documents.map((file, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                            <FileText size={16} />
                                            <span>{file.name}</span>
                                            <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Anuluj
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!patientName || !patientAge || !!conflictError}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Dodaj do koszyka
                    </button>
                </div>
            </div>
        </div>
    );
};
