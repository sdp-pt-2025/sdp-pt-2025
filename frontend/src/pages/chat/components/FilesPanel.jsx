import { X, FileText, Image, File } from "lucide-react";
import FilesListItem from "../components/FilesListItem";

const icons = {
  pdf: <FileText className="w-4 h-4 text-red-500" />,
  image: <Image className="w-4 h-4 text-green-500" />,
  doc: <FileText className="w-4 h-4 text-blue-500" />,
  file: <File className="w-4 h-4 text-gray-500" />,
};

const bgs = {
  pdf: "bg-red-100",
  image: "bg-green-100",
  doc: "bg-blue-100",
  file: "bg-gray-100",
};

export default function FilesPanel({ files, show, onClose, onRemove }) {
  return (
    <div
      className={`fixed md:static top-0 right-0 h-full w-64 bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out
        ${show ? "translate-x-0" : "translate-x-full"} md:translate-x-0`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Files ({files.length})</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {files.map((file) => (
            <FilesListItem
              key={file.id}
              file={file}
              icon={icons[file.type] || icons.file}
              bg={bgs[file.type] || bgs.file}
              onRemove={(e) => {
                e.stopPropagation();
                onRemove(file.id, file.chatId);
              }}
            />
          ))}
          {files.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No files shared yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
