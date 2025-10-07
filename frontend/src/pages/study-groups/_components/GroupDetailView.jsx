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
  CheckCircle,
  Clock,
  X,
  Check,
  Settings,
  Bell
} from "lucide-react";
import { toast } from "sonner";

const GroupDetailView = ({
  group,
  onBack,
  onJoinRequest,
  onEnterChat,
  currentUserId,
  baseUrl
}) => {
  // console.log(group)
  const [joinRequests, setJoinRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  // console.log(group)
  

  const isCreator = group.createdBy === currentUserId;
//   const isMember = group.userStatus === "member" || group.userStatus === "creator";

  useEffect(() => {
    
    if (isCreator) {
      fetchJoinRequests();
    }
  }, [isCreator]);

  const fetchJoinRequests = async () => {
    // console.log(group)
    try {
      setLoadingRequests(true);
      const response = await fetch(
        `${baseUrl}/api/study-groups/${group.id}/join-requests?adminId=${currentUserId}`
      );
      const result = await response.json();

      if (result.success) {
        setJoinRequests(result.data);
      } else {
        console.error("Failed to fetch join requests:", result.error);
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
        toast.success(`Request ${action}d successfully!`);
        fetchJoinRequests(); // Refresh requests
        
        if (action === "approve") {
          group.memberCount += 1;
        }
      } else {
        toast.error(result.error || `Failed to ${action} request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Failed to ${action} request`);
    }
  };

  const getActionButton = () => {
    switch (group.userStatus) {
      case "creator":
        return (
          <button
            onClick={() => onEnterChat(group)}
            className="bg-purple-600! text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700! transition flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Enter Chat
          </button>
        );
        
      case "member":
        return (
          <button
            onClick={() => onEnterChat(group)}
            className="bg-green-600! text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700! transition flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Enter Chat
          </button>
        );
        
      case "pending":
        return (
          <button
            disabled
            className="bg-yellow-500! text-white px-6 py-3 rounded-xl font-semibold cursor-not-allowed opacity-75 flex items-center gap-2"
          >
            <Clock className="w-5 h-5" />
            Request Pending
          </button>
        );
        
      default:
        return (
          <button
            onClick={() => onJoinRequest(group.id)}
            disabled={group.memberCount >= group.maxMembers}
            className="bg-blue-600! text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700! disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            {group.memberCount >= group.maxMembers ? 'Group Full' : 'Request to Join'}
          </button>
        );
    }
  };

  return (
    <>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ChevronRight className="w-4 h-4 transform rotate-180" />
        Back to Groups
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {group.name}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">{group.module}</span>
                </div>
                <div className="flex items-center gap-2">
                  {group.isPublic ? (
                    <>
                      <Globe className="w-5 h-5 text-green-500!" />
                      <span className="text-gray-900">Public Group</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 text-orange-500" />
                      <span>Private Group</span>
                    </>
                  )}
                </div>
                {isCreator && (
                  <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    <Settings className="w-4 h-4" />
                    <span>Your Group</span>
                  </div>
                )}
              </div>
            </div>
            {getActionButton()}
          </div>

          
          {isCreator && joinRequests.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-orange-900">
                  Pending Join Requests ({joinRequests.length})
                </h2>
              </div>
              
              {loadingRequests ? (
                <div className="text-center py-4">
                  <div className="animate-spin w-6 h-6 border-4 border-orange-600 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {joinRequests.map((request) => (
                    <div key={request.id} className="bg-white rounded-lg p-4 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {request.user.photoURL ? (
                              <img 
                                src={request.user.photoURL} 
                                alt={request.user.displayName} 
                                className="w-full h-full rounded-full object-cover" 
                              />
                            ) : (
                              <span className="text-blue-600 font-semibold">
                                {request.user.displayName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {request.user.displayName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {request.user.university} • {request.user.faculty}
                            </p>
                            <p className="text-xs text-gray-400">
                              Requested {new Date(request.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRequestResponse(request.id, "reject")}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleRequestResponse(request.id, "approve")}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      {request.message && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">{request.message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {group.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-gray-700">{group.description}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Members</p>
                  <p className="text-lg font-semibold text-blue-800">
                    {group.memberCount}/{group.maxMembers}
                  </p>
                </div>
              </div>
            </div>

            {group.schedule && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Schedule</p>
                    <p className="text-lg font-semibold text-green-800 capitalize">
                      {group.schedule.dayOfWeek}s at {group.schedule.time}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {group.location && (
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Location</p>
                    <p className="text-lg font-semibold text-purple-800">
                      {group.location.type ? group.location.type : group.location}
                      {group.location.detail && group.location.detail}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {group.tags && group.tags.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {group.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Members */}
          {group.members && group.members.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Members ({group.members.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {member.photoURL ? (
                        <img 
                          src={member.photoURL} 
                          alt={member.displayName} 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        <span className="text-blue-600 font-semibold">
                          {member.displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.displayName}</p>
                      {member.yearOfStudy && (
                        <p className="text-sm text-gray-500">Year {member.yearOfStudy}</p>
                      )}
                    </div>
                    {group.createdBy === member.uid && (
                      <div className="ml-auto">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
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
    </>
  );
};

export default GroupDetailView;