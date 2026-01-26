import React, { useState } from 'react';
import type { AvailabilityRule, TimeRange, WeekDay } from '../../types';
import { cn } from '../../lib/utils';
import { X, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface AvailabilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rule: AvailabilityRule) => void;
}

export const AvailabilityModal: React.FC<AvailabilityModalProps> = ({ isOpen, onClose, onSave }) => {
    const [activeTab, setActiveTab] = useState<'CYCLIC' | 'ONETIME'>('CYCLIC');

    // Cyclic state
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedDays, setSelectedDays] = useState<WeekDay[]>([]);
    const [cyclicTimeRanges, setCyclicTimeRanges] = useState<TimeRange[]>([{ start: '08:00', end: '16:00' }]);

    // One-time state
    const [singleDate, setSingleDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [oneTimeTimeRanges, setOneTimeTimeRanges] = useState<TimeRange[]>([{ start: '08:00', end: '16:00' }]);

    if (!isOpen) return null;

    const days: { value: WeekDay; label: string }[] = [
        { value: 'monday', label: 'Pon' },
        { value: 'tuesday', label: 'Wt' },
        { value: 'wednesday', label: 'Śr' },
        { value: 'thursday', label: 'Czw' },
        { value: 'friday', label: 'Pt' },
        { value: 'saturday', label: 'Sob' },
        { value: 'sunday', label: 'Ndz' },
    ];

    const toggleDay = (day: WeekDay) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const addTimeRange = (isCyclic: boolean) => {
        const setter = isCyclic ? setCyclicTimeRanges : setOneTimeTimeRanges;
        const current = isCyclic ? cyclicTimeRanges : oneTimeTimeRanges;
        setter([...current, { start: '08:00', end: '16:00' }]);
    };

    const updateTimeRange = (index: number, field: 'start' | 'end', value: string, isCyclic: boolean) => {
        const setter = isCyclic ? setCyclicTimeRanges : setOneTimeTimeRanges;
        const current = isCyclic ? [...cyclicTimeRanges] : [...oneTimeTimeRanges];
        current[index] = { ...current[index], [field]: value };
        setter(current);
    };

    const removeTimeRange = (index: number, isCyclic: boolean) => {
        const setter = isCyclic ? setCyclicTimeRanges : setOneTimeTimeRanges;
        const current = isCyclic ? cyclicTimeRanges : oneTimeTimeRanges;
        if (current.length > 1) {
            setter(current.filter((_, i) => i !== index));
        }
    };

    const handleSave = () => {
        if (activeTab === 'CYCLIC') {
            onSave({
                type: 'CYCLIC',
                dateRange: {
                    start: new Date(startDate),
                    end: new Date(endDate)
                },
                daysOfWeek: selectedDays,
                timeRanges: cyclicTimeRanges
            });
        } else {
            onSave({
                type: 'ONETIME',
                singleDate: new Date(singleDate),
                timeRanges: oneTimeTimeRanges
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">Definiuj dostępność</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex border-b">
                    <button
                        className={cn("flex-1 py-3 text-sm font-medium", activeTab === 'CYCLIC' ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700")}
                        onClick={() => setActiveTab('CYCLIC')}
                    >
                        Cykliczna
                    </button>
                    <button
                        className={cn("flex-1 py-3 text-sm font-medium", activeTab === 'ONETIME' ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700")}
                        onClick={() => setActiveTab('ONETIME')}
                    >
                        Jednorazowa
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {activeTab === 'CYCLIC' ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Od</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-md p-2 text-sm"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Dni tygodnia</label>
                                <div className="flex flex-wrap gap-2">
                                    {days.map(day => (
                                        <button
                                            key={day.value}
                                            onClick={() => toggleDay(day.value)}
                                            className={cn(
                                                "w-10 h-10 rounded-full text-sm font-medium transition-colors",
                                                selectedDays.includes(day.value)
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            )}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Godziny dostępności</label>
                                    <button onClick={() => addTimeRange(true)} className="text-blue-600 text-xs flex items-center font-medium">
                                        <Plus size={14} className="mr-1" /> Dodaj
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {cyclicTimeRanges.map((range, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="time"
                                                className="border rounded px-2 py-1 text-sm flex-1"
                                                value={range.start}
                                                onChange={(e) => updateTimeRange(index, 'start', e.target.value, true)}
                                            />
                                            <span className="text-gray-400">-</span>
                                            <input
                                                type="time"
                                                className="border rounded px-2 py-1 text-sm flex-1"
                                                value={range.end}
                                                onChange={(e) => updateTimeRange(index, 'end', e.target.value, true)}
                                            />
                                            <button
                                                onClick={() => removeTimeRange(index, true)}
                                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                                                disabled={cyclicTimeRanges.length === 1}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                                <input
                                    type="date"
                                    className="w-full border rounded-md p-2 text-sm"
                                    value={singleDate}
                                    onChange={(e) => setSingleDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Godziny dostępności</label>
                                    <button onClick={() => addTimeRange(false)} className="text-blue-600 text-xs flex items-center font-medium">
                                        <Plus size={14} className="mr-1" /> Dodaj
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {oneTimeTimeRanges.map((range, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="time"
                                                className="border rounded px-2 py-1 text-sm flex-1"
                                                value={range.start}
                                                onChange={(e) => updateTimeRange(index, 'start', e.target.value, false)}
                                            />
                                            <span className="text-gray-400">-</span>
                                            <input
                                                type="time"
                                                className="border rounded px-2 py-1 text-sm flex-1"
                                                value={range.end}
                                                onChange={(e) => updateTimeRange(index, 'end', e.target.value, false)}
                                            />
                                            <button
                                                onClick={() => removeTimeRange(index, false)}
                                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                                                disabled={oneTimeTimeRanges.length === 1}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
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
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        Zapisz dostępność
                    </button>
                </div>
            </div>
        </div>
    );
};
