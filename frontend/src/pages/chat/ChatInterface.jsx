import { useState, useRef } from "react";
import Sidebar from "../../components/Sidebar/sidebar";
import {
  conversations,
  dummyChats,
  chatFiles,
} from "../../lib/constants/chatsPageStrings";
import { Paperclip } from "lucide-react";


import ChatList from "./components/ChatList";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import FilesPanel from "./components/FilesPanel";
import ChatInput from "./components/ChatInput";
import IconButton from "./components/IconButton";

export default function ChatInterface() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showFilesPanel, setShowFilesPanel] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [chatMessages, setChatMessages] = useState({});
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);


  const getMessagesForChat = (chatId) =>
    chatMessages[chatId]
      ? [...(dummyChats[chatId] || []), ...chatMessages[chatId]]
      : dummyChats[chatId] || [];

  const getFilesForChat = (chatId) => chatFiles[chatId] || [];

  
  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setShowMobileChat(true);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;

    const newMessage = {
      id: Date.now(),
      sender: "me",
      content: messageInput,
      timestamp: "Just now",
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
      chatFiles[chatId] = chatFiles[chatId].filter((f) => f.id !== fileId);
      setAttachedFiles((prev) => [...prev, Date.now()]);
    }
  };

  const currentChatFiles = selectedChat ? getFilesForChat(selectedChat.id) : [];

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

      {/* Chat List (left sidebar) */}
      {!showMobileChat && (
        <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Chat</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search contacts"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <ChatList
            conversations={conversations}
            searchTerm={searchTerm}
            onSelect={handleChatSelect}
            selectedChat={selectedChat}
          />
        </div>
      )}

      {/* Chat Area */}
      {selectedChat && (
        <div className="flex-1 flex flex-col">
          <ChatHeader
            chat={selectedChat}
            onBack={() => setShowMobileChat(false)}
            onToggleFiles={() => setShowFilesPanel(!showFilesPanel)}
          />

          <MessageList messages={getMessagesForChat(selectedChat.id)} />

          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <IconButton onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="w-5 h-5" />
              </IconButton>
              <ChatInput
                value={messageInput}
                onChange={setMessageInput}
                onSend={handleSendMessage}
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
      {selectedChat && (
        <FilesPanel
          files={currentChatFiles}
          show={showFilesPanel}
          onClose={() => setShowFilesPanel(false)}
          onRemove={removeFile}
        />
      )}
    </div>
  );
}
