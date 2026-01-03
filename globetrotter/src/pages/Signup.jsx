import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdLanguage, MdVpnKey } from 'react-icons/md';
import { FaGoogle, FaGlobeAmericas, FaCheckCircle, FaShieldAlt, FaUserPlus } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { HiSparkles, HiMailOpen } from 'react-icons/hi';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useLanguage } from '../context/LanguageContext';

const Signup = () => {
    const navigate = useNavigate();
    const { changeLanguage, t } = useLanguage();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', languagePreference: 'English' });
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });

        if (e.target.name === 'languagePreference') {
            changeLanguage(e.target.value);
        }
    };

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address.');
            return false;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            toast.error('Password must be at least 8 characters with uppercase, number, and special character.');
            return false;
        }
        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
            await api.post('/auth/register', formData);
            setStep(2);
            toast.success(`OTP sent to ${formData.email}! Check your inbox 📧`);
        } catch (err) {
            toast.error(err.response?.data || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/auth/register/verify', { email: formData.email, otpCode: otp });
            toast.success('Account verified successfully! 🎉');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            toast.error(err.response?.data || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await api.post('/auth/google', { token: credentialResponse.credential });
            const { token, role } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ email: 'Google User', role }));
            toast.success('Successfully signed up with Google! 🎉');
            setTimeout(() => navigate('/'), 500);
        } catch (err) {
            console.error("Google Signup Failed", err);
            toast.error('Google Signup failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
            {/* Main Card Container */}
            <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex min-h-[600px]">

                {/* Left Side - Hero / Brand Panel */}
                <div className="hidden lg:flex flex-col justify-center items-center w-5/12 bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-900 text-white p-12 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

                    <div className="relative z-10 text-center">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl inline-flex mb-8 shadow-inner border border-white/20">
                            {step === 1 ? (
                                <FaGlobeAmericas className="text-5xl text-white drop-shadow-lg" />
                            ) : (
                                <HiMailOpen className="text-5xl text-white drop-shadow-lg" />
                            )}
                        </div>
                        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
                            {step === 1 ? 'Start Your Journey' : 'Verify Email'}
                        </h1>
                        <p className="text-blue-100 text-lg leading-relaxed mb-8">
                            {step === 1
                                ? "Unlock your potential. Master the skills that will shape your future and career."
                                : "We've sent a verification code to your email. Please enter it to continue."}
                        </p>

                        {step === 1 && (
                            <div className="space-y-4 w-full max-w-xs mx-auto text-left">
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                                    <div className="bg-white/20 p-2 rounded-full"><FaUserPlus /></div>
                                    <span className="font-medium">Free access to intro courses</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                                    <div className="bg-white/20 p-2 rounded-full"><HiSparkles /></div>
                                    <span className="font-medium">Community support & mentorship</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side - Form Panel */}
                <div className="w-full lg:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white relative">
                    {/* Language Selector (Floating) */}
                    <div className="absolute top-6 right-6 z-20">
                        <div className="relative inline-block group">
                            <MdLanguage className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
                            <select
                                name="languagePreference"
                                value={formData.languagePreference}
                                onChange={handleChange}
                                className="pl-9 pr-4 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-full text-gray-600 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                                <option value="English">ENG</option>
                                <option value="Hindi">HIN</option>
                                <option value="Tamil">TAM</option>
                                <option value="Telugu">TEL</option>
                                <option value="Malayalam">MAL</option>
                                <option value="Kannada">KAN</option>
                            </select>
                        </div>
                    </div>

                    <div className="max-w-md mx-auto w-full">
                        {step === 1 ? (
                            <>
                                <div className="mb-8 text-center lg:text-left">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2 font-display">{t('createAccount')}</h2>
                                    <p className="text-gray-500">Join the community and start learning today.</p>
                                </div>

                                <form onSubmit={handleRegister} className="space-y-5">
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700 ml-1">{t('fullName')}</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <MdPerson className="text-gray-400 text-lg" />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50 focus:bg-white text-sm font-medium"
                                                placeholder="e.g. John Doe"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700 ml-1">{t('emailLabel')}</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <MdEmail className="text-gray-400 text-lg" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50 focus:bg-white text-sm font-medium"
                                                placeholder="e.g. john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700 ml-1">{t('passwordLabel')}</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <MdLock className="text-gray-400 text-lg" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="block w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50 focus:bg-white text-sm font-medium"
                                                placeholder="Create a strong password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                                            </button>
                                        </div>
                                        {/* Password Requirements */}
                                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-gray-500 pl-1">
                                            <div className="flex items-center gap-1">
                                                <div className={`w-1.5 h-1.5 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                <span className={formData.password.length >= 8 ? 'text-green-600 font-medium' : ''}>Min 8 chars</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className={`w-1.5 h-1.5 rounded-full ${/\d/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                <span className={/\d/.test(formData.password) ? 'text-green-600 font-medium' : ''}>At least 1 number</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className={`w-1.5 h-1.5 rounded-full ${/[@$!%*?&]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                <span className={/[@$!%*?&]/.test(formData.password) ? 'text-green-600 font-medium' : ''}>At least 1 special char</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                <span className={/[A-Z]/.test(formData.password) ? 'text-green-600 font-medium' : ''}>At least 1 uppercase</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mt-2"
                                    >
                                        {loading ? (
                                            <AiOutlineLoading3Quarters className="animate-spin text-xl" />
                                        ) : (
                                            <>
                                                <span>{t('createAccount')}</span>
                                                <FaUserPlus className="text-sm opacity-80" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-gray-500 font-medium text-xs uppercase tracking-wider">Or continue with</span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="relative group hover:scale-[1.02] transition-transform duration-200">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={() => toast.error(t('googleSignupFailed'))}
                                            text="continue_with"
                                            size="large"
                                            width="100%"
                                            shape="rectangular"
                                            logo_alignment="left"
                                        />
                                    </div>
                                </div>

                                <p className="text-center text-sm text-gray-600 mt-8">
                                    {t('alreadyAccount')}{' '}
                                    <Link
                                        to="/login"
                                        className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                    >
                                        {t('signIn')}
                                    </Link>
                                </p>
                            </>
                        ) : (
                            /* OTP Verification Form */
                            <>
                                <div className="mb-8 text-center lg:text-left">
                                    <Link onClick={() => setStep(1)} to="#" className="text-xs font-bold text-gray-500 hover:text-blue-600 mb-4 inline-block">← Back to Details</Link>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2 font-display">Verify Email</h2>
                                    <p className="text-gray-500">Enter the code sent to <span className="font-semibold text-gray-800">{formData.email}</span></p>
                                </div>

                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700 ml-1">{t('enterOtp')}</label>
                                        <input
                                            type="text"
                                            required
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-center text-3xl tracking-[0.5em] font-bold font-mono"
                                            placeholder="••••••"
                                            maxLength={6}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <AiOutlineLoading3Quarters className="animate-spin text-xl" />
                                                <span>Verifying...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{t('verifyActivate')}</span>
                                                <FaCheckCircle className="text-sm opacity-80" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;