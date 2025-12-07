"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui" 
import { LoadingPage } from '@/components/ui/Loading';
import { PlayCircle, ShieldCheck, Brain, Users, Heart, CheckCircle2, Menu, X, Star } from "lucide-react"
import { motion } from "framer-motion";

const questions = [
  {
    question: "Which animal has a long neck?",
    options: [
      { text: "Elephant", isCorrect: false },
      { text: "Giraffe", isCorrect: true }
    ]
  },
  {
    question: "What color is the sky?",
    options: [
      { text: "Blue", isCorrect: true },
      { text: "Green", isCorrect: false }
    ]
  },
  {
    question: "How many legs does a spider have?",
    options: [
      { text: "Six", isCorrect: false },
      { text: "Eight", isCorrect: true }
    ]
  },
  {
    question: "Which fruit is yellow?",
    options: [
      { text: "Apple", isCorrect: false },
      { text: "Banana", isCorrect: true }
    ]
  }
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [quizAnswered, setQuizAnswered] = useState<boolean | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'creator' || user.role === 'admin') {
        router.push('/creator');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isLoading, user, router]);

  const handleQuizAnswer = (isCorrect: boolean) => {
    setQuizAnswered(isCorrect);
    if (isCorrect) {
      setTimeout(() => {
        setQuizAnswered(null);
        setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
      }, 1500);
    }
  };

  if (isLoading) {
    return <LoadingPage text="Memuat..." />;
  }

  if (user) {
      return <LoadingPage text="Redirecting..." />;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex min-h-screen flex-col bg-[#FFF9F0] font-sans overflow-x-hidden text-[#4A4A4A]">
      
      {/* ================= HEADER ================= */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-[#FFE0B2] shadow-sm h-20 md:h-24 transition-all duration-300">
        <div className="container mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 md:gap-4 group cursor-pointer">
            <div className="relative h-10 w-10 md:h-14 md:w-14 transition-transform group-hover:rotate-12 duration-300 filter drop-shadow-md">
              <img
                src="/images/desain-20tanpa-20judul-20-286-29.png"
                alt="EduToon Logo"
                className="object-contain w-full h-full"
              />
            </div>
            <span className="text-xl md:text-3xl font-black tracking-tight text-[#D94D2B] drop-shadow-sm group-hover:text-[#FF7A00] transition-colors">
              EduToon
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-2 bg-[#FFF5E5]/50 p-2 rounded-full border border-[#FFE0B2]">
            <Link
              href="#features"
              className="px-4 lg:px-6 py-2 rounded-full text-sm lg:text-base font-bold text-[#8B7355] hover:bg-white hover:text-[#FF7A00] hover:shadow-md transition-all duration-300"
            >
              Features
            </Link>
            <Link
              href="/login"
              className="px-4 lg:px-6 py-2 rounded-full text-sm lg:text-base font-bold text-[#8B7355] hover:bg-white hover:text-[#FF7A00] hover:shadow-md transition-all duration-300"
            >
              For Parents
            </Link>
            <Link
              href="/register"
              className="px-4 lg:px-6 py-2 rounded-full text-sm lg:text-base font-bold text-[#8B7355] hover:bg-white hover:text-[#FF7A00] hover:shadow-md transition-all duration-300"
            >
              Creators
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-[#8B7355] font-bold hover:text-[#FF7A00] hover:bg-[#FF7A00]/10 text-base lg:text-lg px-4 lg:px-6 rounded-full"
              >
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="ghost"
                className="bg-[#FF7A00] text-white hover:bg-[#E66E00] text-base lg:text-lg px-6 lg:px-8 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all font-black"
              >
                Sign Up Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-[#D94D2B]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
             {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-[#FFE0B2] p-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-5">
             <Link href="#features" className="text-[#8B7355] font-bold text-lg">Features</Link>
             <Link href="/login" className="text-[#8B7355] font-bold text-lg">For Parents</Link>
             <Link href="/register" className="text-[#8B7355] font-bold text-lg">Creators</Link>
             <div className="flex flex-col gap-3 mt-4">
                <Link href="/login">
                  <Button variant="ghost" className="w-full text-[#8B7355] font-bold text-lg border-2 border-[#FFE0B2]">Login</Button>
                </Link>
                <Link href="/register">
                  <Button variant="ghost" className="w-full bg-[#FF7A00] font-bold text-lg text-white hover:bg-[#E66E00]">Sign Up Now</Button>
                </Link>
             </div>
          </div>
        )}
      </header>

      <main className="flex-1"> 
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative flex flex-col justify-start w-full">
          
          {/* 1. IMAGE CONTAINER (FULL RES & RESIZEABLE) */}
          <div className="relative w-full z-0 mt-20 md:mt-24"> 
             <img 
               src="/images/new-landing-bg.png" 
               alt="Adventure Background" 
               className="w-full h-auto object-contain block align-bottom" 
             />
             
             {/* Dekorasi menempel pada area gambar */}
             <div className="absolute top-10 left-4 md:top-20 md:left-10 w-20 md:w-36 lg:w-48 animate-pulse duration-[4000ms] pointer-events-none">
                <img src="/images/new-sun-cloud.png" alt="Sun" className="w-full h-full object-contain drop-shadow-xl" />
             </div>

             <div className="absolute top-[20%] right-[5%] md:right-[10%] transform rotate-6 animate-bounce-slow hidden lg:block pointer-events-none">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#D94D2B] italic drop-shadow-sm text-right leading-tight">
                  Grow <span className="text-[#FF7A00]">Smarter</span>, <br/>
                  Fly <span className="text-[#8B7355]">Higher.</span>
                </h2>
             </div>
             
             <div className="absolute bottom-0 left-0 w-full h-32 md:h-64 bg-gradient-to-t from-[#FFF9F0] via-[#FFF9F0]/60 to-transparent"></div>
          </div>

          {/* 2. KONTEN TEKS & LAINNYA (MUNCUL SETELAH GAMBAR) */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-10 md:-mt-20 lg:-mt-32 pb-20">
            <div className="flex flex-col items-center text-center">
              
              {/* HERO TEXT */}
              <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 mb-12 md:mb-16">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#4A4A4A] leading-[1.1] drop-shadow-sm"
                  >
                    Learning Made{" "}
                    <span className="text-[#FF7A00] relative inline-block transform hover:scale-105 transition-transform duration-300 cursor-default">
                      Fun
                      <svg
                        className="absolute w-full h-3 md:h-4 -bottom-1 md:-bottom-2 left-0 text-[#FFD180]"
                        viewBox="0 0 100 10"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0 5 Q 50 15 100 5"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>{" "}
                    &{" "}
                    <span className="text-[#D94D2B] relative inline-block transform hover:rotate-3 transition-transform duration-300 cursor-default">
                      Smart!
                    </span>
                  </motion.h1>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-lg sm:text-xl md:text-2xl text-[#8B7355] max-w-[700px] font-bold leading-relaxed mx-auto drop-shadow-sm px-4"
                  >
                    EduToon invites kids to learn while playing with interactive videos. Fun quizzes make understanding
                    even better! 🚀
                  </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                  className="flex flex-col sm:flex-row gap-4 justify-center px-4"
                >
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="lg"
                        variant="ghost"
                        className="w-full text-base md:text-lg h-14 md:h-16 px-8 md:px-10 rounded-full shadow-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-black"
                      >
                        <PlayCircle className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                        Start Adventure
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                          size="lg" 
                          variant="ghost"
                          className="w-full text-base md:text-lg h-14 md:h-16 px-8 md:px-10 rounded-full bg-white text-[#FF7A00] border-2 border-[#FF7A00] hover:bg-[#FFF5E5] font-black"
                      >
                        Parent Dashboard
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="flex flex-wrap justify-center gap-3 md:gap-4 text-xs sm:text-sm font-bold text-[#8B7355] px-4 pt-4"
                >
                  <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-[#FFE0B2] shadow-sm">
                    <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-[#D94D2B]" />
                    <span>Kid Safe</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-[#FFE0B2] shadow-sm">
                    <Brain className="h-4 w-4 md:h-5 md:w-5 text-[#FFD93D]" />
                    <span>Brain Training</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-[#FFE0B2] shadow-sm">
                    <Heart className="h-4 w-4 md:h-5 md:w-5 text-[#FF7A00]" />
                    <span>Made with Love</span>
                  </div>
                </motion.div>
              </div>

              {/* VIDEO PREVIEW CARD (Naga Quiz) */}
              <div className="relative w-full max-w-5xl mx-auto px-4">
                  <div className="relative aspect-video rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-[6px] md:border-[8px] lg:border-[12px] border-[#FFE0B2] bg-[#FFF5E5] group z-20">
                    <img 
                      src="/images/QuizImg.png" 
                      alt="Video Preview" 
                      className="w-full h-full object-cover"
                    />
                    
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/50 shadow-[0_10px_30px_rgba(248,94,0,0.4)] animate-pulse cursor-pointer hover:scale-110 transition-transform hover:bg-[#FF7A00]/80">
                        <PlayCircle className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-white ml-1" />
                      </div>
                    </div>

                    {/* QUIZ CARD - WIDER (max-w-2xl) */}
                    <div className="absolute bottom-3 left-3 right-3 md:bottom-6 md:left-6 md:right-6 lg:bottom-8 lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-2xl z-30">
                      <div className="bg-white p-3 md:p-4 lg:p-6 rounded-[1rem] md:rounded-[1.5rem] lg:rounded-[2rem] shadow-2xl border-b-4 md:border-b-6 lg:border-b-8 border-[#FF7A00] animate-in slide-in-from-bottom-4 fade-in duration-700 delay-500">
                        <div className="flex gap-2 md:gap-3 lg:gap-4 items-center">
                          <div className="h-10 w-10 md:h-14 md:w-14 lg:h-16 lg:w-16 shrink-0 drop-shadow-md bg-[#FFF5E5] rounded-full p-1">
                            <img src="/images/new-fairy.png" alt="Quiz Fairy" className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-black text-[#8B7355] mb-0.5 md:mb-1 text-base md:text-lg lg:text-xl flex items-center gap-2">
                              Quick Quiz! 
                              {quizAnswered === true && <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-500" />}
                            </h3>
                            <p className="text-sm md:text-base text-[#8B7355]/70 font-bold mb-2 md:mb-3 leading-tight">
                              {currentQuestion.question}
                            </p>
                            {quizAnswered === null ? (
                              <div className="flex gap-2">
                                {currentQuestion.options.map((option, idx) => (
                                  <button 
                                    key={idx}
                                    onClick={() => handleQuizAnswer(option.isCorrect)}
                                    className="px-2 py-4 md:px-3 md:py-5 rounded-xl text-base md:text-lg font-black border-b-4 transition-all w-full text-center bg-[#FF7A00] text-white border-[#E66E00] hover:bg-[#E66E00] hover:scale-105 shadow-lg"
                                  >
                                    {option.text}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col gap-2">
                                <button 
                                  onClick={() => setQuizAnswered(null)}
                                  className={`w-full py-4 md:py-5 rounded-xl font-black text-base md:text-lg text-white shadow-lg transition-all hover:scale-105 ${quizAnswered ? 'bg-green-500 hover:bg-green-600 border-b-4 border-green-700' : 'bg-red-500 hover:bg-red-600 border-b-4 border-red-700'}`}
                                >
                                  {quizAnswered ? "🎉 Correct! Next Question..." : "❌ Wrong! Try Again"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dragon Decoration - Moved to front and right */}
                  <div className="absolute -top-10 -right-10 md:-top-20 md:-right-20 lg:-top-32 lg:-right-32 w-40 h-40 md:w-64 md:h-64 lg:w-80 lg:h-80 z-40 hidden md:block">
                     <img src="/images/new-dragon.png" alt="Dragon" className="w-full h-full object-contain drop-shadow-2xl transform rotate-12 hover:scale-110 hover:rotate-6 transition-all duration-300 cursor-pointer" />
                  </div>

                  {/* Fairy Decoration - Added to left */}
                  <div className="absolute -top-10 -left-10 md:-top-20 md:-left-20 lg:-top-32 lg:-left-32 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 z-40 hidden md:block">
                     <img src="/images/new-fairy.png" alt="Fairy" className="w-full h-full object-contain drop-shadow-2xl transform -rotate-12 hover:scale-110 hover:-rotate-6 transition-all duration-300 cursor-pointer" />
                  </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES GRID ================= */}
        <section id="features" className="bg-[#FFF5E5] py-16 md:py-24 relative rounded-t-[2rem] md:rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.05)] overflow-hidden -mt-10 z-30">
          <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#FF7A00]/20 to-transparent -z-10 rounded-t-[2rem] md:rounded-t-[3rem]" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 md:mb-16 max-w-4xl mx-auto bg-white/80 backdrop-blur-sm p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl border-4 border-white ring-4 ring-[#FF7A00]/10"
            >
              <span className="inline-block px-4 py-1.5 md:px-6 md:py-2 rounded-full bg-[#FF7A00] text-white font-black tracking-wider uppercase text-xs md:text-sm mb-4 md:mb-6 shadow-lg transform -rotate-2 hover:rotate-0 transition-transform">
                Why EduToon?
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#4A4A4A] mt-2 mb-4 md:mb-6">
                Learning Should Be{" "}
                <span className="text-[#D94D2B] relative inline-block">
                  Fun!
                  <svg className="absolute w-full h-3 md:h-4 -bottom-1 md:-bottom-2 left-0 text-[#FFD93D]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </h2>
              <p className="text-lg md:text-xl text-[#8B7355] font-bold leading-relaxed max-w-2xl mx-auto">
                We combine entertainment and education in a safe way, so parents can relax and kids can have fun!
              </p>
            </motion.div>
            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  color: "text-[#D94D2B]",
                  bg: "bg-[#D94D2B]/10",
                  border: "border-[#D94D2B]/20",
                  title: "Kid Safe",
                  desc: "Every content is strictly curated. Free from inappropriate material. 100% Kid-Safe!",
                },
                {
                  icon: Brain,
                  color: "text-[#FF7A00]",
                  bg: "bg-[#FF7A00]/10",
                  border: "border-[#FF7A00]/20",
                  title: "Interactive Learning",
                  desc: "Video pauses automatically for quizzes. Watching isn't just passive, it's thinking too!",
                },
                {
                  icon: Users,
                  color: "text-[#8B7355]",
                  bg: "bg-[#8B7355]/10",
                  border: "border-[#8B7355]/20",
                  title: "Parental Control",
                  desc: "Monitor learning progress and set specific profiles for each child easily.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  whileHover={{ y: -10 }}
                  className={`bg-[#FFF9F0] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-lg border-b-4 md:border-b-8 ${feature.border} group cursor-default`}
                >
                  <div
                    className={`h-16 w-16 md:h-20 md:w-20 rounded-[1rem] md:rounded-[1.5rem] ${feature.bg} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-inner`}
                  >
                    <feature.icon className={`h-8 w-8 md:h-10 md:w-10 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-[#4A4A4A] mb-2 md:mb-3">{feature.title}</h3>
                  <p className="text-[#8B7355] leading-relaxed font-bold text-sm md:text-base">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="py-16 md:py-20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[#FFF5E5]/30 -z-20" />
          <div className="absolute bottom-0 w-full h-24 md:h-32 bg-[url('/images/new-stone-path.png')] bg-repeat-x opacity-30 -z-10" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 md:mb-16"
            >
              <span className="inline-block px-4 py-1 rounded-full bg-white text-[#FF7A00] font-black tracking-wider uppercase text-xs md:text-sm mb-4 border-2 border-[#FF7A00]/20">
                Easy Steps
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#4A4A4A] mb-4">
                Start Your <span className="text-[#FF7A00]">Adventure</span>
              </h2>
            </motion.div>

            <div className="grid gap-8 grid-cols-1 md:grid-cols-3 relative">
              <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-2 bg-white border-y-4 border-dashed border-[#FFE0B2] z-0" />
              {[
                { step: "01", title: "Create Profile", desc: "Set up a cute avatar for your child.", color: "bg-[#D94D2B]", rotate: "-rotate-3" },
                { step: "02", title: "Watch & Play", desc: "Enjoy interactive videos and take quizzes.", color: "bg-[#FFD93D]", rotate: "rotate-3" },
                { step: "03", title: "Earn Rewards", desc: "Collect badges and track progress!", color: "bg-[#FF7A00]", rotate: "-rotate-3" },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.3 }}
                  className="relative z-10 flex flex-col items-center text-center group"
                >
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2rem] ${item.color} flex items-center justify-center text-white text-2xl md:text-3xl font-black border-4 border-white shadow-xl mb-4 md:mb-6 transform transition-transform duration-300 group-hover:scale-110 ${item.rotate}`}>
                    {item.step}
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-[#4A4A4A] mb-2">{item.title}</h3>
                  <p className="text-[#8B7355] font-bold px-4 md:px-8 text-sm md:text-base">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= TESTIMONIALS ================= */}
        <section className="py-16 md:py-24 bg-white relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#4A4A4A] mb-4">
                Parents <span className="text-[#D94D2B]">Love Us!</span>
              </h2>
              <p className="text-lg md:text-xl text-[#8B7355] font-bold">See what other moms and dads are saying.</p>
            </motion.div>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-3 pt-10 md:pt-0">
              {[
                { name: "Mama Sarah", role: "Mother of 2", avatar: "/images/rabbit-avatar.png", bg: "bg-pink-50", text: "EduToon is a lifesaver! My kids engage with the quizzes instead of just staring at the screen." },
                { name: "Papa Doni", role: "Father of Budi", avatar: "/images/lion-avatar.png", bg: "bg-orange-50", text: "The safety features give me peace of mind. Finally, a platform I can trust 100%." },
                { name: "Bunda Rina", role: "Mother of 5yo", avatar: "/images/panda-avatar.png", bg: "bg-blue-50", text: "My son learned to count in just a week! The characters are so cute and friendly." },
              ].map((review, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  whileHover={{ y: -10 }}
                  className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] ${review.bg} border-4 border-white shadow-lg hover:shadow-xl transition-all relative mt-10 md:mt-0`}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white shadow-md bg-white overflow-hidden">
                    <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="mt-8 text-center">
                    <div className="flex justify-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 md:h-5 md:w-5 text-[#FFD93D] fill-[#FFD93D]" />
                      ))}
                    </div>
                    <p className="text-[#8B7355] font-bold italic mb-4 md:mb-6 text-sm md:text-base">"{review.text}"</p>
                    <h4 className="font-black text-lg text-[#4A4A4A]">{review.name}</h4>
                    <span className="text-xs md:text-sm font-bold text-[#8B7355]/50 uppercase tracking-wide">{review.role}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CTA SECTION ================= */}
        <section className="py-16 md:py-20 container mx-auto px-4 sm:px-6 lg:px-8 mb-10 md:mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-[#4A4A4A] rounded-[2rem] md:rounded-[3rem] p-6 md:p-16 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-8 md:gap-10"
          >
            <div className="absolute inset-0 opacity-10 bg-[url('/images/new-landing-bg.png')] bg-cover bg-center mix-blend-overlay" />
            <div className="relative z-10 flex-1 text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 md:mb-6 leading-tight">
                Ready to Join the <br />
                <span className="text-[#FFD93D]">Magic Castle?</span>
              </h2>
              <p className="text-white/80 text-lg md:text-xl font-bold mb-6 md:mb-8 max-w-lg mx-auto md:mx-0">
                Unlimited fun learning adventures await! Create an account today and get 1 month free.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/register" className="w-full sm:w-auto">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="ghost" className="bg-[#FFD93D] text-[#4A4A4A] hover:bg-white border-b-4 border-[#FF7A00] w-full text-lg md:text-xl h-14 md:h-16 px-8 md:px-10 rounded-2xl font-black">
                      Get Started Free
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
            <div className="relative z-10 w-full md:w-1/2 flex justify-center">
               <div className="relative w-full max-w-xs md:max-w-md aspect-square animate-bounce-slow">
                 <div className="absolute inset-0 bg-[#FFD93D]/20 blur-3xl rounded-full" />
                 <img src="/images/new-castle.png" alt="Magic Castle" className="w-full h-full object-contain relative z-10 drop-shadow-2xl transform hover:scale-105 transition-transform duration-500" />
                 <img src="/images/new-dragon.png" alt="Dragon" className="absolute -top-8 -right-8 md:-top-10 md:-right-10 w-24 h-24 md:w-32 md:h-32 animate-pulse object-contain hidden lg:block" />
               </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t-4 border-[#FFE0B2] bg-white py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="h-8 w-8 md:h-10 md:w-10">
              <img src="/images/desain-20tanpa-20judul-20-286-29.png" alt="EduToon Logo" className="object-contain w-full h-full" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tight text-[#4A4A4A]">EduToon</span>
          </div>
          <p className="text-xs md:text-sm font-bold text-[#8B7355]/50">© 2025 EduToon. Growing Smarter Together.</p>
        </div>
      </footer>
    </div>
  )
}
