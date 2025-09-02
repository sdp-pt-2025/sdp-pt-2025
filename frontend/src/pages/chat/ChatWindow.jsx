import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { ArrowLeft, Paperclip, FileText, File, Image } from "lucide-react";
import { dummyChats, chatFiles } from "../../lib/constants/chatsPageStrings";
import Sidebar from "../../components/Sidebar/sidebar";

export default function ChatWindow() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState("");
  const [chatMessages, setChatMessages] = useState({});
  const fileInputRef = useRef(null);

  const selectedChat = {
    id: chatId,
    name: `Chat ${chatId}`, // when the backend is set up we will use a uuid generator function
  };

  const getMessagesForChat = (chatId) => {
    return [...(dummyChats[chatId] || []), ...(chatMessages[chatId] || [])];
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "me",
      content: messageInput,
      timestamp: "Just now",
    };

    setChatMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage],
    }));

    setMessageInput("");
  };

  const currentChatFiles = chatFiles[chatId] || [];

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

  return (
    <div className="flex h-screen">
  <Sidebar />
  
  <div className="flex flex-col flex-1 h-screen bg-gray-100">
    {/* Header */}
    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center">
        <button
          onClick={() => navigate("/chat")}
          className="mr-3 p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-medium">{selectedChat.name}</h2>
      </div>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
      >
        <FileText className="w-5 h-5" />
      </button>
    </div>

    {/* Messages */}
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {getMessagesForChat(chatId).map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-2xl px-4 py-2 max-w-xs ${
                msg.sender === "me"
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-gray-200"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs mt-1 text-gray-500">{msg.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Input */}
    <div className="bg-white p-4 flex items-center space-x-2 border-t border-gray-200 flex-shrink-0">
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
        className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
      >
        Send
      </button>
      <input type="file" ref={fileInputRef} className="hidden" multiple />
    </div>
  </div>
</div>

  );
}
