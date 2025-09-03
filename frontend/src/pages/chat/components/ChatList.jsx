import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { conversations } from "../../../lib/constants/chatsPageStrings";
import Sidebar from "../../../components/Sidebar/sidebar";

export default function ChatList() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleChatSelect = (conversation) => {
    navigate(`/chat/${conversation.id}`);
  };

  return (
    <div className="flex  h-screen ">
      <Sidebar/>
      {/* Header */}
      <div className="flex flex-col w-full md:w-80 bg-white border-r border-gray-200">
<div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Chat</h1>
        <input
          type="text"
          placeholder="Search contacts"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-3 pr-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations
          .filter((conv) =>
            conv.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleChatSelect(conversation)}
              className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                {conversation.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {conversation.name}
                </h3>
                <p className="text-sm text-gray-600 truncate mt-1">
                  {conversation.lastMessage}
                </p>
              </div>
            </div>
          ))}
      </div>
      </div>
      

      {/* Conversation List */}
      
    </div>
  );
}
