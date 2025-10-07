

//......................................................................................

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
  Loader2
} from "lucide-react";
import {toast} from "sonner";
import { Textarea } from "../../../components/ui/textarea"
import { useEffect, useRef, useState } from 'react';

import { storage } from "../../../firebase/image";
import { ref, uploadBytesResumable, getDownloadURL, uploadBytes } from 'firebase/storage';
import uuid4 from "uuid4";

import  {auth}  from "../../../firebase/init";

const GroupChatView = ({ group, onBack, currentUser, baseUrl }) => {
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
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const user = auth.currentUser;
 
  
  // const uploadFileToFirebase = async (file) => {
  //   if (!file) {
  //     throw new Error('No file provided');
  //   }

  //   toast.loading('Uploading file...', { id: 'file-upload' });
  //   setUploading(true);

  //   try {
  //     const timestamp = Date.now();
      
  //     const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  //     const fileName = `${timestamp}_${sanitizedFileName}`;
  //     const storageRef = ref(storage, `Wireframe_To_Code/${fileName}`);

  //     const metadata = {
  //       contentType: file.type,
  //       customMetadata: {
  //         'uploadedBy': user?.email || 'unknown',
  //         'originalName': file.name
  //       }
  //     };

  //     console.log('Uploading to:', storageRef.fullPath);

      
  //     const snapshot = await uploadBytes(storageRef, file, metadata);
  //     console.log('Upload successful:', snapshot);

      
  //     const downloadUrl = await getDownloadURL(storageRef);
  //     console.log('Download URL:', downloadUrl);

  //     setUploading(false);
  //     toast.success('File uploaded successfully!', { id: 'file-upload' });

  //     const uid = uuid4();



  //     return {
  //       uid: uid,
  //       url: downloadUrl,
  //       originalName: file.name,
  //       filename: file.name,
  //       fileName: fileName,
  //       storagePath: `Wireframe_To_Code/${fileName}`,
  //       size: file.size,
  //       type: file.type,
  //       description: "File from group chat",
  //       imageUrl: downloadUrl,
  //       email: user?.email,
  //     };
  //   } catch (error) {
  //     console.error('Upload error:', error);
  //     setUploading(false);
  //     toast.error(error.message || 'Failed to upload file', { id: 'file-upload' });
  //     throw error;
  //   }
  // };
  const uploadFileToFirebase = async (file) => {
    if (!file) {
      throw new Error('No file provided');
    }
  
    toast.loading('Uploading file...', { id: 'file-upload' });
    setUploading(true);
  
    try {
      const formData = new FormData();
      formData.append('file', file);
  
      const response = await fetch(`${baseUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
  
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }
  
      setUploading(false);
      toast.success('File uploaded successfully!', { id: 'file-upload' });
  
      return {
        uid: uuid4(),
        ...result.data,
        description: "File from group chat",
        email: user?.email,
      };
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      toast.error(error.message || 'Failed to upload file', { id: 'file-upload' });
      throw error;
    }
  };
  const isAdmin = group?.createdBy === currentUser?.uid;

  useEffect(() => {
    fetchMessages();
    if (isAdmin) {
      fetchJoinRequests();
    }
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
  }, [messages]);

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
            action,
            adminId: currentUser.uid,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        fetchJoinRequests();
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
      
      let fileData = null;
      
      
      if (selectedFile) {
        try {
          fileData = await uploadFileToFirebase(selectedFile);
          toast.success('File uploaded successfully!', { id: 'file-upload' });
        } catch (error) {
          console.error('File upload error:', error);
          toast.error(error.message || 'Failed to upload file', { id: 'file-upload' });
          setSending(false);
          return;
        }
      }

      // Send message with file data if available
      const response = await fetch(
        `${baseUrl}/api/study-groups/${group.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUser.uid,
            message: newMessage.trim() || (fileData ? `Sent a file: ${fileData.originalName}` : ''),
            messageType: fileData ? "file" : "text",
            attachments: fileData ? [{
              url: fileData.url,
              filename: fileData.originalName,
              size: fileData.size,
              type: fileData.type,
              storagePath: fileData.storagePath
            }] : [],
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setMessages((prev) => [...prev, result.data]);
        setNewMessage("");
        setSelectedFile(null);
        scrollToBottom();
        toast.success('Message sent!');
      } else {
        toast.error(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
      setUploading(false);
      setProgress(0);
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
      // (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      toast.success(`${file.name} selected`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
        className={`flex items-start gap-3 mb-6 max-w-3xl mx-auto group ${isOwn ? 'flex-row-reverse' : ''}`}
      >
        {!isOwn && (
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30 ring-2 ring-white">
              {message.sender?.photoURL ? (
                <img 
                  src={message.sender.photoURL} 
                  alt={message.sender.displayName} 
                  className="w-full h-full rounded-2xl object-cover" 
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {(message.senderName || message.sender?.displayName || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
          {!isOwn && (
            <p className="text-xs font-medium text-gray-600 mb-2 px-1">
              {message.senderName || message.sender?.displayName || 'Unknown User'}
            </p>
          )}
          
          <div
            className={`rounded-3xl px-5 py-3.5 shadow-lg transform transition-all duration-200 hover:scale-[1.02] ${
              isOwn
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
                : 'bg-white text-gray-800 shadow-gray-200/50 border border-gray-100'
            }`}
          >
            {message.messageType === 'file' && message.attachments?.length > 0 && (
              <div className="mb-3">
                {message.attachments.map((attachment, index) => {
                  const isObject = typeof attachment === 'object';
                  const fileUrl = isObject ? attachment.url : attachment;
                  const fileName = isObject ? attachment.filename : attachment;
                  const fileSize = isObject ? attachment.size : null;
                  
                  return (
                    <a
                      key={index}
                      href={fileUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 hover:scale-[1.02] ${
                        isOwn ? 'bg-blue-700/50' : 'bg-gray-100'
                      }`}
                    >
                      <File className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm truncate block">{fileName}</span>
                        {fileSize && (
                          <span className="text-xs opacity-75">{formatFileSize(fileSize)}</span>
                        )}
                      </div>
                      <Download className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            )}
            
            {message.message && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
            )}
          </div>
          
          <p className={`text-xs text-gray-400 mt-2 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    );
  };

  const groupedMessages = groupMessagesByDate(messages);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <p className="text-gray-600 mt-6 font-medium">Loading your conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-violet-50/30 via-purple-50/30 to-fuchsia-50/30">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
       
        <div className="overflow-hidden rounded-3xl mt-2 mb-1 fixed top-0 right-2 max-w-4xl left-2 md:left-60 z-10 mx-auto">
         
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-900 to-blue-800 opacity-90"></div>
          
         
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          </div>

         
          <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
            <div className="px-5 py-3.5 flex items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:scale-110"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                      <span className="text-lg font-bold text-white">
                        {group?.name?.charAt(0) || 'G'}
                      </span>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl blur-md opacity-50"></div>
                  </div>
                  
                  <div>
                    <h2 className="font-bold text-white text-base tracking-tight drop-shadow-lg truncate block max-w-[150px] md:max-w-full">
                      {group?.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
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
              
              {/* Right Section */}
              <div className="flex items-center gap-2">
                {isAdmin && joinRequests.length > 0 && (
                  <button
                    onClick={() => setShowJoinRequests(true)}
                    className="relative p-2.5 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:scale-110"
                  >
                    <Bell className="w-5 h-5 text-white/90" />
                    <div className="absolute -top-1 -right-1">
                      <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-lg">
                        {joinRequests.length}
                      </span>
                      <span className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-50"></span>
                    </div>
                  </button>
                )}
                
                <button
                  onClick={() => setShowMembers(!showMembers)}
                  className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:scale-110"
                >
                  <Users className="w-5 h-5 text-white/90" />
                </button>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 blur-2xl opacity-50"></div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 pt-20 pb-32 bg-gradient-to-b from-transparent to-white/30">
          {Object.entries(groupedMessages).length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="relative mx-auto w-20 h-20 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-900 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/40">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No messages yet</h3>
                <p className="text-gray-600">Start the conversation by sending the first message!</p>
              </div>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date} className="mb-8">
                <div className="flex justify-center mb-6">
                  <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-semibold text-gray-700 shadow-lg shadow-gray-200/50 border border-gray-100">
                    {date}
                  </div>
                </div>
                {msgs.map(renderMessage)}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Premium Message Input */}
        <div className="fixed bottom-2 right-2 max-w-4xl mx-auto left-2 md:left-60 z-40">
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/90 via-purple-600/90 to-fuchsia-600/90"></div>
            <div className="relative backdrop-blur-xl bg-white/95 border border-white/20 shadow-2xl p-4">
              {selectedFile && (
                <div className="mb-3 p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl flex items-center justify-between border border-purple-200 shadow-sm">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="p-2 bg-purple-100 rounded-xl flex-shrink-0">
                      <File className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-purple-900 block truncate">{selectedFile.name}</span>
                      <span className="text-xs text-purple-600">{formatFileSize(selectedFile.size)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors flex-shrink-0"
                    disabled={uploading}
                  >
                    <X className="w-4 h-4 text-purple-600" />
                  </button>
                </div>
              )}

              {uploading && (
                <div className="mb-3 p-3 bg-blue-50 rounded-2xl border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Uploading...</span>
                    <span className="text-sm font-bold text-blue-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <Textarea 
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={uploading || sending}
                    className="w-full px-5 py-3.5 pr-12 max-h-[120px] rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white shadow-inner border-gray-200 text-gray-800 placeholder-gray-400"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || sending}
                    className="absolute right-3 bottom-3.5 p-2 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Paperclip className="w-5 h-5 text-gray-400" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading || sending}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={(!newMessage.trim() && !selectedFile) || sending || uploading}
                  className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60 hover:scale-105 disabled:shadow-none disabled:scale-100"
                >
                  {sending || uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Members Sidebar */}
      {showMembers && (
        <div className="w-80 relative overflow-hidden z-30 rounded-3xl ml-2 my-2 mr-2">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600"></div>
          <div className="relative h-full backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white drop-shadow-lg">
                  Members ({group?.memberCount || 0})
                </h2>
                <button
                  onClick={() => setShowMembers(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/10 hover:scale-110"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="space-y-3">
                {group?.members?.map((member) => (
                  <div key={member.id || member.uid} className="group/member p-3 hover:bg-white/20 rounded-2xl transition-all duration-200 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:scale-[1.02] cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl flex items-center justify-center shadow-lg">
                          {member.photoURL ? (
                            <img 
                              src={member.photoURL} 
                              alt={member.displayName} 
                              className="w-full h-full rounded-2xl object-cover" 
                            />
                          ) : (
                            <span className="text-white font-bold">
                              {(member.displayName || 'U').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{member.displayName}</p>
                        {member.yearOfStudy && (
                          <p className="text-sm text-white/70">Year {member.yearOfStudy}</p>
                        )}
                      </div>
                      {group?.createdBy === (member.uid || member.id) && (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs rounded-xl font-bold shadow-lg shadow-amber-500/30">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      
      {showJoinRequests && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-900 rounded-3xl blur-xl opacity-50"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl max-h-[32rem] overflow-hidden">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white drop-shadow-lg">
                    Join Requests ({joinRequests.length})
                  </h3>
                  <button
                    onClick={() => setShowJoinRequests(false)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-96">
                {joinRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <UserPlus className="w-10 h-10 text-purple-500" />
                    </div>
                    <p className="text-gray-500 font-medium">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {joinRequests.map((request) => (
                      <div key={request.id} className="border-2 border-gray-100 rounded-2xl p-4 hover:border-purple-200 transition-all duration-200 hover:shadow-lg bg-gradient-to-br from-white to-purple-50/30">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            {request.user.photoURL ? (
                              <img 
                                src={request.user.photoURL} 
                                alt={request.user.displayName} 
                                className="w-full h-full rounded-2xl object-cover" 
                              />
                            ) : (
                              <span className="text-white font-bold">
                                {request.user.displayName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{request.user.displayName}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(request.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {request.message && (
                          <p className="text-sm text-gray-700 mb-4 p-3 bg-purple-50 rounded-xl italic border-l-4 border-purple-400">
                            "{request.message}"
                          </p>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleJoinRequestResponse(request.id, 'approve')}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02]"
                          >
                            <Check className="w-5 h-5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleJoinRequestResponse(request.id, 'reject')}
                            className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-3 rounded-xl font-bold hover:from-red-600 hover:to-rose-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02]"
                          >
                            <XCircle className="w-5 h-5" />
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
        </div>
      )}

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
      `}</style>
    </div>
  );
};

export default GroupChatView;