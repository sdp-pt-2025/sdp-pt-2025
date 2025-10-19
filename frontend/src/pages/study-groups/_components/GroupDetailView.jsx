import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Users,
  BookOpen,
  Globe,
  Lock,
  Calendar,
  MapPin,
  UserPlus,
  MessageCircle,
  Clock,
  X,
  Check,
  Settings,
  Bell,
  Sparkles
} from "lucide-react";

const GroupDetailView = ({
  group,
  onBack,
  onJoinRequest,
  onEnterChat,
  currentUserId,
  baseUrl
}) => {
  const [joinRequests, setJoinRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  
  const isCreator = group.createdBy === currentUserId;

  useEffect(() => {
    if (isCreator) {
      fetchJoinRequests();
    }
  }, [isCreator]);

  const fetchJoinRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await fetch(
        `${baseUrl}/api/study-groups/${group.id}/join-requests?adminId=${currentUserId}`
      );
      const result = await response.json();

      if (result.success) {
        setJoinRequests(result.data);
      }
    } catch (error) {
      console.error("Error fetching join requests:", error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleRequestResponse = async (requestId, action) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/study-groups/${group.id}/respond-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId,
            action,
            adminId: currentUserId,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        fetchJoinRequests();
        if (action === "approve") {
          group.memberCount += 1;
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
    }
  };

  // Action Button Component
  const getActionButton = () => {
    switch (group.userStatus) {
      case "creator":
        return (
          <button
            onClick={() => onEnterChat(group)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3.5 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2.5 hover:scale-105 transform"
          >
            <MessageCircle className="w-5 h-5" />
            Enter Chat
          </button>
        );
        
      case "member":
        return (
          <button
            onClick={() => onEnterChat(group)}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-8 py-3.5 rounded-2xl font-semibold hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 flex items-center gap-2.5 hover:scale-105 transform"
          >
            <MessageCircle className="w-5 h-5" />
            Enter Chat
          </button>
        );
        
      case "pending":
        return (
          <button
            disabled
            className="bg-gradient-to-r from-amber-500 to-amber-400 text-white px-8 py-3.5 rounded-2xl font-semibold cursor-not-allowed opacity-90 flex items-center gap-2.5 shadow-lg shadow-amber-500/20"
          >
            <Clock className="w-5 h-5 animate-pulse" />
            Request Pending
          </button>
        );
        
      default:
        return (
          <button
            onClick={() => onJoinRequest(group.id)}
            disabled={group.memberCount >= group.maxMembers}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3.5 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2.5 hover:scale-105 transform disabled:transform-none"
          >
            <UserPlus className="w-5 h-5" />
            {group.memberCount >= group.maxMembers ? 'Group Full' : 'Request to Join'}
          </button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
        >
          <ChevronRight className="w-4 h-4 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Groups</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 p-8 md:p-10 border border-blue-100/50">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8 pb-8 border-b border-gray-100">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {group.name}
                </h1>
                {isCreator && (
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Creator</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">{group.module}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
                  {group.isPublic ? (
                    <>
                      <Globe className="w-5 h-5 text-emerald-500" />
                      <span className="text-gray-700 font-medium">Public</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 text-amber-500" />
                      <span className="text-gray-700 font-medium">Private</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              {getActionButton()}
            </div>
          </div>

          {/* Join Requests Section */}
          {isCreator && joinRequests.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/50 rounded-2xl p-6 mb-8 shadow-lg shadow-amber-500/10">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-amber-500 rounded-xl">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-amber-900">
                  Pending Join Requests
                </h2>
                <span className="ml-auto bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {joinRequests.length}
                </span>
              </div>
              
              {loadingRequests ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {joinRequests.map((request) => (
                    <div key={request.id} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-amber-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                            {request.user.photoURL ? (
                              <img 
                                src={request.user.photoURL} 
                                alt={request.user.displayName} 
                                className="w-full h-full rounded-2xl object-cover" 
                              />
                            ) : (
                              <span className="text-white font-bold text-lg">
                                {request.user.displayName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">
                              {request.user.displayName}
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                              {request.user.university} • {request.user.faculty}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(request.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRequestResponse(request.id, "reject")}
                            className="p-3 text-red-600 hover:bg-red-100 rounded-xl transition-all hover:scale-110 transform"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleRequestResponse(request.id, "approve")}
                            className="p-3 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all hover:scale-110 transform"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      {request.message && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                          <p className="text-sm text-gray-700 italic">"{request.message}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description Section */}
          {group.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Group</h2>
              <p className="text-gray-700 leading-relaxed text-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                {group.description}
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all hover:scale-105 transform">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-100 font-semibold uppercase tracking-wide">Members</p>
                  <p className="text-3xl font-bold text-white">
                    {group.memberCount}<span className="text-blue-200">/{group.maxMembers}</span>
                  </p>
                </div>
              </div>
            </div>

            {group.schedule && (
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all hover:scale-105 transform">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-100 font-semibold uppercase tracking-wide">Schedule</p>
                    <p className="text-xl font-bold text-white capitalize">
                      {group.schedule.dayOfWeek}s
                    </p>
                    <p className="text-emerald-100 font-medium">{group.schedule.time}</p>
                  </div>
                </div>
              </div>
            )}

            {group.location && (
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all hover:scale-105 transform">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-100 font-semibold uppercase tracking-wide">Location</p>
                    <p className="text-xl font-bold text-white">
                      {group.location.type ? group.location.type : group.location}
                    </p>
                    {group.location.detail && (
                      <p className="text-purple-100 font-medium text-sm">{group.location.detail}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tags Section */}
          {group.tags && group.tags.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-3">
                {group.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transform transition-all"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Members Section */}
          {group.members && group.members.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-5">
                Members <span className="text-blue-600">({group.members.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-lg hover:scale-102 transform transition-all">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      {member.photoURL ? (
                        <img 
                          src={member.photoURL} 
                          alt={member.displayName} 
                          className="w-full h-full rounded-2xl object-cover" 
                        />
                      ) : (
                        <span className="text-white font-bold text-xl">
                          {member.displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">{member.displayName}</p>
                      {member.yearOfStudy && (
                        <p className="text-sm text-gray-600 font-medium">Year {member.yearOfStudy}</p>
                      )}
                    </div>
                    {group.createdBy === member.uid && (
                      <div className="ml-auto">
                        <span className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs rounded-full font-bold shadow-md">
                          Creator
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetailView;