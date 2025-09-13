// src/components/Chat/ChatList.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MessageCircle, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { auth } from "../../../firebase/init";
import { toast } from "react-hot-toast";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:8080';
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser) {
      fetchChats();
    }
  }, [currentUser]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/chats/user/${currentUser.uid}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      
      if (result.success) {
        setChats(result.data);
      } else {
        console.error('Failed to fetch chats:', result.error);
        toast.error('Failed to load chats');
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Error loading chats');
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (chat) => {
    return chat.participant1Id === currentUser.uid 
      ? chat.participant2 
      : chat.participant1;
  };

  const getLastMessagePreview = (lastMessage) => {
    if (!lastMessage) return "No messages yet";
    
    switch (lastMessage.messageType) {
      case "image":
        return "📷 Image";
      case "file":
        return "📎 File";
      case "audio":
        return "🎵 Audio";
      case "video":
        return "🎥 Video";
      default:
        return lastMessage.content.length > 50 
          ? lastMessage.content.substring(0, 50) + "..."
          : lastMessage.content;
    }
  };

  const formatLastMessageTime = (date) => {
    if (!date) return "";
    
    try {
      const messageDate = new Date(date);
      const now = new Date();
      const diffInHours = (now - messageDate) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return messageDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } else if (diffInHours < 48) {
        return "Yesterday";
      } else {
        return formatDistanceToNow(messageDate, { addSuffix: true });
      }
    } catch (error) {
      return "";
    }
  };

  const handleChatClick = (chat) => {
    navigate(`/chats/${chat.id}`);
  };

  const filteredChats = chats.filter(chat => {
    const otherParticipant = getOtherParticipant(chat);
    const searchLower = searchQuery.toLowerCase();
    return otherParticipant.displayName.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
          <MessageCircle className="w-6 h-6 text-blue-600" />
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Users className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium mb-2">No conversations yet</p>
            <p className="text-sm text-center px-4">
              Start a conversation with your study partners from the Partners page
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredChats.map((chat) => {
              const otherParticipant = getOtherParticipant(chat);
              const lastMessage = chat.messages[0];
              const unreadCount = chat._count.messages;
              const isOnline = otherParticipant.isActive && 
                otherParticipant.lastLoginAt && 
                (new Date() - new Date(otherParticipant.lastLoginAt)) < 5 * 60 * 1000; // 5 minutes

              return (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                        {otherParticipant.photoURL ? (
                          <img 
                            src={otherParticipant.photoURL} 
                            alt={otherParticipant.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                            {otherParticipant.displayName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      {/* Online indicator */}
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-800 truncate">
                          {otherParticipant.displayName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatLastMessageTime(lastMessage?.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {lastMessage?.senderId === currentUser.uid && "You: "}
                          {getLastMessagePreview(lastMessage)}
                        </p>
                        
                        {/* Unread count */}
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;