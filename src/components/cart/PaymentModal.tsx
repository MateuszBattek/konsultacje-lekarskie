import React, { useState } from 'react';
import type { CartItem } from '../../types';
import { X, CreditCard, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    totalPrice: number;
    onPaymentComplete: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    cartItems,
    totalPrice,
    onPaymentComplete
}) => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    if (!isOpen) return null;

    const handlePayment = () => {
        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);
            setPaymentSuccess(true);

            // Wait a moment to show success, then complete
            setTimeout(() => {
                onPaymentComplete();
                setPaymentSuccess(false);
                setCardNumber('');
                setExpiry('');
                setCvv('');
            }, 1500);
        }, 2000);
    };

    const isFormValid = cardNumber.length >= 16 && expiry.length >= 5 && cvv.length >= 3;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                {paymentSuccess ? (
                    <div className="p-8 text-center">
                        <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Płatność zakończona!</h2>
                        <p className="text-gray-600">Twoje konsultacje zostały potwierdzone</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
                            <div className="flex items-center gap-2 text-white">
                                <CreditCard size={24} />
                                <h2 className="text-lg font-semibold">Płatność</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white hover:bg-white/20 p-1 rounded"
                                disabled={isProcessing}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Order Summary */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Podsumowanie zamówienia</h3>
                                <div className="space-y-2">
                                    {cartItems.map((item) => (
                                        <div key={item.appointment.id} className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                {format(new Date(item.appointment.startTime), 'dd.MM HH:mm')} - {item.appointment.type}
                                            </span>
                                            <span className="font-medium">{item.price} PLN</span>
                                        </div>
                                    ))}
                                    <div className="pt-2 border-t border-gray-200 flex justify-between font-bold">
                                        <span>Suma:</span>
                                        <span className="text-blue-600">{totalPrice.toFixed(2)} PLN</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Numer karty
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-md p-2 text-sm"
                                        placeholder="1234 5678 9012 3456"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16))}
                                        maxLength={16}
                                        disabled={isProcessing}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Data ważności
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border rounded-md p-2 text-sm"
                                            placeholder="MM/YY"
                                            value={expiry}
                                            onChange={(e) => setExpiry(e.target.value.slice(0, 5))}
                                            maxLength={5}
                                            disabled={isProcessing}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            CVV
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border rounded-md p-2 text-sm"
                                            placeholder="123"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value.slice(0, 3))}
                                            maxLength={3}
                                            disabled={isProcessing}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                disabled={isProcessing}
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={handlePayment}
                                disabled={!isFormValid || isProcessing}
                                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        Przetwarzanie...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={16} />
                                        Zapłać {totalPrice.toFixed(2)} PLN
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
