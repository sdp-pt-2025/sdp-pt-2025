

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import Sidebar from "../../components/Sidebar/sidebar";
import { auth } from "../../firebase/init";
import StudyGroupsList from "./_components/StudyGroupsList";
import CreateGroupForm from "./_components/CreateGroupForm";
import GroupDetailView from "./_components/GroupDetailView";
import GroupChatView from "./_components/GroupChatView";

const StudyGroupManager = () => {
  const [view, setView] = useState("browse"); // "browse" | "create" | "group-detail" | "group-chat"
  const [studyGroups, setStudyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);

  const BASE_URL = 'http://localhost:8080';
  const { uid, email, displayName } = auth.currentUser;

  const availableModules = [
    "COMS3012 - COMPUTER GRAPHICS AND VISUALIZATION",
    "COMS3021 - SOFTWARE DESIGN PROJECT",
    "COMS3002 - OPERATING SYSTEMS",
    "COMS3212 - MACHINE LEARNING",
  ];

  // Fetch study groups with user status
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
      params.append('userId', uid); // Pass user ID to get status

      const response = await fetch(`${BASE_URL}/api/study-groups?${params}`);
      const result = await response.json();

      if (result.success) {
        setStudyGroups(result.data.studyGroups);
      } else {
        console.error('Failed to fetch study groups:', result.error);
        toast.error("Failed to fetch study groups");
      }
    } catch (error) {
      console.error('Error fetching study groups:', error);
      toast.error("Error fetching study groups");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (groupId) => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/study-groups/${groupId}/request-join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: uid,
          message: "" // Could add a message input later
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Join request sent successfully!', { duration: 4000 });
        fetchStudyGroups(); // Refresh the list
      } else {
        toast.error(result.error || 'Failed to send join request');
      }
    } catch (error) {
      console.error('Error sending join request:', error);
      toast.error('Failed to send join request');
    } finally {
      setLoading(false);
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
      toast.error('Error fetching group details');
    }
  };

  const enterGroupChat = (group) => {
    setSelectedGroup(group);
    setView("group-chat");
  };

  const handleCreateGroup = () => {
    setView("create");
  };

  const handleGroupCreated = () => {
    setView("browse");
    fetchStudyGroups();
  };

  // Navigation helpers
  const goBack = () => {
    if (view === "group-chat") {
      setView("group-detail");
    } else {
      setView("browse");
      setSelectedGroup(null);
    }
  };

  // Render different views
  const renderCurrentView = () => {
    switch (view) {
      case "browse":
        return (
          <StudyGroupsList
            studyGroups={studyGroups}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedModule={selectedModule}
            setSelectedModule={setSelectedModule}
            availableModules={availableModules}
            onJoinRequest={handleJoinRequest}
            onViewGroup={fetchGroupDetails}
            onEnterChat={enterGroupChat}
            currentUserId={uid}
          />
        );
        
      case "create":
        return (
          <CreateGroupForm
            availableModules={availableModules}
            onBack={goBack}
            onGroupCreated={handleGroupCreated}
            currentUser={{ uid, email, displayName }}
            baseUrl={BASE_URL}
          />
        );
        
      case "group-detail":
        return (
          <GroupDetailView
            group={selectedGroup}
            onBack={goBack}
            onJoinRequest={handleJoinRequest}
            onEnterChat={enterGroupChat}
            currentUserId={uid}
            baseUrl={BASE_URL}
          />
        );
        
      case "group-chat":
        return (
          <GroupChatView
            group={selectedGroup}
            onBack={goBack}
            currentUser={{ uid, displayName }}
            baseUrl={BASE_URL}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="p-6">
          {view === "browse" && (
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Study Groups</h1>
                <p className="text-gray-600 mt-1">Find your study community</p>
              </div>
              <button
                onClick={handleCreateGroup}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Group
              </button>
            </div>
          )}
          
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};

export default StudyGroupManager;