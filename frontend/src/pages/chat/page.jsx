import { useState, useRef } from "react";
import {
  Search,
  Paperclip,
  X,
  Send,
  ArrowLeft,
  FileText,
  File,
  Image,
} from "lucide-react";
import Sidebar from "../../components/Sidebar/sidebar";
import {
  conversations,
  dummyChats,
  chatFiles,
} from "../../lib/constants/chatsPageStrings";

export default function ChatInterface() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showFilesPanel, setShowFilesPanel] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [chatMessages, setChatMessages] = useState({});
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const getMessagesForChat = (chatId) => {
    if (chatMessages[chatId]) {
      return [...(dummyChats[chatId] || []), ...chatMessages[chatId]];
    }
    return dummyChats[chatId] || [];
  };

  const getFilesForChat = (chatId) => {
    return chatFiles[chatId] || [];
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setShowMobileChat(true); // open chat on mobile
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;

    const newMessage = {
      id: Date.now(),
      sender: "me",
      content: messageInput,
      timestamp: "1 Minute ago",
    };

    setChatMessages((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage],
    }));

    setMessageInput("");
  };

  const handleFileAttach = (event) => {
    const files = Array.from(event.target.files);
    if (!selectedChat) return;

    files.forEach((file) => {
      const newFile = {
        id: `${selectedChat.id}-${Date.now()}-${Math.random()}`,
        name: file.name,
        date: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        type: file.type.includes("pdf")
          ? "pdf"
          : file.type.includes("image")
          ? "image"
          : file.type.includes("doc")
          ? "doc"
          : "file",
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        file,
        chatId: selectedChat.id,
      };

      chatFiles[selectedChat.id] = [
        ...(chatFiles[selectedChat.id] || []),
        newFile,
      ];

      const fileMessage = {
        id: Date.now() + Math.random(),
        sender: "me",
        content: `📎 ${file.name}`,
        timestamp: "Just now",
        isFile: true,
        fileName: file.name,
      };

      setChatMessages((prev) => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), fileMessage],
      }));
    });

    setAttachedFiles((prev) => [...prev, Date.now()]);
  };

  const removeFile = (fileId, chatId) => {
    if (chatFiles[chatId]) {
      chatFiles[chatId] = chatFiles[chatId].filter((file) => file.id !== fileId);
      setAttachedFiles((prev) => [...prev, Date.now()]);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-4 h-4 text-red-500" />;
      case "image":
        return <Image className="w-4 h-4 text-green-500" />;
      case "doc":
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFileIconBg = (type) => {
    switch (type) {
      case "pdf":
        return "bg-red-100";
      case "image":
        return "bg-green-100";
      case "doc":
        return "bg-blue-100";
      default:
        return "bg-gray-100";
    }
  };

  const currentChatFiles = selectedChat ? getFilesForChat(selectedChat.id) : [];

  const FilesPanel = () => (
    <div
      className={`fixed md:static top-0 right-0 h-full w-64 bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out
        ${showFilesPanel ? "translate-x-0" : "translate-x-full"}
        md:translate-x-0 md:w-64`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            Files ({currentChatFiles.length})
          </h3>
          <button
            onClick={() => setShowFilesPanel(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {currentChatFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer group"
            >
              <div
                className={`w-8 h-8 ${getFileIconBg(
                  file.type
                )} rounded mr-3 flex items-center justify-center`}
              >
                {getFileIcon(file.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">{file.date}</p>
                {file.size && (
                  <p className="text-xs text-gray-400">{file.size}</p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id, selectedChat.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          ))}
          {currentChatFiles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No files shared yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileAttach}
        multiple
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.py,.xlsx,.pptx"
      />

      {/* Left Sidebar - Contacts */}
      {!showMobileChat && (
        <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Chat</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search contacts"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations
              .filter((conv) =>
                conv.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleChatSelect(conversation)}
                  className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition ${
                    selectedChat?.id === conversation.id
                      ? "bg-blue-50 border-blue-200"
                      : ""
                  }`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                    {conversation.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.name}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2">
                        {conversation.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Chat Area */}
      {selectedChat && (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="md:hidden mr-3"
                onClick={() => setShowMobileChat(false)}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                {selectedChat.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <h2 className="font-medium text-gray-900">
                  {selectedChat.name}
                </h2>
                <p className="text-sm text-gray-500">Online</p>
              </div>
            </div>
            <button
              onClick={() => setShowFilesPanel(!showFilesPanel)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              {getMessagesForChat(selectedChat.id).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "me"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2 max-w-xs transition ${
                      message.sender === "me"
                        ? "bg-blue-500 text-white rounded-br-md"
                        : "bg-white border border-gray-200 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.timestamp && (
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === "me"
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Files Panel */}
      {selectedChat && <FilesPanel />}
    </div>
  );
}
