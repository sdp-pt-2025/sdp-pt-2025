// src/components/Chat/ChatWindow.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  Image, 
  FileText, 
  Download,
  MoreVertical,
  Trash2,
  Reply,
  X
} from "lucide-react";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { auth } from "../../firebase/init";
import { toast } from "react-hot-toast";

const ChatWindow = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const BASE_URL = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:8080';
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser && chatId) {
      fetchChat();
      fetchMessages();
    }
  }, [currentUser, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChat = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/chats/${chatId}?userId=${currentUser.uid}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      
      if (result.success) {
        setChat(result.data);
      } else {
        console.error('Failed to fetch chat:', result.error);
        toast.error('Failed to load chat');
        navigate('/chats');
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
      toast.error('Error loading chat');
      navigate('/chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/chats/${chatId}/messages?userId=${currentUser.uid}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      
      if (result.success) {
        setMessages(result.data);
      } else {
        console.error('Failed to fetch messages:', result.error);
        toast.error('Failed to load messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Error loading messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() && selectedFiles.length === 0) return;

    const formData = new FormData();
    formData.append('senderId', currentUser.uid);
    formData.append('content', messageInput);
    formData.append('messageType', selectedFiles.length > 0 ? 'file' : 'text');
    
    if (replyingTo) {
      formData.append('replyToId', replyingTo.id);
    }

    selectedFiles.forEach((file) => {
      formData.append('attachments', file);
    });

    try {
      const loadingToast = toast.loading('Sending message...');
      
      const response = await fetch(`${BASE_URL}/api/chats/${chatId}/messages`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      toast.dismiss(loadingToast);

      if (result.success) {
        setMessages(prev => [...prev, result.data]);
        setMessageInput("");
        setSelectedFiles([]);
        setReplyingTo(null);
        scrollToBottom();
      } else {
        toast.error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/chats/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.uid,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        toast.success('Message deleted');
      } else {
        toast.error(result.error || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
    setShowDropdown(null);
  };

  const getOtherParticipant = () => {
    if (!chat) return null;
    return chat.participant1Id === currentUser.uid 
      ? chat.participant2 
      : chat.participant1;
  };

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm');
    } else if (isYesterday(messageDate)) {
      return `Yesterday ${format(messageDate, 'HH:mm')}`;
    } else {
      return format(messageDate, 'MMM d, HH:mm');
    }
  };

  const getFileIcon = (attachment) => {
    const fileType = attachment.fileType || 'file';
    
    switch (fileType) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'pdf':
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const renderAttachment = (attachment) => {
    if (attachment.fileType === 'image') {
      return (
        <div className="max-w-xs rounded-lg overflow-hidden">
          <img 
            src={`${BASE_URL}/${attachment.filePath}`}
            alt={attachment.fileName}
            className="w-full h-auto"
          />
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2 max-w-xs">
        {getFileIcon(attachment)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {attachment.fileName}
          </p>
          <p className="text-xs text-gray-500">
            {(attachment.fileSize / 1024).toFixed(1)} KB
          </p>
        </div>
        <button
          onClick={() => window.open(`${BASE_URL}/${attachment.filePath}`, '_blank')}
          className="text-blue-600 hover:text-blue-800"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/chats")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {otherParticipant && (
            <>
              <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
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
              <div>
                <h2 className="font-semibold text-gray-900">
                  {otherParticipant.displayName}
                </h2>
                <p className="text-sm text-gray-500">
                  {otherParticipant.isActive ? 'Online' : 'Offline'}
                </p>
              </div>
            </>
          )}
        </div>
        
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUser.uid;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg`}>
                  {/* Reply indicator */}
                  {message.replyTo && (
                    <div className={`text-xs text-gray-500 mb-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                      Replying to {message.replyTo.sender.displayName}
                    </div>
                  )}
                  
                  <div className="relative group">
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      {/* Reply content */}
                      {message.replyTo && (
                        <div className={`text-xs mb-2 p-2 rounded ${
                          isOwn ? 'bg-blue-500' : 'bg-gray-100'
                        }`}>
                          <p className="font-medium">{message.replyTo.sender.displayName}</p>
                          <p className="truncate">{message.replyTo.content}</p>
                        </div>
                      )}
                      
                      {/* Message content */}
                      {message.content && (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      )}
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment, index) => (
                            <div key={index}>
                              {renderAttachment(attachment)}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <p className={`text-xs mt-1 ${
                        isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                    
                    {/* Message actions */}
                    <div className={`absolute top-0 ${
                      isOwn ? '-left-20' : '-right-20'
                    } opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1`}>
                      <button
                        onClick={() => setReplyingTo(message)}
                        className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Reply className="w-3 h-3" />
                      </button>
                      {isOwn && (
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="p-1 bg-gray-100 rounded-full hover:bg-red-100 transition-colors text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="bg-blue-50 border-t border-blue-200 p-3 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800">
              Replying to {replyingTo.sender.displayName}
            </p>
            <p className="text-sm text-blue-600 truncate">
              {replyingTo.content}
            </p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-blue-600 hover:text-blue-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* File preview */}
      {selectedFiles.length > 0 && (
        <div className="bg-gray-100 border-t border-gray-200 p-3">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 bg-white rounded-lg p-2 shadow-sm">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 truncate max-w-32">
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <textarea
              rows={1}
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() && selectedFiles.length === 0}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ChatWindow;