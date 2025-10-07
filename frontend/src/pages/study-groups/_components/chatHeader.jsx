import React, { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  Send,
  Paperclip,
  Users,
  Settings,
  Image,
  File,
  X,
  Download,
  MoreVertical,
  ChevronLeft,
  Info,
  UserPlus,
  Bell,
  Check,
  XCircle,
  Play,
  Square,
  Clock,
  BookOpen,
  History,
  Plus,
  Minus,
  Award,
  Globe,
  Lock
} from "lucide-react";

// Premium Chat Header Component
export const ChatHeader = ({ 
  group, 
  onBack, 
  activeSession, 
  sessionTimer, 
  formatTime, 
  canStartSession, 
  canEndSession, 
  canJoinSession,
  onStartSession,
  onEndSession,
  onJoinSession,
  onShowHistory,
  joinRequests,
  onShowJoinRequests,
  onShowMembers,
  isAdmin 
}) => (
  <div className="relative overflow-hidden rounded-3xl mb-4 group">
    {/* Animated gradient background */}
    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 opacity-90"></div>
    
    {/* Animated overlay patterns */}
    <div className="absolute inset-0 opacity-30">
      <div className="absolute top-0 left-0 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
    </div>

    {/* Glassmorphism effect */}
    <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onBack}
            className="group/btn p-2.5 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5 text-white group-hover/btn:text-white transition-colors" />
          </button>
          
          <div className="flex items-center gap-4">
            {/* Group Avatar with glow effect */}
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-all duration-500">
                <span className="text-xl font-bold text-white">
                  {group?.name?.charAt(0) || 'G'}
                </span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
            </div>
            
            {/* Group Info */}
            <div className="py-1">
              <h2 className="font-bold text-white text-lg tracking-tight drop-shadow-lg">
                {group?.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <Users className="w-3 h-3 text-white/90" />
                  <span className="text-xs font-medium text-white/90">
                    {group?.memberCount || 0}
                  </span>
                </div>
                <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                <span className="text-xs font-medium text-white/90">
                  {group?.module}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Center Section - Session Status */}
        {activeSession && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl shadow-xl shadow-green-500/30 border border-white/30 backdrop-blur-sm">
              <div className="relative flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 bg-white rounded-full animate-ping opacity-75"></div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white tracking-wide">
                  {formatTime(sessionTimer)}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Session Controls */}
          {canStartSession && (
            <button 
              onClick={onStartSession}
              className="group/btn p-2.5 bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/50 hover:scale-110 border border-white/30"
            >
              <Play className="w-5 h-5 text-white fill-white" />
            </button>
          )}

          {canEndSession && (
            <button 
              onClick={onEndSession}
              className="group/btn p-2.5 bg-gradient-to-br from-red-400 to-rose-500 hover:from-red-500 hover:to-rose-600 rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/50 hover:scale-110 border border-white/30"
            >
              <Square className="w-5 h-5 text-white fill-white" />
            </button>
          )}

          {canJoinSession && (
            <button
              onClick={onJoinSession}
              className="px-5 py-2.5 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-300 text-sm shadow-lg hover:shadow-green-500/50 hover:scale-105 border border-white/30"
            >
              <span className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Join Session
              </span>
            </button>
          )}

          {/* Divider */}
          <div className="w-px h-8 bg-white/20 mx-1"></div>

          {/* History Button */}
          <button
            onClick={onShowHistory}
            className="group/btn p-2.5 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:scale-110"
          >
            <History className="w-5 h-5 text-white/90 group-hover/btn:text-white transition-colors" />
          </button>

          {/* Join Requests with notification badge */}
          {isAdmin && joinRequests.length > 0 && (
            <button
              onClick={onShowJoinRequests}
              className="relative group/btn p-2.5 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:scale-110"
            >
              <Bell className="w-5 h-5 text-white/90 group-hover/btn:text-white transition-colors" />
              <div className="absolute -top-1 -right-1">
                <div className="relative flex items-center justify-center">
                  <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-lg">
                    {joinRequests.length}
                  </span>
                  <span className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-50"></span>
                </div>
              </div>
            </button>
          )}
          
          {/* Members Button */}
          <button
            onClick={onShowMembers}
            className="group/btn p-2.5 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:scale-110"
          >
            <Users className="w-5 h-5 text-white/90 group-hover/btn:text-white transition-colors" />
          </button>
        </div>
      </div>
    </div>

    {/* Bottom glow effect */}
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 blur-2xl opacity-50"></div>

    <style>{`
      @keyframes blob {
        0%, 100% { transform: translate(0, 0) scale(1); }
        25% { transform: translate(20px, -20px) scale(1.1); }
        50% { transform: translate(-20px, 20px) scale(0.9); }
        75% { transform: translate(20px, 20px) scale(1.05); }
      }
      
      .animate-blob {
        animation: blob 7s infinite;
      }
      
      .animation-delay-2000 {
        animation-delay: 2s;
      }
      
      .animation-delay-4000 {
        animation-delay: 4s;
      }
    `}</style>
  </div>
);

// Demo Component
export default function App() {
  const [activeSession, setActiveSession] = useState(true);
  const [sessionTimer, setSessionTimer] = useState(3665);
  const [joinRequests, setJoinRequests] = useState([1, 2, 3]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mockGroup = {
    name: "Advanced React Patterns",
    memberCount: 24,
    module: "Web Development"
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <ChatHeader
          group={mockGroup}
          onBack={() => console.log('Back')}
          activeSession={activeSession}
          sessionTimer={sessionTimer}
          formatTime={formatTime}
          canStartSession={!activeSession}
          canEndSession={activeSession}
          canJoinSession={false}
          onStartSession={() => setActiveSession(true)}
          onEndSession={() => setActiveSession(false)}
          onJoinSession={() => console.log('Join')}
          onShowHistory={() => console.log('History')}
          joinRequests={joinRequests}
          onShowJoinRequests={() => console.log('Join Requests')}
          onShowMembers={() => console.log('Members')}
          isAdmin={true}
        />
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Premium Features</h3>
          <ul className="space-y-2 text-gray-600">
            <li>✨ Stunning gradient background with animated blobs</li>
            <li>💎 Glassmorphism effect with backdrop blur</li>
            <li>🎨 Smooth hover animations and transitions</li>
            <li>⚡ Pulsing session indicator with double animation</li>
            <li>🌟 Glowing buttons with shadow effects</li>
            <li>🔔 Animated notification badge</li>
          </ul>
        </div>
      </div>
    </div>
  );
}