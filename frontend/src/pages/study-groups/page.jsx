import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  Users,
  Lock,
  Globe,
  Target,
  Hash,
  Sparkles,
  BookOpen,
  Clock,
  MapPin,
  Calendar,
  Search,
  Filter,
  ChevronRight,
  UserPlus,
  Eye,
  Star
} from "lucide-react";
import Sidebar from "../../components/Sidebar/sidebar";
import { AuthContext } from "../../context/AuthContext";
import { signInWithGoogle } from "../../firebase/auth";
import { auth } from "../../firebase/init";
// import { AuthProvider } from "../../context/useAuthContextUser";

const StudyGroupManager = () => {
  const [view, setView] = useState("browse"); // "browse" | "create" | "group-detail"
  const [studyGroups, setStudyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    moduleCode: "",
    maxMembers: 8,
    isPrivate: false,
    tags: [],
    goals: [],
  });
  const [newTag, setNewTag] = useState("");
  const [newGoal, setNewGoal] = useState("");

  const availableModules = [
    "COMS3012 - COMPUTER GRAPHICS AND VISUALIZATION",
    "COMS3021 - SOFTWARE DESIGN PROJECT",
    "COMS3002 - OPERATING SYSTEMS",
    "COMS3212 - MACHINE LEARNING",
    
  ];

  const popularTags = [
    "exam-prep",
    "assignments",
    "projects",
    "homework",
    "research",
    "lab-work",
  ];

  const BASE_URL = 'http://localhost:3000'

  const {uid, email, displayName} = auth.currentUser;
  



  

  // console.log(userInfo, "The google info========")

  // Fetch study groups
  useEffect(() => {
    fetchStudyGroups();
  }, [searchTerm, selectedModule]);

  

  const fetchStudyGroups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedModule) params.append('module', selectedModule);
      params.append('isPublic', 'true');

      const response = await fetch(`${BASE_URL}/api/study-groups?${params}`);
      const result = await response.json();

      if (result.success) {
        setStudyGroups(result.data.studyGroups);
      } else {
        console.error('Failed to fetch study groups:', result.error);
      }
    } catch (error) {
      console.error('Error fetching study groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/study-groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'current-user-id' 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Successfully requested to join the group!');
        fetchStudyGroups(); // Refresh the list
      } else {
        alert(result.error || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group');
    }
  };

  const fetchGroupDetails = async (groupId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/study-groups/${groupId}`);
      const result = await response.json();

      if (result.success) {
        setSelectedGroup(result.data);
        setView("group-detail");
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
    }
  };

  const filteredGroups = studyGroups.filter(group => {
    const matchesSearch = !searchTerm || 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.topic.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = !selectedModule || group.module === selectedModule;
    
    return matchesSearch && matchesModule;
  });

  // Browse/List View
  if (view === "browse") {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Study Groups</h1>
                <p className="text-gray-600 mt-1">Find your study community</p>
              </div>
              <button
                onClick={() => setView("create")}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Group
              </button>
            </div>

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
                <div className="relative">
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                  >
                    <option value="">All Modules</option>
                    {availableModules.map((module) => (
                      <option key={module} value={module.split(" - ")[0]}>
                        {module}
                      </option>
                    ))}
                  </select>
                  <Filter className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Study Groups Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading study groups...</p>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No study groups found</h3>
                <p className="text-gray-500 mb-6">Be the first to create one!</p>
                <button
                  onClick={() => setView("create")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Create Your First Group
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group) => (
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
                        </div>
                      </div>

                      {/* Description */}
                      {group.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {group.description}
                        </p>
                      )}

                      {/* Members Info */}
                      <div className="flex flex-col items-start gap-4 mb-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{group.memberCount}/{group.maxMembers} members</span>
                        </div>
                        {group.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">
                              {group.location.type === 'online' ? 'Online' : group.location.details}
                            </span>
                          </div>
                        )}
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
                        <button
                          onClick={() => fetchGroupDetails(group.id)}
                          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleJoinGroup(group.id)}
                          disabled={group.memberCount >= group.maxMembers}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          {group.memberCount >= group.maxMembers ? 'Full' : 'Join'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Group Detail View
  if (view === "group-detail" && selectedGroup) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <div className="p-6">
            {/* Back Button */}
            <button
              onClick={() => setView("browse")}
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
                      {selectedGroup.name}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        <span className="font-medium">{selectedGroup.module}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedGroup.isPublic ? (
                          <>
                            <Globe className="w-8 h-8 text-green-500" />
                            <span className="text-gray-900">Public Group</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5 text-orange-500" />
                            <span>Private Group</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinGroup(selectedGroup.id)}
                    disabled={selectedGroup.memberCount >= selectedGroup.maxMembers}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                  >
                    {selectedGroup.memberCount >= selectedGroup.maxMembers ? 'Group Full' : 'Request to Join'}
                  </button>
                </div>

                {/* Description */}
                {selectedGroup.description && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
                    <p className="text-gray-700">{selectedGroup.description}</p>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1  gap-6 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Members</p>
                        <p className="text-lg font-semibold text-blue-800">
                          {selectedGroup.memberCount}/{selectedGroup.maxMembers}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedGroup.schedule && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="text-sm text-green-600 font-medium">Schedule</p>
                          <p className="text-lg font-semibold text-green-800 capitalize">
                            {selectedGroup.schedule.dayOfWeek}s at {selectedGroup.schedule.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedGroup.location && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-6 h-6 text-purple-600" />
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Location</p>
                          <p className="text-lg font-semibold text-purple-800">
                            {selectedGroup.location.type === 'online' ? 'Online' : selectedGroup.location.details}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {selectedGroup.tags && selectedGroup.tags.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {selectedGroup.tags.map((tag) => (
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
                {selectedGroup.members && selectedGroup.members.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Members ({selectedGroup.members.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedGroup.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {member.photoURL ? (
                              <img src={member.photoURL} alt={member.displayName} className="w-full h-full rounded-full object-cover" />
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
                          {selectedGroup.createdBy === member.id && (
                            <div className="ml-auto">
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
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
        </div>
      </div>
    );
  }

  // Create Group Form (existing logic)
  const isFormValid = formData.name.trim() && formData.moduleCode;

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addGoal = () => {
    if (newGoal.trim() && !formData.goals.includes(newGoal.trim())) {
      setFormData((prev) => ({ ...prev, goals: [...prev.goals, newGoal.trim()] }));
      setNewGoal("");
    }
  };

  const removeGoal = (goalToRemove) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.filter((goal) => goal !== goalToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/api/study-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          module: formData.moduleCode,
          topic: formData.topic || '',
          createdBy: uid, 
          createdByName: displayName, 
          maxMembers: formData.maxMembers,
          isPublic: !formData.isPrivate,
          tags: formData.tags,
          location: null, 
          schedule: null ,
          email
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Study group created successfully! 🎉');
        setView("browse");
        setFormData({
          name: "",
          description: "",
          moduleCode: "",
          maxMembers: 8,
          isPrivate: false,
          tags: [],
          goals: [],
        });
        setStep(1);
        fetchStudyGroups(); // Refresh the list
      } else {
        alert(result.error || 'Failed to create study group');
      }
    } catch (error) {
      console.error('Error creating study group:', error);
      alert('Failed to create study group');
    }
  };

  // Create Group View
  if (view === "create") {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex-col min-h-screen bg-gray-50 overflow-y-auto p-6">
          <div className="flex justify-center">
            <div className="w-full max-w-3xl">
              {/* Back Button */}
              <button
                onClick={() => setView("browse")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
              >
                <ChevronRight className="w-4 h-4 transform rotate-180" />
                Back to Groups
              </button>

              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Create Your Study Group
                </h1>
                <p className="text-gray-600 mt-2">
                  Bring together passionate learners and achieve your academic goals.
                </p>
              </div>

              {/* Step Progress */}
              <div className="flex justify-center mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition ${
                        step >= s
                          ? "bg-blue-600 text-white shadow"
                          : "bg-white text-gray-400 border border-gray-300"
                      }`}
                    >
                      {s}
                    </div>
                    {s < 3 && <div className={`w-12 h-0.5 mx-2 ${step > s ? "bg-blue-600" : "bg-gray-300"}`}></div>}
                  </div>
                ))}
              </div>

              {/* Form Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                {/* Step 1 */}
                {step >= 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                      <BookOpen className="w-5 h-5" />
                      Basic Information
                    </div>
                    <div className="space-y-3">
                      <label className="block text-gray-700 font-medium">Group Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Calculus Conquerors"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-gray-700 font-medium">Module</label>
                      <select
                        value={formData.moduleCode}
                        onChange={(e) => setFormData({ ...formData, moduleCode: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                      >
                        <option value="">Select module...</option>
                        {availableModules.map((mod) => (
                          <option key={mod} value={mod.split(" - ")[0]}>
                            {mod}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-gray-700 font-medium">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        placeholder="Describe your group's vision..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition resize-none"
                      />
                    </div>
                    {isFormValid && (
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                      >
                        Continue to Settings
                      </button>
                    )}
                    {!isFormValid && (
                      <div className="text-center text-gray-500 mt-2">Please fill in required fields</div>
                    )}
                  </div>
                )}

                {/* Step 2: Settings */}
                {step >= 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-purple-600 font-semibold">
                      <Users className="w-5 h-5" /> Group Settings
                    </div>
                    <div className="space-y-3">
                      <label className="block text-gray-700 font-medium">Max Members</label>
                      <div className="flex flex-wrap gap-2">
                        {[4, 6, 8, 10, 12].map((num) => (
                          <button
                            key={num}
                            onClick={() => setFormData({ ...formData, maxMembers: num })}
                            className={`px-4 py-2 rounded-xl border font-medium ${
                              formData.maxMembers === num
                                ? "bg-blue-50 border-blue-500 text-blue-700 shadow"
                                : "border-gray-300 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-gray-700 font-medium">Privacy</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="privacy"
                            checked={!formData.isPrivate}
                            onChange={() => setFormData({ ...formData, isPrivate: false })}
                            className="sr-only"
                          />
                          <div
                            className={`px-4 py-3 rounded-xl border w-full text-center ${
                              !formData.isPrivate
                                ? "bg-green-50 border-green-500 text-green-700"
                                : "border-gray-300 text-gray-500"
                            }`}
                          >
                            Public
                          </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="privacy"
                            checked={formData.isPrivate}
                            onChange={() => setFormData({ ...formData, isPrivate: true })}
                            className="sr-only"
                          />
                          <div
                            className={`px-4 py-3 rounded-xl border w-full text-center ${
                              formData.isPrivate
                                ? "bg-orange-50 border-orange-500 text-orange-700"
                                : "border-gray-300 text-gray-500"
                            }`}
                          >
                            Private
                          </div>
                        </label>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
                    >
                      Continue to Personalization
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full py-2 text-gray-500 hover:text-gray-700 underline"
                    >
                      ← Back
                    </button>
                  </div>
                )}

                {/* Step 3: Tags & Goals */}
                {step >= 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                      <Hash className="w-5 h-5" /> Personalization
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {popularTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              if (!formData.tags.includes(tag)) {
                                setFormData({ ...formData, tags: [...formData.tags, tag] });
                              }
                            }}
                            className={`px-3 py-1 rounded-full border text-sm font-medium ${
                              formData.tags.includes(tag)
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-300 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Custom tag..."
                          className="flex-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 transition"
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          disabled={!newTag.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>

                      {/* Show selected tags */}
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.tags.map((tag) => (
                            <div
                              key={tag}
                              className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                            >
                              #{tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="hover:text-blue-900"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Goals */}
                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium">Goals (Optional)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newGoal}
                          onChange={(e) => setNewGoal(e.target.value)}
                          placeholder="e.g., Complete midterm revision"
                          className="flex-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 transition"
                        />
                        <button
                          type="button"
                          onClick={addGoal}
                          disabled={!newGoal.trim()}
                          className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>
                      <div className="space-y-1 mt-2">
                        {formData.goals.map((goal, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-200"
                          >
                            <span>{goal}</span>
                            <button onClick={() => removeGoal(goal)}>
                              <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition"
                    >
                      Launch Your Study Group
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full py-2 text-gray-500 hover:text-gray-700 underline"
                    >
                      ← Back
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default StudyGroupManager;