import { X } from "lucide-react";

export default function FilesListItem({ file, icon, bg, onRemove }) {
  return (
    <div
      className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer group"
    >
      <div className={`w-8 h-8 ${bg} rounded mr-3 flex items-center justify-center`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{file.date}</p>
        {file.size && <p className="text-xs text-gray-400">{file.size}</p>}
      </div>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
      >
        <X className="w-3 h-3 text-gray-500" />
      </button>
    </div>
  );
}
