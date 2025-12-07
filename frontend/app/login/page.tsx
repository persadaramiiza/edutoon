"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';
import { ArrowLeft, LogIn } from 'lucide-react';
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await login(email, password);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your email and password.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFF9F0] font-sans overflow-hidden relative">
      
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF7A00]/5 rounded-full blur-3xl"></div>
         <img src="/images/new-castle.png" className="absolute bottom-0 w-full opacity-20" alt="Castle" />
         <img src="/images/new-sun-cloud.png" className="absolute top-10 right-10 w-24 opacity-80 animate-pulse" alt="Sun" />
      </div>

      {/* Left Side - Illustration (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 relative items-center justify-center p-12 z-10 bg-[#FFF5E5] border-r-4 border-[#FFE0B2]">
        <div className="relative w-full max-w-lg text-center">
          <div className="mb-8 relative inline-block">
             <img src="/images/desain-20tanpa-20judul-20-286-29.png" alt="EduToon Logo" className="h-24 mx-auto drop-shadow-lg hover:rotate-12 transition-transform duration-300" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-[#4A4A4A] mb-6 leading-tight">
            Welcome Back, <br/>
            <span className="text-[#FF7A00]">Explorer!</span>
          </h1>
          <p className="text-[#8B7355] text-xl font-bold max-w-md mx-auto leading-relaxed">
            Ready to continue your learning adventure? The castle gates are open! 🏰✨
          </p>
          
          <div className="mt-12 relative h-64 w-full">
             <img src="/images/new-dragon.png" alt="Dragon" className="absolute top-0 left-1/2 -translate-x-1/2 h-full object-contain drop-shadow-2xl animate-bounce-slow" />
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 z-10">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border-4 border-[#FFE0B2] p-8 md:p-10 relative"
        >
          
          <Link href="/" className="absolute top-6 left-6 text-[#8B7355] hover:text-[#FF7A00] transition-colors">
            <ArrowLeft size={24} strokeWidth={3} />
          </Link>

          <div className="text-center mb-8 mt-4">
            <h2 className="text-3xl font-black text-[#4A4A4A] mb-2">Login</h2>
            <p className="text-[#8B7355] font-bold">Enter your details to start playing!</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-[#FFF5E5] border-l-4 border-[#D94D2B] text-[#D94D2B] p-4 rounded-r-xl mb-6 font-bold text-sm"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-xl mb-6 font-bold text-sm"
            >
              {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[#4A4A4A] font-black text-sm uppercase tracking-wide ml-1">Password</label>
                <Link href="/forgot-password" className="text-xs font-bold text-[#FF7A00] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl border-2 border-[#FFE0B2] focus:border-[#FF7A00] focus:ring-[#FF7A00]/20 bg-[#FFF9F0] text-[#4A4A4A] font-medium placeholder:text-[#8B7355]/40"
              />
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-lg bg-[#FF7A00] hover:bg-[#E66E00] text-white font-black rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-b-4 border-[#CC6200] active:border-b-0 active:translate-y-1"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Loading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn size={20} strokeWidth={3} /> Login Now
                  </span>
                )}
              </Button>
            </motion.div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#8B7355] font-bold">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#FF7A00] font-black hover:underline">
                Sign Up Free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
