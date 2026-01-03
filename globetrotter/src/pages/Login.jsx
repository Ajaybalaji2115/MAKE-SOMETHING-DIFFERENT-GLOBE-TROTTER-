import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader, AlertCircle, Globe } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../lib/axios';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
    const navigate = useNavigate();
    const { changeLanguage, t } = useLanguage();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address.');
            return false;
        }

        // Password validation: min 8 chars, 1 special, 1 number, 1 uppercase
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            setError('Password must be at least 8 characters, include one uppercase letter, one number, and one special character.');
            return false;
        }
        return true;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', formData);
            const { token, role } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ email: formData.email, role }));

            navigate('/');
        } catch (err) {
            setError(err.response?.data || 'Invalid credentials or server error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await api.post('/auth/google', { token: credentialResponse.credential });
            const { token, role } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ email: 'Google User', role })); // We could decode token to get email
            navigate('/');
        } catch (err) {
            console.error("Google Login Failed", err);
            setError('Google Login failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8 relative">
                    <div className="absolute right-0 top-0">
                        <select
                            onChange={(e) => changeLanguage(e.target.value)}
                            className="text-xs border border-gray-200 rounded-md p-1 outline-none focus:border-blue-500 bg-gray-50 text-gray-600"
                        >
                            <option value="English">🇬🇧 English</option>
                            <option value="Hindi">🇮🇳 Hindi</option>
                            <option value="Tamil">🇮🇳 Tamil</option>
                            <option value="Telugu">🇮🇳 Telugu</option>
                            <option value="Malayalam">🇮🇳 Malayalam</option>
                            <option value="Kannada">🇮🇳 Kannada</option>
                        </select>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('loginWelcome')}</h1>
                    <p className="text-gray-500 mt-2">{t('loginSubtitle')}</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-start gap-2">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="mb-6 flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            setError('Google Login Failed');
                        }}
                    />
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">{t('orLoginEmail')}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('emailLabel')}</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                placeholder={t('emailPlaceholder')}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('passwordLabel')}</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                placeholder={t('passwordPlaceholder')}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            {t('forgotPassword')}
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : t('signIn')}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                    {t('noAccount')}{' '}
                    <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
                        {t('createAccount')}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
