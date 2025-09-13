import { Users } from "lucide-react";
import { useEffect, useRef } from "react";
import { Message } from "./chatMessage";

export const MessagesArea = ({ messages, currentUser, formatTime, groupMessagesByDate }) => {
    const messagesEndRef = useRef(null);
    const groupedMessages = groupMessagesByDate(messages);
  
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
  
    if (Object.entries(groupedMessages).length === 0) {
      return (
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No messages yet</h3>
              <p className="text-gray-500">Start the conversation by sending the first message!</p>
            </div>
          </div>
        </div>
      );
    }
  
    return (
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="flex justify-center mb-4">
              <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                {date}
              </div>
            </div>
            {msgs.map(msg => (
              <Message 
                key={msg.id} 
                message={msg} 
                currentUser={currentUser} 
                formatTime={formatTime} 
              />
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    );
  };
  