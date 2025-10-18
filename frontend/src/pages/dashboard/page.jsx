import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Users, Calendar, BookOpen, Target, TrendingUp, Star, ChevronLeft, ChevronRight, Loader, AlertCircle } from 'lucide-react';
import { auth } from '../../firebase/init';
import Sidebar from '../../components/Sidebar/sidebar';
import { useUserData } from '../../hooks/useUserData';
import WeatherCard from '../../components/WeatherCard/WeatherCard';
import WeatherMap from '../../components/WeatherMap/WeatherMap';
import useWeather from '../../hooks/useWeather';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());


  const { userData } = useUserData();
  const { weatherData } = useWeather();
  
  // console.log(userData, "-------------------------")
  const BASE_URL = import.meta.env.VITE_PUBLIC_URL;

  
  const fetchDashboardData = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/api/dashboard?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    
    if (userData?.uid) {
      fetchDashboardData(userData.uid);
    } else if (userData === null) {
     
      setLoading(false);
      setError('User not authenticated');
    }
    
  }, [userData?.uid]); 

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + direction);
      return newDate;
    });
  };


  if (loading || userData === undefined) {
    return (
      <div className='flex h-screen'>
        <Sidebar/>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center w-full">
          <div className="flex flex-col items-center space-y-3 text-blue-600">
            <Loader className="w-8 h-8 animate-spin" />
            <span className="text-3xl font-bold animate-pulse">
              {userData === undefined ? 'Loading...' : 'Dashboard'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if user is not authenticated or there's an error
  if (error || userData === null) {
    return (
      <div className='flex h-screen'>
        <Sidebar/>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center w-full">
          <div className="flex flex-col items-center space-y-3 text-red-600">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xl font-bold">
              {userData === null ? 'Please log in to view dashboard' : error}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
 
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
 
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      days.push(
        <div
          key={day}
          className={`p-2 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors ${
            isToday ? 'bg-blue-600 text-white font-semibold' : 'text-gray-700 hover:text-blue-600'
          }`}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  const stats = dashboardData?.stats || {};
  const recentSessions = dashboardData?.recentSessions || [];
  const upcomingSessions = dashboardData?.upcomingSessions || [];
  const progressData = dashboardData?.progress || {};
  const recentActivity = dashboardData?.recentActivity || [];

  return (
    <div className="flex h-screen">
        <Sidebar/>
      <main className="flex-1 p-4 sm:p-6 bg-slate-100 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Dashboard</h1>
              <p className="text-slate-600 mt-1">Welcome back, {dashboardData?.user?.displayName || userData?.displayName || 'User'}</p>
            </div>
          </div>
        
          <div className="bg-gray-50 rounded-4xl p-4 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Stats Overview</h2>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           
              <div className="rounded-4xl bg-blue-600 p-4 sm:p-6 flex flex-col justify-center gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-semibold text-sm">Total Study Time</h4>
                  <Clock className="text-white w-5 h-5" />
                </div>
                <h4 className="text-white font-bold text-2xl">
                  {formatTime(stats.totalStudyTime || 0)}
                </h4>
              </div>

              {/* Completed Topics Card */}
              <div className="rounded-4xl bg-blue-600 p-4 sm:p-6 flex flex-col justify-center gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-semibold text-sm">Progress Records</h4>
                  <CheckCircle className="text-white w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-2xl">
                    {stats.completedTopics || 0} <span className="text-sm font-normal opacity-75">completed</span>
                  </h4>
                  <div className="text-white text-sm opacity-75">
                    {stats.inProgressTopics || 0} in progress
                  </div>
                </div>
              </div>

              {/* Study Groups Card */}
              <div className="rounded-4xl bg-blue-600 p-4 sm:p-6 flex flex-col justify-center gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-semibold text-sm">Study Groups</h4>
                  <Users className="text-white w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-2xl">{stats.totalGroups || 0}</h4>
                  <div className="text-white text-sm opacity-75">
                    {stats.groupsCreated || 0} created by you
                  </div>
                </div>
              </div>

              {/* Study Sessions Card */}
              <div className="rounded-4xl bg-blue-600 p-4 sm:p-6 flex flex-col justify-center gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-semibold text-sm">Study Sessions</h4>
                  <Calendar className="text-white w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-2xl">{stats.totalSessions || 0}</h4>
                  <div className="text-white text-sm opacity-75">
                    {stats.completedSessions || 0} completed
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeatherCard />
            <WeatherMap weatherData={weatherData} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Activity Card */}
            <div className="xl:col-span-2 bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      {activity.type === 'study_session' && <Clock className="w-5 h-5 text-blue-600" />}
                      {activity.type === 'group_join' && <Users className="w-5 h-5 text-green-600" />}
                      {activity.type === 'progress_update' && <CheckCircle className="w-5 h-5 text-purple-600" />}
                      {activity.type === 'group_create' && <Star className="w-5 h-5 text-orange-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{activity.title}</div>
                      <div className="text-sm text-slate-500">{activity.description}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {formatDate(activity.createdAt)}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No recent activity yet</p>
                    <p className="text-sm">Start studying to see your activity here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Calendar Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Calendar</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <span className="font-medium text-slate-800 min-w-[140px] text-center">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-slate-500">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {generateCalendar()}
              </div>
            </div>
          </div>

          {/* Progress and Upcoming Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* This Week's Progress Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Module Progress</h3>
              <div className="space-y-4">
                {progressData.modules && progressData.modules.length > 0 ? progressData.modules.map((module, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 font-medium">{module.module}</span>
                      <span className="text-slate-800 font-medium">{module.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{width: `${module.completionPercentage}%`}}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {formatTime(module.studyHours * 60)} studied
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate-500">
                    <Target className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No progress tracked yet</p>
                    <p className="text-sm">Complete study sessions to see progress</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Study Sessions Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Study Sessions</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {upcomingSessions.length > 0 ? upcomingSessions.map((session, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">{session.topic}</h4>
                        <p className="text-sm text-slate-600">{session.module}</p>
                        <div className="flex items-center mt-2 text-sm text-slate-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(session.startTime)}
                        </div>
                        <div className="flex items-center text-sm text-slate-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {Math.floor(session.duration / 60)}h {session.duration % 60}m
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        session.sessionType === 'group' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {session.sessionType}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No upcoming sessions</p>
                    <p className="text-sm">Schedule a study session to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          {/* <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 flex flex-col justify-center items-center bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                <Clock className="w-6 h-6 text-blue-600 mb-2" />
                <div className="font-medium text-slate-800">Start Study Session</div>
              </button>
              <button className="p-4 flex flex-col justify-center items-center bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                <div className="font-medium text-slate-800">Update Progress</div>
              </button>
              <button className="p-4 flex flex-col justify-center items-center bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
                <Users className="w-6 h-6 text-purple-600 mb-2" />
                <div className="font-medium text-slate-800">Find Study Group</div>
              </button>
              <button className="p-4 flex flex-col justify-center items-center bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
                <TrendingUp className="w-6 h-6 text-orange-600 mb-2" />
                <div className="font-medium text-slate-800">View Analytics</div>
              </button>
            </div>
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;