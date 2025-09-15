import React from "react";
import {
  Users,
  Lock,
  Globe,
  BookOpen,
  MapPin,
  Calendar,
  Search,
  Filter,
  UserPlus,
  Eye,
  MessageCircle,
  CheckCircle,
  Clock,
  Settings,
  User
} from "lucide-react";

const StudyGroupsList = ({
  studyGroups,
  loading,
  searchTerm,
  setSearchTerm,
  selectedModule,
  setSelectedModule,
  availableModules,
  onJoinRequest,
  onViewGroup,
  onEnterChat,
//   currentUserId
}) => {
  const filteredGroups = studyGroups.filter(group => {
    const matchesSearch = !searchTerm || 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.topic.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = !selectedModule || group.module === selectedModule;
    
    return matchesSearch && matchesModule;
  });

  const getButtonConfig = (group) => {
    switch (group.userStatus) {
      case "creator":
        return {
            secondary: {
            text: "Manage",
            icon: Settings,
            onClick: () => onViewGroup(group.id),
            className: "bg-purple-600 hover:bg-purple-700 text-white"
          },
          primary: {
            text: "Enter",
            icon: MessageCircle,
            onClick: () => onEnterChat(group),
            className: "bg-gray-100! hover:bg-gray-200! text-gray-700!"
          }
        };
        
      case "member":
        return {
          primary: {
            text: "Member - Enter",
            icon: CheckCircle,
            onClick: () => onEnterChat(group),
            className: "bg-green-600! hover:bg-green-700! text-white"
          },
          secondary: {
            text: "View",
            icon: Eye,
            onClick: () => onViewGroup(group.id),
            className: "bg-gray-100! hover:bg-gray-200! text-gray-700"
          }
        };
        
      case "pending":
        return {
          primary: {
            text: "Pending",
            icon: Clock,
            onClick: null,
            className: "bg-yellow-500! text-white cursor-not-allowed opacity-75"
          },
          secondary: {
            text: "View",
            icon: Eye,
            onClick: () => onViewGroup(group.id),
            className: "bg-gray-100! hover:bg-gray-200! text-gray-700"
          }
        };
        
      default: // not_member
        return {
          primary: {
            text: group.memberCount >= group.maxMembers ? 'Full' : 'Request Join',
            icon: UserPlus,
            onClick: group.memberCount >= group.maxMembers ? null : () => onJoinRequest(group.id),
            className: group.memberCount >= group.maxMembers 
              ? "bg-gray-300! text-gray-500! cursor-not-allowed"
              : "bg-blue-600! hover:bg-blue-700! text-white"
          },
          secondary: {
            text: "View",
            icon: Eye,
            onClick: () => onViewGroup(group.id),
            className: "bg-gray-100! hover:bg-gray-200! text-gray-700"
          }
        };
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading study groups...</p>
      </div>
    );
  }

  return (
    <>
      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search groups, modules, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
            />
          </div>
          <div className="relative w-full max-w-xs">
  <select
    value={selectedModule}
    onChange={(e) => setSelectedModule(e.target.value)}
    className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm sm:text-base"
  >
    <option value="">All Modules</option>
    {availableModules.map((module) => (
      <option key={module} value={module.split(" - ")[0]} className="mt-10 pt-10 absolute">
        {module}
      </option>
    ))}
  </select>
  <Filter className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
</div>

        </div>
      </div>

      {/* Study Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No study groups found</h3>
          <p className="text-gray-500 mb-6">Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => {
            // console.log(group)
            const buttonConfig = getButtonConfig(group);
            
            return (
              <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
                        {group.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        <span className="font-medium">{group.module}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {group.isPublic ? (
                        <Globe className="w-4 h-4 text-green-500" />
                      ) : (
                        <Lock className="w-4 h-4 text-orange-500" />
                      )}
                      {group.userStatus === "creator" && (
                        <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                          Creator
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {group.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {group.description}
                    </p>
                  )}

                  {/* Members Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{group.memberCount}/{group.maxMembers} members</span>
                    </div>

                    
                    
                    {group.userStatus === "creator" && group.pendingRequestsCount > 0 && (
                      <div className="flex items-center gap-1 text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        <span>{group.pendingRequestsCount} pending</span>
                      </div>
                    )}
                  </div>

                  {group.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">
                        {group.location.type ? group.location.type : ""}
                        { " "}
                        {group.location.details ? group.location.details : group.location}
                      </span>
                    </div>
                  )}

<div className="flex items-center gap-1 text-sm font-bold text-gray-600 mb-4">
                      <User className="w-4 h-4"/>
                      <span className="text-blue-500!"> created by {group.createdByName}</span>
                    </div>

                  {/* Schedule */}
                  {group.schedule && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {group.schedule.frequency} on {group.schedule.dayOfWeek}s at {group.schedule.time}
                      </span>
                    </div>
                  )}

                  {/* Tags */}
                  {group.tags && group.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {group.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                      {group.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                          +{group.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    {/* <button
                      onClick={buttonConfig.secondary.onClick}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${buttonConfig.secondary.className}`}
                    >
                      <buttonConfig.secondary.icon className="w-4 h-4" />
                      {buttonConfig.secondary.text}
                    </button> */}
                    <button
                      onClick={buttonConfig.primary.onClick}
                      disabled={!buttonConfig.primary.onClick}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${buttonConfig.primary.className}`}
                    >
                      <buttonConfig.primary.icon className="w-4 h-4" />
                      {buttonConfig.primary.text}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default StudyGroupsList;