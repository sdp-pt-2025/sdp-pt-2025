import ChatAvatar from "../components/ChatAvatar";
import { ArrowLeft, FileText } from "lucide-react";
import IconButton from "../components/IconButton";

export default function ChatHeader({ chat, onBack, onToggleFiles }) {
  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center">
        <button className="md:hidden mr-3" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <ChatAvatar name={chat.name} />
        <div className="ml-3">
          <h2 className="font-medium text-gray-900">{chat.name}</h2>
          <p className="text-sm text-gray-500">Online</p>
        </div>
      </div>
      <IconButton onClick={onToggleFiles}>
        <FileText className="w-5 h-5" />
      </IconButton>
    </div>
  );
}
