import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlayCircle, Search, Star, Clock, Heart } from "lucide-react"

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b-2 border-brand-cream shadow-sm">
        <div className="container mx-auto flex h-24 items-center justify-between px-6 lg:px-8 gap-8">
          <Link href="/" className="flex items-center gap-4 group shrink-0">
            <div className="h-14 w-14 transition-transform group-hover:rotate-12 duration-300 filter drop-shadow-md">
              <img
                src="/images/desain-20tanpa-20judul-20-286-29.png"
                alt="EduToon Logo"
                className="object-contain w-full h-full"
              />
            </div>
            <span className="hidden sm:block text-3xl font-black tracking-tight text-brand-red group-hover:text-brand-orange transition-colors">
              EduToon
            </span>
          </Link>

          <div className="hidden md:flex items-center flex-1 max-w-2xl mx-auto">
            <div className="relative w-full group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-brand-orange/10 p-1.5 rounded-lg group-focus-within:bg-brand-orange group-focus-within:text-white transition-colors duration-300">
                <Search className="h-5 w-5 text-brand-orange group-focus-within:text-white" />
              </div>
              <input
                type="text"
                placeholder="Search for fun videos, topics, or characters..."
                className="w-full h-14 pl-16 pr-6 rounded-full bg-brand-cream/30 border-2 border-brand-cream/50 focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:outline-none transition-all font-bold text-brand-olive placeholder:text-brand-olive/40 text-lg shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="hidden sm:flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border-2 border-brand-yellow shadow-sm hover:shadow-md transition-shadow cursor-default">
              <div className="bg-brand-yellow p-1.5 rounded-full">
                <Star className="h-5 w-5 text-white fill-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-bold text-brand-olive/60 uppercase tracking-wider">Your Points</span>
                <span className="font-black text-xl text-brand-olive">120</span>
              </div>
            </div>

            {/* Updated profile avatar to use the cute dragon image */}
            <div className="group relative cursor-pointer">
              <div className="h-14 w-14 rounded-full bg-brand-cream border-4 border-white shadow-lg overflow-hidden group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ring-2 ring-brand-cream/50">
                <img
                  src="/images/new-dragon.png"
                  alt="Profile"
                  className="h-full w-full object-cover bg-brand-orange/10"
                />
              </div>
              <div className="absolute bottom-0 right-0 h-5 w-5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Added a personalized greeting with the character */}
        <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-[2rem] shadow-sm border border-brand-cream/50 relative overflow-hidden">
          {/* Added background cloud decoration */}
          <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none">
            <img src="/images/new-clouds.png" className="w-full h-full object-cover" alt="" />
          </div>

          {/* Replaced panda avatar with dragon avatar */}
          <div className="h-20 w-20 shrink-0 animate-bounce duration-[2000ms] relative z-10">
            <img src="/images/new-dragon.png" alt="Welcome" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-black text-brand-olive">Hello, EduToon Friend! 👋</h1>
            <p className="text-brand-olive/60 font-bold">Ready for today's learning adventure?</p>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
          {["All", "Science", "Math", "Language", "Art", "Music", "Stories"].map((cat, i) => (
            <button
              key={cat}
              className={`px-6 py-3 rounded-2xl font-black whitespace-nowrap transition-all transform hover:scale-105 active:scale-95 ${
                i === 0
                  ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/30"
                  : "bg-white text-brand-olive hover:bg-brand-cream/50 shadow-sm border-2 border-transparent hover:border-brand-cream"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Banner */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-brand-olive aspect-[21/9] mb-12 shadow-xl group cursor-pointer">
          <img
            src="/space-cartoon.jpg"
            alt="Featured"
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange text-white text-sm font-black mb-4 shadow-lg">
              <Star className="h-4 w-4 fill-white" />
              POPULAR THIS WEEK
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">Adventure to Mars</h1>
            <p className="text-white/90 text-lg font-bold mb-8 line-clamp-2 max-w-xl">
              Join Captain Budi exploring the red planet! We'll learn about gravity and space rockets. 🚀
            </p>
            <div className="flex gap-4">
              <Link href="/watch/1">
                <Button size="lg" variant="brand" className="h-14 px-8 text-lg rounded-2xl shadow-xl border-none">
                  <PlayCircle className="mr-2 h-6 w-6" />
                  Watch Now
                </Button>
              </Link>
              <Button
                size="lg"
                className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur hover:bg-white/30 text-white border-2 border-white/50"
              >
                <Heart className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <h2 className="text-3xl font-black text-brand-olive mb-8 flex items-center gap-3">
          <span className="bg-brand-yellow/20 p-2 rounded-xl">📚</span>
          Recommended For You
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[
            {
              title: "Exploring the Solar System",
              category: "Science",
              duration: "12 min",
              image: "/solar-system-cartoon.jpg",
              color: "bg-brand-red",
              progress: 45,
            },
            {
              title: "Counting 1 to 10",
              category: "Math",
              duration: "8 min",
              image: "/numbers-cartoon.jpg",
              color: "bg-brand-orange",
              progress: 0,
            },
            {
              title: "Painting a Rainbow",
              category: "Art",
              duration: "15 min",
              image: "/rainbow-art-class.jpg",
              color: "bg-brand-yellow",
              progress: 90,
            },
            {
              title: "Forest Animals",
              category: "Nature",
              duration: "10 min",
              image: "/forest-animals.jpg",
              color: "bg-brand-olive",
              progress: 0,
            },
            {
              title: "Big Dinosaurs",
              category: "History",
              duration: "20 min",
              image: "/dinosaur-cartoon.png",
              color: "bg-brand-red",
              progress: 10,
            },
          ].map((video, i) => (
            <Link href={`/watch/${i + 1}`} key={i} className="group">
              <div className="bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-b-8 border-transparent hover:border-brand-cream h-full flex flex-col">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.image || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-4 shadow-xl transform scale-0 group-hover:scale-100 transition-transform duration-300">
                      <PlayCircle className="h-8 w-8 text-brand-orange" />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-brand-olive flex items-center gap-1 shadow-sm">
                    <Clock className="h-3 w-3" />
                    {video.duration}
                  </div>
                  {video.progress > 0 && (
                    <div className="absolute bottom-0 left-0 w-full h-2 bg-black/20">
                      <div className={`h-full ${video.color}`} style={{ width: `${video.progress}%` }} />
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-black text-white uppercase tracking-wide ${video.color}`}
                    >
                      {video.category}
                    </span>
                  </div>
                  <h3 className="font-black text-xl text-brand-olive mb-2 line-clamp-2 group-hover:text-brand-orange transition-colors">
                    {video.title}
                  </h3>
                  <div className="mt-auto pt-4 flex items-center justify-between text-brand-olive/50 text-sm font-bold">
                    <span>By EduToon Studio</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
