import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdLanguage } from 'react-icons/md';
import { FaGoogle, FaGlobeAmericas, FaShieldAlt, FaRocket } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { HiSparkles } from 'react-icons/hi';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
    const navigate = useNavigate();
    const { changeLanguage, t } = useLanguage();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await api.post('/auth/login', formData);
            console.log('Login Response:', response.data); // Debugging
            const { token, role } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('role', role); // Consolidate role storage
            localStorage.setItem('user', JSON.stringify({ email: formData.email, role })); // Keep this for legacy if needed

            toast.success('Welcome back! 🎉');

            setTimeout(() => {
                if (role === 'ADMIN') {
                    navigate('/dashboard/admin');
                } else {
                    navigate('/');
                }
            }, 500);
        } catch (err) {
            toast.error(err.response?.data || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await api.post('/auth/google', { token: credentialResponse.credential });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role); // Save role
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                // Assuming 'loadingToast' is defined elsewhere or should be removed if not needed.
                // For now, keeping it as per instruction, but it might cause a reference error.
                toast.success(t('loginSuccess'), { id: 'googleLoginToast' }); // Changed id to a string literal for safety

                if (response.data.role === 'ADMIN') {
                    navigate('/dashboard/admin');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            console.error("Google Login Failed", err);
            toast.error('Google Login failed. Please try again.');
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
                            <FaGlobeAmericas className="text-5xl text-white drop-shadow-lg" />
                        </div>
                        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Welcome Back!</h1>
                        <p className="text-blue-100 text-lg leading-relaxed mb-8">
                            Note: Your access leads to opportunity. Continue your journey with GlobeTrotter.
                        </p>

                        <div className="flex gap-2 justify-center opacity-70">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form Panel */}
                <div className="w-full lg:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white relative">
                    {/* Language Selector (Floating) */}
                    <div className="absolute top-6 right-6 z-20">
                        <div className="relative inline-block group">
                            <MdLanguage className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
                            <select
                                onChange={(e) => changeLanguage(e.target.value)}
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
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2 font-display">{t('signIn')}</h2>
                            <p className="text-gray-500">Please enter your details to continue.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-700 ml-1">Email</label>
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
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
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
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <AiOutlineLoading3Quarters className="animate-spin text-xl" />
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <FaRocket className="text-sm opacity-80" />
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
                                    onError={() => toast.error('Google Login Failed')}
                                    size="large"
                                    width="100%"
                                    text="continue_with"
                                    shape="rectangular"
                                    logo_alignment="left"
                                />
                            </div>
                        </div>

                        <p className="text-center text-sm text-gray-600 mt-8">
                            Don't have an account?{' '}
                            <Link
                                to="/signup"
                                className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;