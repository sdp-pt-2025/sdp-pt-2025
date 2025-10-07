import ChatAvatar from "../components/ChatAvatar";
// import { conversations } from "../../../lib/constants/chatsPageStrings";

export default function ChatListItem({ conversations, selected, onClick }) {
  return (
    <div
      onClick={() => onClick(conversations)}
      className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition ${
        selected ? "bg-blue-50 border-blue-200" : ""
      }`}
    >
     
      <ChatAvatar name={conversations.name} />

      <div className="flex-1 min-w-0 ml-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 truncate">
            {conversations.name}
          </h3>
          <span className="text-xs text-gray-500 ml-2">
            {conversations.time}
          </span>
        </div>
        <p className="text-sm text-gray-600 truncate mt-1">
          {conversations.lastMessage}
        </p>
      </div>
    </div>
  );
}
