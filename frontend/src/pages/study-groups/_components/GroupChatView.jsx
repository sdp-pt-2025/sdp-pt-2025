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
  XCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { Textarea } from "../../../components/ui/textarea"

const GroupChatView = ({ group, onBack, currentUser, baseUrl }) => {
    //onShowNotifications
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check if current user is the creator/admin
  const isAdmin = group?.createdBy === currentUser?.uid;
//   const isCreator = isAdmin;

  useEffect(() => {
    fetchMessages();
    if (isAdmin) {
      fetchJoinRequests();
    }
    // Set up polling for new messages
    const interval = setInterval(() => {
      fetchMessages();
      if (isAdmin) {
        fetchJoinRequests();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [group?.id]);

  useEffect(() => {
    scrollToBottom();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!group?.id) return;
    
    try {
      const response = await fetch(
        `${baseUrl}/api/study-groups/${group.id}/messages?userId=${currentUser.uid}`
      );
      const result = await response.json();

      if (result.success) {
        setMessages(result.data);
      } else {
        console.error("Failed to fetch messages:", result.error);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinRequests = async () => {
    if (!group?.id || !isAdmin) return;

    try {
      const response = await fetch(
        `${baseUrl}/api/study-groups/${group.id}/join-requests?adminId=${currentUser.uid}`
      );
      const result = await response.json();

      if (result.success) {
        setJoinRequests(result.data);
      }
    } catch (error) {
      console.error("Error fetching join requests:", error);
    }
  };

  const handleJoinRequestResponse = async (requestId, action) => {
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
            action, // 'approve' or 'reject'
            adminId: currentUser.uid,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Refresh join requests
        fetchJoinRequests();
        // Show success message
        toast.success(`Request ${action}d successfully!`, { duration: 5000});
      } else {
        toast.error(result.error || `Failed to ${action} request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Failed to ${action} request`);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    try {
      setSending(true);
      const response = await fetch(
        `${baseUrl}/api/study-groups/${group.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUser.uid,
            message: newMessage.trim(),
            messageType: selectedFile ? "file" : "text",
            attachments: selectedFile ? [selectedFile.name] : [],
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setMessages((prev) => [...prev, result.data]);
        setNewMessage("");
        setSelectedFile(null);
        scrollToBottom();
      } else {
        toast.error(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach((message) => {
      const date = formatDate(message.createdAt);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });
    return grouped;
  };

  const renderMessage = (message) => {
    const isOwn = message.senderId === currentUser.uid;
    
    return (
      <div
        key={message.id}
        className={`flex items-start gap-3 mb-4 max-w-3xl  mx-auto ${isOwn ? 'flex-row-reverse' : ''}`}
      >
        {!isOwn && (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            {message.sender?.photoURL ? (
              <img 
                src={message.sender.photoURL} 
                alt={message.sender.displayName} 
                className="w-full h-full rounded-full object-cover" 
              />
            ) : (
              <span className="text-blue-600 font-semibold text-sm">
                {(message.senderName || message.sender?.displayName || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        )}
        
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
          {!isOwn && (
            <p className="text-xs text-gray-500 mb-1">
              {message.senderName || message.sender?.displayName || 'Unknown User'}
            </p>
          )}
          
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwn
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {message.messageType === 'file' && message.attachments?.length > 0 && (
              <div className="mb-2">
                {message.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      isOwn ? 'bg-blue-700' : 'bg-gray-200'
                    }`}
                  >
                    <File className="w-4 h-4" />
                    <span className="text-sm truncate">{attachment}</span>
                    <Download className="w-4 h-4 cursor-pointer" />
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
          </div>
          
          <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    );
  };

  const groupedMessages = groupMessagesByDate(messages);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white ">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col ">
        {/* Header */}
        <div className="bg-white  border border-gray-200 p-1 flex items-center justify-between rounded-2xl shadow-md shadow-gray-100 mb-1 fixed top-2 right-2 max-w-4xl mx-auto left-2 md:left-60">
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
          <div className="flex items-center gap-2">
            {isAdmin && joinRequests.length > 0 && (
              <button
                onClick={() => setShowJoinRequests(true)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {joinRequests.length}
                </span>
              </button>
            )}
            {/* <button
              onClick={() => setShowGroupInfo(!showGroupInfo)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Info className="w-5 h-5 text-gray-600" />
            </button> */}
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Users className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {Object.entries(groupedMessages).length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No messages yet</h3>
                <p className="text-gray-500">Start the conversation by sending the first message!</p>
              </div>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                <div className="flex justify-center mb-4 mt-20">
                  <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                    {date}
                  </div>
                </div>
                {msgs.map(renderMessage)}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-none border-gray-200 p-4 rounded-3xl shadow-sm shadow-gray-400 fixed bottom-2 right-2 max-w-4xl mx-auto left-2 md:left-60">
          {selectedFile && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <File className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">{selectedFile.name}</span>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-3 justify-center ">
            <div className="flex-1 relative items-center justify-center">
              <Textarea 
              placeholder="Type your message here."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              
              
              className="w-full px-4 py-3 pr-12 max-h-[120px]  rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 resize-none bg-gray-200"

               />
              {/* <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="w-full px-4 py-3 pr-12  rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 resize-none bg-gray-200"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              /> */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-3 bottom-3 p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <Paperclip className="w-4 h-4 text-gray-400!" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={(!newMessage.trim() && !selectedFile) || sending}
              className="p-3 bg-blue-600! text-white rounded-xl hover:bg-blue-700! disabled:bg-gray-300 disabled:cursor-not-allowed transition flex-shrink-0"
            >
              {sending ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Group Info Sidebar */}
      {showGroupInfo && (
        <div className="w-70 bg-white  p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Group Info</h2>
            <button
              onClick={() => setShowGroupInfo(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{group?.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Users className="w-4 h-4" />
                <span>{group?.memberCount}/{group?.maxMembers} members</span>
              </div>
              {group?.description && (
                <p className="text-gray-700 text-sm">{group?.description}</p>
              )}
            </div>

            {group?.tags && group.tags.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Module</h4>
              <p className="text-gray-700 text-sm">{group?.module}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Privacy</h4>
              <div className="flex items-center gap-2">
                {group?.isPublic ? (
                  <>
                    <Globe className="w-4 h-4 text-green-500" />
                    <span className="text-green-700 text-sm">Public Group</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-700 text-sm">Private Group</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Created</h4>
              <p className="text-gray-700 text-sm">
                {new Date(group?.createdAt).toLocaleDateString()} by {group?.createdByName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Members Sidebar */}
      {showMembers && (
        <div className="w-70 bg-blue-900 rounded-4xl ml-2 p-6 overflow-y-auto z-800 bg-blur-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-200">
              Members ({group?.memberCount || 0})
            </h2>
            <button
              onClick={() => setShowMembers(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-4 h-4 text-gray-300" />
            </button>
          </div>

          <div className="space-y-3">
            {group?.members?.map((member) => (
              <div key={member.id || member.uid} className="flex items-center gap-3 p-2 hover:bg-blue-500 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  {member.photoURL ? (
                    <img 
                      src={member.photoURL} 
                      alt={member.displayName} 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    <span className="text-gray-200 font-semibold text-sm">
                      {(member.displayName || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-200">{member.displayName}</p>
                  {member.yearOfStudy && (
                    <p className="text-sm text-gray-500">Year {member.yearOfStudy}</p>
                  )}
                </div>
                {group?.createdBy === (member.uid || member.id) && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                    Creator
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Join Requests Modal */}
      {showJoinRequests && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full m-4 max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Join Requests ({joinRequests.length})
                </h3>
                <button
                  onClick={() => setShowJoinRequests(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {joinRequests.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {joinRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {request.user.photoURL ? (
                            <img 
                              src={request.user.photoURL} 
                              alt={request.user.displayName} 
                              className="w-full h-full rounded-full object-cover" 
                            />
                          ) : (
                            <span className="text-blue-600 font-semibold text-sm">
                              {request.user.displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{request.user.displayName}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {request.message && (
                        <p className="text-sm text-gray-700 mb-3 italic">"{request.message}"</p>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleJoinRequestResponse(request.id, 'approve')}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleJoinRequestResponse(request.id, 'reject')}
                          className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChatView;