import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Clock, Shield, Settings, Plus, User, Play, LogOut } from "lucide-react"
import Link from "next/link"

export default function ParentDashboard() {
  return (
    <div className="min-h-screen bg-[#FFF9F0] flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r-2 border-brand-cream hidden lg:block shadow-sm">
        <div className="h-24 flex items-center px-8 border-b-2 border-brand-cream">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 transition-transform group-hover:rotate-12">
              <img
                src="/images/desain-20tanpa-20judul-20-286-29.png"
                alt="EduToon Logo"
                className="object-contain w-full h-full"
              />
            </div>
            <span className="text-xl font-black tracking-tight text-brand-olive">
              EduToon <span className="text-brand-orange">Parent</span>
            </span>
          </Link>
        </div>
        <nav className="p-6 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start bg-brand-cream/30 text-brand-olive font-black h-12 text-base"
          >
            <BarChart3 className="mr-3 h-5 w-5 text-brand-orange" />
            Summary
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-500 hover:text-brand-olive hover:bg-brand-cream/20 font-bold h-12 text-base"
          >
            <User className="mr-3 h-5 w-5" />
            Child Profile
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-500 hover:text-brand-olive hover:bg-brand-cream/20 font-bold h-12 text-base"
          >
            <Shield className="mr-3 h-5 w-5" />
            Security & Filters
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-500 hover:text-brand-olive hover:bg-brand-cream/20 font-bold h-12 text-base"
          >
            <Settings className="mr-3 h-5 w-5" />
            Account Settings
          </Button>

          <div className="pt-8 mt-8 border-t border-brand-cream">
            <Button
              variant="ghost"
              className="w-full justify-start text-brand-red hover:bg-red-50 font-bold h-12 text-base"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-brand-olive mb-2">Parent Dashboard</h1>
            <p className="text-gray-500 font-medium text-lg">Easily monitor your children's learning activities.</p>
          </div>
          <Button className="bg-brand-olive text-white hover:bg-brand-olive/90 h-12 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <Plus className="mr-2 h-5 w-5" />
            Add Child Profile
          </Button>
        </div>

        {/* Children Profiles Section */}
        <div className="mb-10">
          <h2 className="text-xl font-black text-brand-olive mb-4">Child Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-none shadow-md hover:shadow-lg transition-all cursor-pointer group bg-white rounded-[2rem] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-10 rotate-12 translate-x-8 -translate-y-8">
                <img src="/images/new-sun-cloud.png" alt="" className="w-full h-full object-contain" />
              </div>
              <CardContent className="p-6 flex items-center gap-4 relative z-10">
                <div className="h-20 w-20 rounded-full bg-brand-orange/10 p-2 border-4 border-brand-orange/20 group-hover:border-brand-orange transition-colors">
                  <img
                    src="/images/new-boy-reading.png"
                    alt="Budi"
                    className="w-full h-full object-contain transform group-hover:scale-110 transition-transform"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-black text-brand-olive">Budi</h3>
                  <p className="text-sm font-bold text-gray-400">Age 8 Years</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-[70%] bg-brand-orange rounded-full" />
                    </div>
                    <span className="text-xs font-bold text-brand-orange">Lvl 5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-all cursor-pointer group bg-white rounded-[2rem] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-10 rotate-12 translate-x-8 -translate-y-8">
                <img src="/images/new-clouds.png" alt="" className="w-full h-full object-contain" />
              </div>
              <CardContent className="p-6 flex items-center gap-4 relative z-10">
                <div className="h-20 w-20 rounded-full bg-brand-red/10 p-2 border-4 border-brand-red/20 group-hover:border-brand-red transition-colors">
                  <img
                    src="/images/new-fairy.png"
                    alt="Siti"
                    className="w-full h-full object-contain transform group-hover:scale-110 transition-transform"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-black text-brand-olive">Siti</h3>
                  <p className="text-sm font-bold text-gray-400">Age 6 Years</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-[40%] bg-brand-red rounded-full" />
                    </div>
                    <span className="text-xs font-bold text-brand-red">Lvl 3</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-brand-cream shadow-sm hover:shadow-md transition-all cursor-pointer group bg-transparent rounded-[2rem] hover:bg-white/50">
              <CardContent className="p-6 flex items-center justify-center h-full">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-brand-cream/50 flex items-center justify-center mb-2 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                    <Plus className="h-6 w-6 text-brand-olive/50 group-hover:text-white" />
                  </div>
                  <span className="font-bold text-brand-olive/50 group-hover:text-brand-olive">Add Profile</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-10">
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow rounded-[2rem] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-brand-orange/10 pt-6 px-6">
              <CardTitle className="text-base font-bold text-brand-olive">Total Learning Time</CardTitle>
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Clock className="h-5 w-5 text-brand-orange" />
              </div>
            </CardHeader>
            <CardContent className="bg-brand-orange/10 pb-6 px-6">
              <div className="text-4xl font-black text-brand-orange mb-1">12.5 Hrs</div>
              <p className="text-sm font-bold text-brand-olive/60">+2 hrs from last week</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow rounded-[2rem] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-brand-red/10 pt-6 px-6">
              <CardTitle className="text-base font-bold text-brand-olive">Quizzes Completed</CardTitle>
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Shield className="h-5 w-5 text-brand-red" />
              </div>
            </CardHeader>
            <CardContent className="bg-brand-red/10 pb-6 px-6">
              <div className="text-4xl font-black text-brand-red mb-1">45 Quizzes</div>
              <p className="text-sm font-bold text-brand-olive/60">Avg. Accuracy 85%</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow rounded-[2rem] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-brand-yellow/10 pt-6 px-6">
              <CardTitle className="text-base font-bold text-brand-olive">Favorite Subject</CardTitle>
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <BarChart3 className="h-5 w-5 text-brand-yellow" />
              </div>
            </CardHeader>
            <CardContent className="bg-brand-yellow/10 pb-6 px-6">
              <div className="text-4xl font-black text-brand-yellow mb-1">Science</div>
              <p className="text-sm font-bold text-brand-olive/60">60% of total watch time</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-2xl border border-brand-cream h-auto shadow-sm">
            <TabsTrigger
              value="activity"
              className="rounded-xl px-6 py-3 text-sm font-bold data-[state=active]:bg-brand-orange data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              Recent Activity
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="rounded-xl px-6 py-3 text-sm font-bold data-[state=active]:bg-brand-orange data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              Learning Progress
            </TabsTrigger>
          </TabsList>
          <TabsContent value="activity" className="space-y-4">
            <Card className="border-none shadow-lg rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100 px-8 py-6">
                <CardTitle className="text-xl font-black text-brand-olive">Watch History</CardTitle>
              </CardHeader>
              <CardContent className="bg-white p-0">
                <div className="divide-y divide-gray-100">
                  {[
                    {
                      title: "Exploring the Solar System",
                      time: "Just now",
                      score: "100%",
                      status: "Completed",
                      color: "text-green-600 bg-green-50 border-green-100",
                      iconColor: "text-green-600",
                    },
                    {
                      title: "Learn Counting 1-10",
                      time: "2 hours ago",
                      score: "-",
                      status: "Watching",
                      color: "text-brand-orange bg-orange-50 border-orange-100",
                      iconColor: "text-brand-orange",
                    },
                    {
                      title: "Forest Animals",
                      time: "Yesterday",
                      score: "80%",
                      status: "Completed",
                      color: "text-green-600 bg-green-50 border-green-100",
                      iconColor: "text-green-600",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center p-6 hover:bg-gray-50 transition-colors">
                      <div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center border-2 ${item.color.split(" ")[2]} ${item.color.split(" ")[1]}`}
                      >
                        <Play className={`h-5 w-5 ${item.iconColor} fill-current`} />
                      </div>
                      <div className="ml-5 space-y-1">
                        <p className="text-lg font-bold text-gray-900 leading-none">{item.title}</p>
                        <p className="text-sm font-medium text-gray-400">{item.time}</p>
                      </div>
                      <div className="ml-auto font-bold text-sm flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-full border ${item.color}`}>{item.status}</span>
                        {item.score !== "-" && (
                          <span className="text-gray-400 bg-gray-100 px-3 py-2 rounded-full">Score: {item.score}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
