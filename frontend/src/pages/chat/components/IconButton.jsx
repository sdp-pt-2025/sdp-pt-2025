export default function IconButton({ children, onClick }) {
    return (
      <button
        onClick={onClick}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
      >
        {children}
      </button>
    );
  }
  