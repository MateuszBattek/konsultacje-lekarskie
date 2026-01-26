import React from 'react';
import type { Appointment, CartItem } from '../../types';
import { X, ShoppingCart, Trash2, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

interface CartPanelProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    onRemoveItem: (appointmentId: string) => void;
    onProceedToPayment: () => void;
}

const calculatePrice = (appointment: Appointment): number => {
    const basePrice = 100;
    const typeMultiplier = {
        CONSULTATION: 1.0,
        FOLLOW_UP: 0.8,
        PRESCRIPTION: 0.5
    };

    const additionalTime = Math.max(0, appointment.durationMinutes - 30);
    const additionalCost = (additionalTime / 30) * 50;

    return basePrice * typeMultiplier[appointment.type] + additionalCost;
};

export const CartPanel: React.FC<CartPanelProps> = ({
    isOpen,
    onClose,
    cartItems,
    onRemoveItem,
    onProceedToPayment
}) => {
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/30 z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
                    <div className="flex items-center gap-2 text-white">
                        <ShoppingCart size={24} />
                        <h2 className="text-lg font-semibold">Koszyk ({cartItems.length})</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-1 rounded"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ShoppingCart size={64} className="mb-4 opacity-50" />
                            <p className="text-lg">Koszyk jest pusty</p>
                            <p className="text-sm mt-2">Zarezerwuj konsultację aby dodać ją do koszyka</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cartItems.map((item) => (
                                <div
                                    key={item.appointment.id}
                                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">
                                                {format(new Date(item.appointment.startTime), 'dd.MM.yyyy HH:mm')}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {item.appointment.type === 'CONSULTATION' && 'Konsultacja'}
                                                {item.appointment.type === 'FOLLOW_UP' && 'Wizyta kontrolna'}
                                                {item.appointment.type === 'PRESCRIPTION' && 'Recepta'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {item.appointment.durationMinutes} min
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onRemoveItem(item.appointment.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded"
                                            title="Usuń z koszyka"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    {item.appointment.notes && (
                                        <div className="text-xs text-gray-500 mt-2 p-2 bg-white rounded border border-gray-100">
                                            {item.appointment.notes}
                                        </div>
                                    )}

                                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Cena:</span>
                                        <span className="text-lg font-bold text-blue-600">{item.price} PLN</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="border-t bg-gray-50 p-4 space-y-3">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Suma:</span>
                            <span className="text-blue-600">{totalPrice.toFixed(2)} PLN</span>
                        </div>
                        <button
                            onClick={onProceedToPayment}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <CreditCard size={20} />
                            Przejdź do płatności
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export { calculatePrice };
