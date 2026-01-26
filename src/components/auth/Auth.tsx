import React, { useState } from 'react';
import { Mail, Lock, User, UserCheck, Stethoscope, ArrowRight, Eye, EyeOff, Calendar } from 'lucide-react';
import { consultationService } from '../../services/consultationServices';
import { SPECIALIZATIONS } from '../../types';

interface AuthProps {
    onAuthSuccess: (user: any) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
    const [isSignup, setIsSignup] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'PATIENT',
        specialization: SPECIALIZATIONS[0],
        dateOfBirth: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let data;
            if (isSignup) {
                data = await consultationService.signUp(formData);
            } else {
                data = await consultationService.signIn({ email: formData.email, password: formData.password });
            }

            if (data.message) {
                setError(data.message);
            } else {
                localStorage.setItem('profile', JSON.stringify(data));
                onAuthSuccess(data);
            }
        } catch (err) {
            setError('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsSignup((prev) => !prev);
        setError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-4">
            <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-indigo-500/20">
                <div className="p-8">
                    <div className="text-center mb-10">
                        <div className="inline-flex p-3 bg-indigo-100 rounded-xl text-indigo-600 mb-4 animate-bounce">
                            {isSignup ? <UserCheck size={32} /> : <Lock size={32} />}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {isSignup ? 'Dołącz do nas' : 'Witaj z powrotem'}
                        </h1>
                        <p className="text-gray-500">
                            {isSignup ? 'Zarejestruj się aby zarządzać konsultacjami' : 'Zaloguj się do swojego konta'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded animate-pulse">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isSignup && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <User size={14} /> Imię
                                    </label>
                                    <input
                                        required
                                        name="firstName"
                                        placeholder="Jan"
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <User size={14} /> Nazwisko
                                    </label>
                                    <input
                                        required
                                        name="lastName"
                                        placeholder="Kowalski"
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Mail size={14} /> Email
                            </label>
                            <input
                                required
                                name="email"
                                type="email"
                                placeholder="jan@przyklad.pl"
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            />
                        </div>

                        {isSignup && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Calendar size={14} /> Data urodzenia
                                </label>
                                <input
                                    required
                                    name="dateOfBirth"
                                    type="date"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Lock size={14} /> Hasło
                            </label>
                            <div className="relative">
                                <input
                                    required
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {isSignup && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Lock size={14} /> Powtórz hasło
                                    </label>
                                    <input
                                        required
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <UserCheck size={14} /> Typ konta
                                    </label>
                                    <select
                                        name="role"
                                        onChange={handleChange}
                                        value={formData.role}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none bg-white"
                                    >
                                        <option value="PATIENT">Pacjent</option>
                                        <option value="DOCTOR">Lekarz</option>
                                    </select>
                                </div>

                                {formData.role === 'DOCTOR' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Stethoscope size={14} /> Specjalizacja
                                        </label>
                                        <select
                                            name="specialization"
                                            onChange={handleChange}
                                            value={formData.specialization}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none bg-white font-medium"
                                        >
                                            {SPECIALIZATIONS.map(spec => (
                                                <option key={spec} value={spec}>{spec}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transform transition-all active:scale-95 shadow-lg hover:shadow-indigo-500/40 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isSignup ? 'Zarejestruj się' : 'Zaloguj się'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500 font-medium">
                        {isSignup ? 'Masz już konto?' : 'Nie masz jeszcze konta?'}
                        <button
                            onClick={switchMode}
                            className="ml-2 text-indigo-600 hover:text-indigo-800 underline decoration-2 underline-offset-4 transition-colors"
                        >
                            {isSignup ? 'Zaloguj się' : 'Utwórz konto'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
