import { Award, History, X } from "lucide-react";

export const SessionHistoryModal = ({ sessionHistory, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full m-4 max-h-96 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Study Session History</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
  
          {sessionHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No study sessions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessionHistory.map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{session.module}</h4>
                      <p className="text-sm text-gray-600">{session.topic}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {Math.floor(session.duration / 60)}h {session.duration % 60}m
                      </p>
                      {session.rating && (
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">{session.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>by {session.user.displayName}</span>
                    <span>{new Date(session.startTime).toLocaleDateString()}</span>
                    <span>{session.participants.length} participants</span>
                  </div>
  
                  {session.notes && (
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded italic">
                      "{session.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );