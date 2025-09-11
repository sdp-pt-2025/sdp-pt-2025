// @ts-nocheck
import Sidebar from "../../components/Sidebar/sidebar";
import { useState } from "react";
import { myPartnersData, recommendedPartners } from "../../lib/constants/features";


function PartnerModal({ partner, isOpen, onClose }) {
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
            <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-1">{partner.name}</h3>
            <p className="text-blue-600 font-medium mb-2">{partner.course}</p>
            <span className="inline-block bg-gray-100 text-slate-600 px-3 py-1 rounded-full text-sm">
              {partner.year} Year
            </span>
          </div>

          {/* Modules Section */}
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-3">Modules</h4>
            <div className="space-y-3">
              {partner.modules.map((module, index) => (
                <div key={index} className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-semibold text-blue-700 bg-blue-200 px-2 py-1 rounded">
                      {module.code}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{module.name}</span>
                  </div>
                  
                  {/* Topics for this module */}
                  {module.topics && module.topics.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-slate-600 mb-2">Topics:</p>
                      <div className="flex flex-wrap gap-1">
                        {module.topics.map((topic, topicIndex) => (
                          <span
                            key={topicIndex}
                            className="text-xs bg-white text-slate-600 px-2 py-1 rounded border"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Send Message
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
  const [addedPartners, setAddedPartners] = useState(new Set());
  const [showAllPartners, setShowAllPartners] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAdd = (partnerId) => {
    setAddedPartners((prev) => new Set([...prev, partnerId]));
  };

  const handleRemove = (partnerId) => {
    setAddedPartners((prev) => {
      const newSet = new Set(prev);
      newSet.delete(partnerId);
      return newSet;
    });
  };

  const handleView = (partner) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPartner(null);
  };

  const toggleViewAll = () => {
    setShowAllPartners(!showAllPartners);
  };

  const displayedPartners = showAllPartners ? myPartnersData : myPartnersData.slice(0, 3);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 p-3 sm:p-6 bg-slate-100 overflow-y-auto">
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-800 to-gray-500 bg-clip-text text-transparent">Find Partners</h1>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-slate-600 font-medium text-sm sm:text-base">JD</span>
              </div>
              <span className="text-slate-800 font-medium text-sm sm:text-base">John Doe</span>
            </div>
          </div>

          {/* Recommended Section */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">Recommended</h2>
            <div className="overflow-x-auto">
              <div className="flex space-x-4 pb-2" style={{width: 'max-content'}}>
                {recommendedPartners.map((partner) => (
                  <div key={partner.id} className="bg-white rounded-2xl p-4 shadow-sm flex-shrink-0 w-64 sm:w-72">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded-full"></div>
                        <div>
                          <h3 className="font-semibold text-slate-800 text-sm sm:text-base">{partner.name}</h3>
                          <p className="text-xs sm:text-sm text-slate-600">{partner.course}</p>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm text-slate-500 bg-gray-100 px-2 py-1 rounded">
                        {partner.year}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {partner.modules.slice(0, 2).map((module, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {module.code}
                          </span>
                          <span className="text-xs sm:text-sm text-slate-600 truncate">{module.name}</span>
                        </div>
                      ))}
                      {partner.modules.length > 2 && (
                        <p className="text-xs text-slate-500">+{partner.modules.length - 2} more modules</p>
                      )}
                    </div>

                    <div className="flex space-x-2 justify-center">
                      <button 
                        onClick={() => handleAdd(partner.id)}
                        className="flex-1 px-4 bg-blue-800 text-white py-2 rounded text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors"
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
          </div>

          {/* My Partners Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">
                My Partners
              </h2>
              <button 
                onClick={toggleViewAll}
                className="text-slate-600 hover:text-slate-800 font-medium text-sm sm:text-base"
              >
                {showAllPartners ? 'Show less' : 'View all'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayedPartners.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded-full"></div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
                          {item.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-blue-600">
                          {item.course}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm text-slate-500 bg-gray-100 px-2 py-1 rounded">
                      {item.year}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base">
                      Modules
                    </h4>
                    <div className="flex space-x-2 flex-wrap gap-1">
                      <div className="flex items-center space-x-1 bg-blue-100 rounded px-2 py-1">
                        <span className="text-xs font-semibold text-blue-600">
                          CGV
                        </span>
                        <span className="text-xs text-slate-600">
                          Computer Graphics & Visualisation
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 bg-blue-100 rounded px-2 py-1">
                        <span className="text-xs font-semibold text-blue-600">
                          SDP
                        </span>
                        <span className="text-xs text-slate-600">
                          Software Design Proj
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base">Topics</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="bg-gray-100 rounded p-2">
                        <div className="text-xs font-semibold text-slate-700 mb-1">
                          CGV
                        </div>
                        <ul className="text-xs text-slate-600 space-y-0.5">
                          <li>• OpenGL</li>
                          <li>• Basics</li>
                          <li>• Ray Lighting</li>
                        </ul>
                      </div>
                      <div className="bg-gray-100 rounded p-2">
                        <div className="text-xs font-semibold text-slate-700 mb-1">
                          SDP
                        </div>
                        <ul className="text-xs text-slate-600 space-y-0.5">
                          <li>• UML</li>
                          <li>• Design Patterns</li>
                          <li>• Testing</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 justify-center">
                    <button className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors">
                      Chat
                    </button>
                    <button 
                      onClick={() => handleView(item)}
                      className="px-3 sm:px-4 py-2 text-blue-600 rounded text-xs sm:text-sm font-medium bg-gray-200 hover:bg-blue-50 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      <PartnerModal 
        partner={selectedPartner} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </div>
  );
}