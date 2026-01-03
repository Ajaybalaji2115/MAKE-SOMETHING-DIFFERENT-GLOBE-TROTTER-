import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    MdEmail,
    MdArrowBack,
    MdVpnKey,
    MdLock,
    MdCheckCircle,
    MdVisibility,
    MdVisibilityOff
} from 'react-icons/md';
import { FaGlobeAmericas } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import toast from 'react-hot-toast';
import api from '../lib/axios';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setStep(2);
            toast.success('OTP sent to your email! 📧');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data || 'Failed to send OTP. Please check the email.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/auth/reset-password', {
                email,
                otpCode: otp,
                newPassword
            });
            setStep(3);
            toast.success('Password reset successfully! 🎉');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data || 'Failed to reset password. Invalid OTP or Password.');
        } finally {
            setLoading(false);
        }
    };

    if (step === 3) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-400 to-green-600"></div>
                    <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
                        <MdCheckCircle className="text-5xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Password Reset!</h2>
                    <p className="text-gray-600 mb-8 text-lg">
                        Your password has been successfully reset. You can now login with your new credentials.
                    </p>
                    <Link
                        to="/login"
                        className="block w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-gray-500/30 transform hover:-translate-y-0.5"
                    >
                        Back to Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
            {/* Main Card Container */}
            <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex min-h-[600px]">

                {/* Left Side - Hero / Brand Panel */}
                <div className="hidden lg:flex flex-col justify-center items-center w-5/12 bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-950 text-white p-12 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

                    <div className="relative z-10 text-center">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl inline-flex mb-8 shadow-inner border border-white/20">
                            <MdVpnKey className="text-5xl text-white drop-shadow-lg" />
                        </div>
                        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
                            Secure Recovery
                        </h1>
                        <p className="text-purple-200 text-lg leading-relaxed mb-8">
                            Forgot your password? No problem. We'll help you get back into your account safely and quickly.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-purple-300 font-medium">
                            <FaGlobeAmericas />
                            <span>Global Access Support</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form Panel */}
                <div className="w-full lg:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white relative">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-8 text-center lg:text-left">
                            <Link to="/login" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 mb-6 group transition-colors">
                                <MdArrowBack className="mr-1 group-hover:-translate-x-1 transition-transform" />
                                Back to Login
                            </Link>

                            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">
                                {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                            </h1>
                            <p className="text-gray-500">
                                {step === 1
                                    ? "Enter your email address and we'll send you an OTP."
                                    : "Enter the OTP sent to your email and create a new password."}
                            </p>
                        </div>

                        {step === 1 ? (
                            <form onSubmit={handleRequestOtp} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <MdEmail className="text-gray-400 text-lg" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-gray-50/50 focus:bg-white text-sm font-medium"
                                            placeholder="e.g. john@example.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <AiOutlineLoading3Quarters className="animate-spin text-xl" />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <span>Send OTP</span>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700 ml-1">OTP Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all bg-gray-50 focus:bg-white text-center text-3xl tracking-[0.5em] font-bold font-mono"
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700 ml-1">New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <MdLock className="text-gray-400 text-lg" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="block w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-gray-50/50 focus:bg-white text-sm font-medium"
                                            placeholder="Enter new password"
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <MdVisibilityOff className="text-xl" /> : <MdVisibility className="text-xl" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 ml-1">
                                        Must be at least 8 characters with uppercase, number, and special character
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <AiOutlineLoading3Quarters className="animate-spin text-xl" />
                                            <span>Resetting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Reset Password</span>
                                            <MdCheckCircle className="text-lg opacity-80" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;