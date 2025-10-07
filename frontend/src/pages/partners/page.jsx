import Sidebar from "../../components/Sidebar/sidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { MessageCircle } from "lucide-react";
import { auth } from "../../firebase/init";


function FriendRequestsModal({ requests, isOpen, onClose, onAccept, onReject }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Friend Requests</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No pending friend requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.requestId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                      {request.photoURL ? (
                        <img src={request.photoURL} alt={request.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                          {request.displayName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800">{request.displayName}</h3>
                      <p className="text-xs text-slate-500">{request.faculty || "Unknown faculty"}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onAccept(request.requestId, request.uid || request.user?.uid)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => onReject(request.requestId)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700"
                    >
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
}


function PartnerModal({ partner, isOpen, onClose, onStartChat }) {
  if (!isOpen || !partner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Partner Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Partner Info */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4 overflow-hidden">
              {partner.photoURL ? (
                <img src={partner.photoURL} alt={partner.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                  {partner.displayName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-1">{partner.displayName}</h3>
            <p className="text-blue-600 font-medium mb-2">{partner.faculty}</p>
            <span className="inline-block bg-gray-100 text-slate-600 px-3 py-1 rounded-full text-sm">
              Year {partner.yearOfStudy}
            </span>
          </div>

          {/* Modules Section */}
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-3">Modules</h4>
            <div className="space-y-3">
              {partner.modules?.map((module, index) => (
                <div key={index} className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-semibold text-blue-700 bg-blue-200 px-2 py-1 rounded">
                      {module.split(' - ')[0]}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{module.split(' - ')[1] || module}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Modules */}
          {partner.commonModules && partner.commonModules.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-slate-800 mb-3">Common Modules</h4>
              <div className="flex flex-wrap gap-2">
                {partner.commonModules.map((module, index) => (
                  <span
                    key={index}
                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200"
                  >
                    {module}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Similarity Score */}
          {partner.similarityScore && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-slate-600">
                Compatibility: <span className="text-blue-600 font-semibold">{partner.similarityScore}%</span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button 
              onClick={() => onStartChat(partner.uid)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Start Chat</span>
            </button>
            <button className="w-full bg-gray-100 text-slate-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              View Full Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Partners() {
  const navigate = useNavigate();
  const [recommendedPartners, setRecommendedPartners] = useState([]);
  const [myPartners, setMyPartners] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [showAllPartners, setShowAllPartners] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);

  const BASE_URL = import.meta.env.VITE_PUBLIC_URL;
  const currentUser = auth.currentUser;

  // Fetch all data on component mount
  useEffect(() => {
    if (currentUser) {
      fetchInitialData();
    }
  }, [currentUser]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRecommendedPartners(),
        fetchMyPartners(),
        fetchPendingRequests()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load partner data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedPartners = async () => {
    try {
      setRecommendedLoading(true);
      const userId = currentUser.uid;
      
      const response = await fetch(
        `${BASE_URL}/api/find-friends/recommended?limit=10&userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        setRecommendedPartners(result.data.results || []);
      } else {
        console.error('Failed to fetch recommended partners:', result.error);
      }
    } catch (error) {
      console.error('Error fetching recommended partners:', error);
    } finally {
      setRecommendedLoading(false);
    }
  };

  const fetchMyPartners = async () => {
    try {
      const userId = currentUser.uid;
      const response = await fetch(
        `${BASE_URL}/api/find-friends?status=accepted&userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        setMyPartners(result.data || []);
      } else {
        console.error('Failed to fetch partners:', result.error);
        toast.error('Failed to load partners');
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('Error loading partners');
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const userId = currentUser.uid;
      const response = await fetch(
        `${BASE_URL}/api/find-friends/requests?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Ensure each request has uid
        const requestsWithUid = result.data.map(request => ({
          ...request,
          uid: request.uid || request.user?.uid
        }));
        setPendingRequests(requestsWithUid);
      } else {
        console.error('Failed to fetch pending requests:', result.error);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const handleStartChat = async (partnerId) => {
    try {
      // Navigate to chat page with partner ID
      navigate(`/chats?partnerId=${partnerId}`);
      closeModal();
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const handleAcceptRequest = async (requestId, userId) => {
    try {
      const loadingToast = toast.loading('Accepting friend request...', { duration: 2000});
      
      const response = await fetch(`${BASE_URL}/api/find-friends/request/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.uid,
          friendId: userId
        }),
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }
      
      const result = await response.json();
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success('Friend request accepted!');
        fetchPendingRequests();
        fetchMyPartners();
        fetchRecommendedPartners();
      } else {
        toast.error(result.error || 'Failed to accept friend request');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const loadingToast = toast.loading('Rejecting friend request...');
      
      const response = await fetch(`${BASE_URL}/api/find-friends/request/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.uid
        }),
      });
      
      const result = await response.json();
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success('Friend request rejected');
        fetchPendingRequests();
      } else {
        toast.error(result.error || 'Failed to reject friend request');
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('Failed to reject friend request');
    }
  };

  const handleSendFriendRequest = async (partnerId) => {
    try {
      const loadingToast = toast.loading('Sending friend request...');
      const userId = currentUser.uid;
      
      const response = await fetch(`${BASE_URL}/api/find-friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requesterId: userId,
          receiverId: partnerId,
          message: 'Hi! I would like to be study partners.'
        }),
      });
      
      const result = await response.json();
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success('Friend request sent successfully!');
        fetchRecommendedPartners();
      } else {
        toast.error(result.error || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  const handleRemovePartner = async (friendshipId, partnerUserId) => {
    try {
      const loadingToast = toast.loading('Removing partner...', { duration: 2000 });
      
      const response = await fetch(`${BASE_URL}/api/find-friends/${friendshipId}/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.uid,
          partnerId: partnerUserId
        }),
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }
      
      const result = await response.json();
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success('Partner removed successfully!');
        fetchMyPartners();
        fetchRecommendedPartners();
      } else {
        toast.error(result.error || 'Failed to remove partner');
      }
    } catch (error) {
      console.error('Error removing partner:', error);
      toast.error('Failed to remove partner. Please try again.');
    }
  };
  

  const handleView = (partner) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPartner(null);
  };

  const closeRequestsModal = () => {
    setIsRequestsModalOpen(false);
  };

  const toggleViewAll = () => {
    setShowAllPartners(!showAllPartners);
  };

  const displayedPartners = showAllPartners ? myPartners : myPartners.slice(0, 3);

  const getModuleCode = (moduleString) => {
    if (typeof moduleString !== 'string') return moduleString;
    return moduleString.split(' - ')[0] || moduleString.substring(0, 8);
  };

  const getModuleName = (moduleString) => {
    if (typeof moduleString !== 'string') return moduleString;
    return moduleString.split(' - ')[1] || moduleString.substring(8);
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-6 bg-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading partners...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 p-3 sm:p-6 bg-slate-100 overflow-y-auto">
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-800 to-gray-500 bg-clip-text text-transparent">Find Partners</h1>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-600 font-medium text-sm sm:text-base">
                    {currentUser?.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                )}
              </div>
              <span className="text-slate-800 font-medium text-sm sm:text-base">{currentUser?.displayName || 'User'}</span>
            </div>
          </div>

          {/* Pending Requests Section */}
          {pendingRequests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">Pending Requests</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm mb-2">
                  You have {pendingRequests.length} pending friend request{pendingRequests.length > 1 ? 's' : ''}
                </p>
                <button 
                  className="text-yellow-700 hover:text-yellow-900 font-medium text-sm underline"
                  onClick={() => setIsRequestsModalOpen(true)}
                >
                  View Requests
                </button>
              </div>
            </div>
          )}

          {/* Recommended Section */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">Recommended</h2>
            {recommendedLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recommendedPartners.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="flex space-x-4 pb-2" style={{width: 'max-content'}}>
                  {recommendedPartners.map((partner) => (
                    <div key={partner.uid} className="bg-white rounded-2xl p-4 shadow-sm flex-shrink-0 w-64 sm:w-72">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded-full overflow-hidden">
                            {partner.photoURL ? (
                              <img src={partner.photoURL} alt={partner.displayName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                                {partner.displayName?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800 text-sm sm:text-base">{partner.displayName}</h3>
                            <p className="text-xs sm:text-sm text-slate-600">{partner.faculty}</p>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm text-slate-500 bg-gray-100 px-2 py-1 rounded">
                          Year {partner.yearOfStudy}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {partner.modules && partner.modules.slice(0, 2).map((module, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              {getModuleCode(module)}
                            </span>
                            <span className="text-xs sm:text-sm text-slate-600 truncate">{getModuleName(module)}</span>
                          </div>
                        ))}
                        {partner.modules && partner.modules.length > 2 && (
                          <p className="text-xs text-slate-500">+{partner.modules.length - 2} more modules</p>
                        )}
                        {partner.similarityScore && (
                          <div className="text-xs text-green-600 font-medium">
                            {partner.similarityScore}% compatibility
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 justify-center">
                        <button 
                          onClick={() => handleSendFriendRequest(partner.uid)}
                          className="flex-1 px-4 bg-blue-800! text-white py-2 rounded text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          + Add
                        </button>
                        <button 
                          onClick={() => handleView(partner)}
                          className="flex-1 px-4 py-2 text-blue-800 border border-blue-600 bg-gray-200 rounded text-xs sm:text-sm font-medium hover:bg-blue-50 transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500">No recommended partners found. Try updating your profile with more modules.</p>
              </div>
            )}
          </div>

          {/* My Partners Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">
                My Partners ({myPartners.length})
              </h2>
              {myPartners.length > 3 && (
                <button 
                  onClick={toggleViewAll}
                  className="text-slate-600 hover:text-slate-800 font-medium text-sm sm:text-base"
                >
                  {showAllPartners ? 'Show less' : 'View all'}
                </button>
              )}
            </div>

            {myPartners.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {displayedPartners.map((partner) => (
                  <div key={partner.uid} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded-full overflow-hidden">
                          {partner.photoURL ? (
                            <img src={partner.photoURL} alt={partner.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                              {partner.displayName?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
                            {partner.displayName}
                          </h3>
                          <p className="text-xs sm:text-sm text-blue-600">
                            {partner.faculty}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm text-slate-500 bg-gray-100 px-2 py-1 rounded">
                        Year {partner.yearOfStudy}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base">
                        Modules
                      </h4>
                      <div className="space-y-1">
                        {partner.modules && partner.modules.slice(0, 2).map((module, index) => (
                          <div key={index} className="flex items-center space-x-1 bg-blue-100 rounded px-2 py-1">
                            <span className="text-xs font-semibold text-blue-600">
                              {getModuleCode(module)}
                            </span>
                            <span className="text-xs text-slate-600 truncate">
                              {getModuleName(module)}
                            </span>
                          </div>
                        ))}
                        {partner.modules && partner.modules.length > 2 && (
                          <p className="text-xs text-slate-500">+{partner.modules.length - 2} more modules</p>
                        )}
                      </div>
                    </div>

                    {partner.friendsSince && (
                      <div className="mb-4">
                        <p className="text-xs text-slate-500">
                          Friends since {new Date(partner.friendsSince).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-2 justify-center">
                      <button 
                        onClick={() => handleStartChat(partner.uid)}
                        className="bg-blue-600! text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium hover:bg-blue-700! transition-colors flex items-center space-x-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Chat</span>
                      </button>
                      <button 
                        onClick={() => handleView(partner)}
                        className="px-3 sm:px-4 py-2 text-blue-600 rounded text-xs sm:text-sm font-medium bg-gray-200 hover:bg-blue-50 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleRemovePartner(partner.friendshipId, partner.uid)}
                        className="bg-red-600! text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium hover:bg-red-700! transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-4">You haven't added any study partners yet.</p>
                <p className="text-sm text-gray-400">Check out the recommended partners above to get started!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <PartnerModal
        partner={selectedPartner}
        isOpen={isModalOpen}
        onClose={closeModal}
        onStartChat={handleStartChat}
      />

      <FriendRequestsModal
        requests={pendingRequests}
        isOpen={isRequestsModalOpen}
        onClose={closeRequestsModal}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
      />
    </div>
  );
}