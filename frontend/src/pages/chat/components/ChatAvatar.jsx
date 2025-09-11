export default function ChatAvatar({ name }) {
    const initials = name
  
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
        {initials}
      </div>
    );
  }
  