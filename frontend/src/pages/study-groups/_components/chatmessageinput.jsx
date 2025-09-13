import { File, Paperclip, Send, X } from "lucide-react";
import { useRef } from "react";

export const MessageInput = ({ 
    newMessage, 
    setNewMessage, 
    selectedFile, 
    setSelectedFile, 
    onSendMessage, 
    sending,
    onFileSelect 
  }) => {
    const fileInputRef = useRef(null);
  
    const handleKeyPress = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSendMessage();
      }
    };
  
    return (
      <div className="bg-white border-none border-gray-200 p-4 rounded-3xl shadow-sm shadow-gray-400">
        {selectedFile && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <File className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">{selectedFile.name}</span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-3 justify-center">
          <div className="flex-1 relative items-center justify-center">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-3 pr-12 max-h-[120px] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 resize-none bg-gray-200"
              style={{ minHeight: '48px' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-3 bottom-3 p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <Paperclip className="w-4 h-4 text-gray-400" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={onFileSelect}
              className="hidden"
            />
          </div>
          <button
            onClick={onSendMessage}
            disabled={(!newMessage.trim() && !selectedFile) || sending}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex-shrink-0"
          >
            {sending ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    );
  };