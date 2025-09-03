export default function MessageBubble({ message }) {
    const isMe = message.sender === "me";
  
    return (
      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        <div
          className={`rounded-2xl px-4 py-2 max-w-xs transition ${
            isMe
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-white border border-gray-200 rounded-bl-md"
          }`}
        >
          <p className="text-sm">{message.content}</p>
          {message.timestamp && (
            <p
              className={`text-xs mt-1 ${
                isMe ? "text-blue-100" : "text-gray-500"
              }`}
            >
              {message.timestamp}
            </p>
          )}
        </div>
      </div>
    );
  }
  