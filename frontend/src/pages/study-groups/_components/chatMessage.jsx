import { Download, File } from "lucide-react";

export const Message = ({ message, currentUser, formatTime }) => {
    const isOwn = message.senderId === currentUser.uid;
    const isSystem = message.messageType === "system";
    
    if (isSystem) {
      return (
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 px-4 py-2 rounded-full text-sm text-blue-700 max-w-md text-center">
            {message.message}
          </div>
        </div>
      );
    }
    
    return (
      <div className={`flex items-start gap-3 mb-4 max-w-3xl mx-auto ${isOwn ? 'flex-row-reverse' : ''}`}>
        {!isOwn && (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            {message.sender?.photoURL ? (
              <img 
                src={message.sender.photoURL} 
                alt={message.sender.displayName} 
                className="w-full h-full rounded-full object-cover" 
              />
            ) : (
              <span className="text-blue-600 font-semibold text-sm">
                {(message.senderName || message.sender?.displayName || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        )}
        
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
          {!isOwn && (
            <p className="text-xs text-gray-500 mb-1">
              {message.senderName || message.sender?.displayName || 'Unknown User'}
            </p>
          )}
          
          <div className={`rounded-2xl px-4 py-2 ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
            {message.messageType === 'file' && message.attachments?.length > 0 && (
              <div className="mb-2">
                {message.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded-lg ${isOwn ? 'bg-blue-700' : 'bg-gray-200'}`}
                  >
                    <File className="w-4 h-4" />
                    <span className="text-sm truncate">{attachment}</span>
                    <Download className="w-4 h-4 cursor-pointer" />
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
          </div>
          
          <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    );
  };
  