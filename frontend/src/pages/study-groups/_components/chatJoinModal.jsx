import { Check, UserPlus, X, XCircle } from "lucide-react";

export const JoinRequestsModal = ({ joinRequests, onClose, onHandleRequest }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full m-4 max-h-96 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Join Requests ({joinRequests.length})
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
  
          {joinRequests.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {joinRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {request.user.photoURL ? (
                        <img 
                          src={request.user.photoURL} 
                          alt={request.user.displayName} 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        <span className="text-blue-600 font-semibold text-sm">
                          {request.user.displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{request.user.displayName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {request.message && (
                    <p className="text-sm text-gray-700 mb-3 italic">"{request.message}"</p>
                  )}
  
                  <div className="flex gap-2">
                    <button
                      onClick={() => onHandleRequest(request.id, 'approve')}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => onHandleRequest(request.id, 'reject')}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );