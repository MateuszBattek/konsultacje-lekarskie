import React, { useState } from 'react';
import type { Absence } from '../../types';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface AbsenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (absence: Omit<Absence, 'id'>) => void;
}

export const AbsenceModal: React.FC<AbsenceModalProps> = ({ isOpen, onClose, onSave }) => {
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleStartDateChange = (newStart: string) => {
        setStartDate(newStart);
        if (newStart > endDate) {
            setEndDate(newStart);
        }
    };

    const handleSave = () => {
        onSave({
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            reason: reason || undefined
        });
        setReason('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">Dodaj nieobecność</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Od</label>
                            <input
                                type="date"
                                className="w-full border rounded-md p-2 text-sm"
                                value={startDate}
                                onChange={(e) => handleStartDateChange(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Do</label>
                            <input
                                type="date"
                                className="w-full border rounded-md p-2 text-sm"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Powód (opcjonalnie)</label>
                        <textarea
                            className="w-full border rounded-md p-2 text-sm"
                            rows={3}
                            placeholder="np. Wakacje, konferencja..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
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
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                        Zapisz nieobecność
                    </button>
                </div>
            </div>
        </div>
    );
};
