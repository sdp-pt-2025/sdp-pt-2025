export const MembersSidebar = ({ group, activeSession, onClose }) => (
    <div className="w-70 bg-blue-900 rounded-4xl ml-2 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-200">
          Members ({group?.memberCount || 0})
        </h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition"
        >
          <X className="w-4 h-4 text-gray-300" />
        </button>
      </div>
  
      {/* Active Session Participants */}
      {activeSession && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Session Participants ({activeSession.participants?.length || 0})
          </h3>
          <div className="space-y-2">
            {activeSession.participants?.map((participant) => (
              <div key={participant.user.uid} className="flex items-center gap-3 p-2 bg-green-800 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  {participant.user.photoURL ? (
                    <img 
                      src={participant.user.photoURL} 
                      alt={participant.user.displayName} 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    <span className="text-green-600 font-semibold text-sm">
                      {(participant.user.displayName || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-100">{participant.user.displayName}</p>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      )}
  
      {/* All Members */}
      <div className="space-y-3">
        {group?.members?.map((member) => (
          <div key={member.id || member.uid} className="flex items-center gap-3 p-2 hover:bg-blue-500 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              {member.photoURL ? (
                <img 
                  src={member.photoURL} 
                  alt={member.displayName} 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                <span className="text-gray-200 font-semibold text-sm">
                  {(member.displayName || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-200">{member.displayName}</p>
              {member.yearOfStudy && (
                <p className="text-sm text-gray-500">Year {member.yearOfStudy}</p>
              )}
            </div>
            {group?.createdBy === (member.uid || member.id) && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                Creator
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  