
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
import { toast } from "react-hot-toast";

// Mock toast for demo


// Header Component
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
  <div className="bg-white sticky border border-gray-200 p-1 flex items-center justify-between rounded-2xl shadow-md shadow-gray-100 mb-1">
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      <div className="py-3">
        <h2 className="font-semibold text-gray-500">{group?.name}</h2>
        <p className="text-sm text-gray-500">
          {group?.memberCount || 0} members • {group?.module}
        </p>
      </div>
    </div>
    
    {/* Session Status */}
    {activeSession && (
      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-green-700 font-medium">
          Session: {formatTime(sessionTimer)}
        </span>
      </div>
    )}
    
    <div className="flex items-center gap-2">
      {/* Session Controls */}
      {canStartSession && (
        <button 
          onClick={onStartSession}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <Play className="w-5 h-5 text-green-600" />
        </button>
      )}

      {canEndSession && (
        <button 
          onClick={onEndSession}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <Square className="w-5 h-5 text-red-600" />
        </button>
      )}

      {canJoinSession && (
        <button
          onClick={onJoinSession}
          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
        >
          Join Session
        </button>
      )}

      {/* Session History */}
      <button
        onClick={onShowHistory}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <History className="w-5 h-5 text-gray-600" />
      </button>

      {isAdmin && joinRequests.length > 0 && (
        <button
          onClick={onShowJoinRequests}
          className="relative p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {joinRequests.length}
          </span>
        </button>
      )}
      
      <button
        onClick={onShowMembers}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <Users className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  </div>
);