
import Sidebar from "../../components/Sidebar/sidebar";
import { Clock, CheckCircle, Users, Calendar } from "lucide-react";

export default function Dashboard() {
    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar />

            <main className="flex-1 p-4 sm:p-6 bg-slate-100 overflow-y-auto">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Dashboard</h1>
                        
                    </div>
                
                    <div className="bg-gray-50 rounded-4xl p-4 space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800">Stats Overview</h2>

                        {/* Stats Cards Grid - Mobile First */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Hours Studied Card */}
                            <div className="rounded-4xl bg-blue-600 p-4 sm:p-6 flex flex-col justify-center gap-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-white font-semibold text-sm">Hours Studied</h4>
                                    <Clock className="text-white w-5 h-5" />
                                </div>
                                <h4 className="text-white font-bold text-2xl">13h 47m</h4>
                            </div>

                            {/* Topics Completed Card */}
                            <div className="rounded-4xl bg-blue-600 p-4 sm:p-6 flex flex-col justify-center gap-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-white font-semibold text-sm">Topics Completed</h4>
                                    <CheckCircle className="text-white w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-white font-bold text-2xl">6 <span className="text-sm font-normal opacity-75">completed</span></h4>
                                    <div className="text-white text-sm opacity-75">2 pending</div>
                                </div>
                            </div>

                            {/* Active Study Groups Card */}
                            <div className="rounded-4xl bg-blue-600 p-4 sm:p-6 flex flex-col justify-center gap-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-white font-semibold text-sm">Active Study Groups</h4>
                                    <Users className="text-white w-5 h-5" />
                                </div>
                                <h4 className="text-white font-bold text-2xl">3</h4>
                            </div>

                            {/* Next Study Sessions Card */}
                            <div className="rounded-4xl bg-blue-600 p-4 sm:p-6 flex flex-col justify-center gap-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-white font-semibold text-sm">Next Study Sessions</h4>
                                    <Calendar className="text-white w-5 h-5" />
                                </div>
                                <div className="space-y-2">
                                    <div className="text-white">
                                        <div className="font-bold text-lg">Thu 4 Sep</div>
                                        <div className="text-sm opacity-75">18H00</div>
                                    </div>
                                    <div className="text-white">
                                        <div className="font-bold text-lg">Mon 8 Sep</div>
                                        <div className="text-sm opacity-75">18H00</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Activity Card */}
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                                <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                    <div>
                                        <div className="font-medium text-slate-800">Completed: Advanced Calculus</div>
                                        <div className="text-sm text-slate-500">2 hours ago</div>
                                    </div>
                                </div>
                                <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                                    <Users className="w-5 h-5 text-blue-500 mr-3" />
                                    <div>
                                        <div className="font-medium text-slate-800">Joined Physics Study Group</div>
                                        <div className="text-sm text-slate-500">1 day ago</div>
                                    </div>
                                </div>
                                <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                                    <Clock className="w-5 h-5 text-orange-500 mr-3" />
                                    <div>
                                        <div className="font-medium text-slate-800">Studied for 3h 15m</div>
                                        <div className="text-sm text-slate-500">2 days ago</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Overview Card */}
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">This Week's Progress</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600">Study Time Goal</span>
                                        <span className="text-slate-800 font-medium">13h 47m / 15h</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '92%'}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600">Topics Completed</span>
                                        <span className="text-slate-800 font-medium">6 / 8</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600">Group Sessions</span>
                                        <span className="text-slate-800 font-medium">5 / 6</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-purple-500 h-2 rounded-full" style={{width: '83%'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Section */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button className="p-4 flex flex-col justify-center items-center bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 ">
                                <Clock className="w-6 h-6 text-blue-600 mb-2 text-center" />
                                <div className="font-medium text-slate-800">Start Study Session</div>
                            </button>
                            <button className="p-4 flex flex-col justify-center items-center bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                                <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                                <div className="font-medium text-slate-800">Mark Topic Complete</div>
                            </button>
                            <button className="p-4 flex flex-col justify-center items-center bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
                                <Users className="w-6 h-6 text-purple-600 mb-2" />
                                <div className="font-medium text-slate-800">Join Study Group</div>
                            </button>
                            <button className="p-4 flex flex-col justify-center items-center bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
                                <Calendar className="w-6 h-6 text-orange-600 mb-2" />
                                <div className="font-medium text-slate-800">Schedule Session</div>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}