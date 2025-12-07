"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';
import { ArrowLeft, UserPlus, Check, X } from 'lucide-react';
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'parent' | 'creator'>('parent');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name, role);
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFF9F0] font-sans overflow-hidden relative">
      
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FFD93D]/5 rounded-full blur-3xl"></div>
         <img src="/images/new-stone-path.png" className="absolute bottom-0 w-full opacity-20" alt="Path" />
      </div>

      {/* Left Side - Illustration (Hidden on mobile) */}
      <div className="hidden md:flex md:w-5/12 relative items-center justify-center p-12 z-10 bg-[#FFF5E5] border-r-4 border-[#FFE0B2]">
        <div className="relative w-full max-w-lg text-center">
          <div className="mb-8 relative inline-block">
             <img src="/images/desain-20tanpa-20judul-20-286-29.png" alt="EduToon Logo" className="h-20 mx-auto drop-shadow-lg" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-[#4A4A4A] mb-6 leading-tight">
            Join the <br/>
            <span className="text-[#D94D2B]">Fun!</span>
          </h1>
          <p className="text-[#8B7355] text-lg font-bold max-w-md mx-auto leading-relaxed mb-10">
            Create an account to unlock unlimited educational videos, quizzes, and games for your kids.
          </p>
          
          <div className="relative h-64 w-full">
             <img src="/images/new-fairy.png" alt="Fairy" className="absolute top-0 left-1/2 -translate-x-1/2 h-full object-contain drop-shadow-2xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 z-10 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl border-4 border-[#FFE0B2] p-8 md:p-10 relative my-auto"
        >
          
          <Link href="/" className="absolute top-6 left-6 text-[#8B7355] hover:text-[#FF7A00] transition-colors">
            <ArrowLeft size={24} strokeWidth={3} />
          </Link>

          <div className="text-center mb-8 mt-4">
            <h2 className="text-3xl font-black text-[#4A4A4A] mb-2">Sign Up</h2>
            <p className="text-[#8B7355] font-bold">It's free and takes less than a minute!</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl mb-6 font-bold text-sm flex items-center gap-2"
            >
              <X size={18} /> {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-xl mb-6 font-bold text-sm flex items-center gap-2"
            >
              <Check size={18} /> {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setRole('parent')}
                className={`p-3 rounded-xl border-2 font-black text-sm md:text-base transition-all ${
                  role === 'parent'
                    ? 'bg-[#FF7A00] text-white border-[#CC6200] shadow-lg scale-105'
                    : 'bg-white text-[#8B7355] border-[#FFE0B2] hover:bg-[#FFF9F0]'
                }`}
              >
                👨‍👩‍👧‍👦 I'm a Parent
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setRole('creator')}
                className={`p-3 rounded-xl border-2 font-black text-sm md:text-base transition-all ${
                  role === 'creator'
                    ? 'bg-[#D94D2B] text-white border-[#A0351E] shadow-lg scale-105'
                    : 'bg-white text-[#8B7355] border-[#FFE0B2] hover:bg-[#FFF9F0]'
                }`}
              >
                🎨 I'm a Creator
              </motion.button>
            </div>

            <div className="space-y-2">
              <label className="text-[#4A4A4A] font-black text-sm uppercase tracking-wide ml-1">Full Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 rounded-xl border-2 border-[#FFE0B2] focus:border-[#FF7A00] focus:ring-[#FF7A00]/20 bg-[#FFF9F0] text-[#4A4A4A] font-medium placeholder:text-[#8B7355]/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[#4A4A4A] font-black text-sm uppercase tracking-wide ml-1">Email</label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-2 border-[#FFE0B2] focus:border-[#FF7A00] focus:ring-[#FF7A00]/20 bg-[#FFF9F0] text-[#4A4A4A] font-medium placeholder:text-[#8B7355]/40"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                <label className="text-[#4A4A4A] font-black text-sm uppercase tracking-wide ml-1">Password</label>
                <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl border-2 border-[#FFE0B2] focus:border-[#FF7A00] focus:ring-[#FF7A00]/20 bg-[#FFF9F0] text-[#4A4A4A] font-medium placeholder:text-[#8B7355]/40"
                />
                </div>

                <div className="space-y-2">
                <label className="text-[#4A4A4A] font-black text-sm uppercase tracking-wide ml-1">Confirm</label>
                <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl border-2 border-[#FFE0B2] focus:border-[#FF7A00] focus:ring-[#FF7A00]/20 bg-[#FFF9F0] text-[#4A4A4A] font-medium placeholder:text-[#8B7355]/40"
                />
                </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-lg bg-[#FF7A00] hover:bg-[#E66E00] text-white font-black rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-b-4 border-[#CC6200] active:border-b-0 active:translate-y-1 mt-4"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus size={20} strokeWidth={3} /> Create Account
                  </span>
                )}
              </Button>
            </motion.div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#8B7355] font-bold">
              Already have an account?{' '}
              <Link href="/login" className="text-[#FF7A00] font-black hover:underline">
                Login Here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
