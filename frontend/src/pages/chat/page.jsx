// src/pages/Chat/ChatPage.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar/sidebar";
import ChatList from "./components/ChatList";
import ChatWindow from "./ChatWindow";
import { auth } from "../../firebase/init";
import { toast } from "react-hot-toast";

const ChatPage = () => {
  const location = useLocation();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const currentUser = auth.currentUser;
  const BASE_URL = import.meta.env.BACK_URL;

  useEffect(() => {
    // Check if we need to create or navigate to a specific chat
    const params = new URLSearchParams(location.search);
    const partnerId = params.get('partnerId');
    
    if (partnerId && currentUser) {
      createOrNavigateToChat(partnerId);
    }
  }, [location.search, currentUser]);

  const createOrNavigateToChat = async (partnerId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participant1Id: currentUser.uid,
          participant2Id: partnerId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSelectedChatId(result.data.id);
        // Update URL without partnerId to avoid recreating chat
        window.history.replaceState({}, '', '/chats');
      } else {
        console.error('Failed to create/get chat:', result.error);
        toast.error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error creating/getting chat:', error);
      toast.error('Error starting conversation');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex">
        {/* Chat List - Always visible on larger screens, conditional on mobile */}
        <div className={`w-80 bg-white border-r border-gray-200 ${
          selectedChatId ? 'hidden lg:block' : 'block'
        }`}>
          <ChatList onChatSelect={setSelectedChatId} />
        </div>

        {/* Chat Window */}
        <div className={`flex-1 ${
          selectedChatId ? 'block' : 'hidden lg:block'
        }`}>
          {selectedChatId ? (
            <ChatWindow 
              chatId={selectedChatId} 
              onBack={() => setSelectedChatId(null)}
            />
          ) : (
            <div className="hidden lg:flex items-center justify-center h-full bg-gray-50">
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path>
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-sm">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;