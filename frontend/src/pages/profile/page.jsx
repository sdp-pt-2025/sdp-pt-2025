import React, { useState, useEffect } from 'react';
import { User, Camera, Edit3, Save, X, Mail, MapPin, GraduationCap, BookOpen, Calendar, Clock, Users, Settings, Bell, Loader } from 'lucide-react';
import Sidebar from '../../components/Sidebar/sidebar';
import { auth } from '../../firebase/init';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Get current user ID - replace with your auth system
  const BASE_URL = import.meta.env.VITE_PUBLIC_URL ;
  const {uid} = auth.currentUser

  // Fetch user profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userId = uid
      const response = await fetch(`${BASE_URL}/api/profile?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      if (data.success) {
        setUserData(data.data);
        setEditedData(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update profile data
  const updateProfile = async () => {
    try {
      setSaving(true);
      const userId = uid
      
      const response = await fetch(`${BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...editedData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      if (data.success) {
        setUserData(data.data);
        setEditing(false);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle nested object changes (studyPreferences, availability)
  const handleNestedChange = (parent, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // Handle array changes (modules)
  const handleArrayChange = (field, index, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addModule = () => {
    setEditedData(prev => ({
      ...prev,
      modules: [...(prev.modules || []), '']
    }));
  };

  const removeModule = (index) => {
    setEditedData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className='flex h-screen'>
        <Sidebar/>
     
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center w-full">
        <div className="flex items-center space-x-3 text-blue-600">
          <Loader className="w-8 h-8 animate-spin" />
          <span className="text-lg font-medium">Loading your profile...</span>
        </div>
      </div>
      </div>
    );
  }

 
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStudyStyleColor = (style) => {
    const colors = {
      visual: 'bg-blue-100 text-blue-800',
      auditory: 'bg-green-100 text-green-800',
      kinesthetic: 'bg-purple-100 text-purple-800',
      reading: 'bg-orange-100 text-orange-800'
    };
    return colors[style] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className='flex h-screen'>
      <Sidebar/>
    
    <div className="overflow-y-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 w-full">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-none sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {editing ? (
                <>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditedData(userData);
                      setError(null);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={updateProfile}
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50"
                  >
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-2 px-6 py-2 mr-12 md:mr-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className='hidden md:flex'>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 overflow-hidden">
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-8 text-center text-white">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-lg">
                    <img
                      src={userData?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.displayName || 'User')}&background=3b82f6&color=fff&size=128`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {editing && (
                    <button className="absolute bottom-0 right-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Camera className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className=" flex flex-col justify-center items-center mt-4 mx-auto">
                  {editing ? (
                    <input
                      type="text"
                      value={editedData.displayName || ''}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      className="text-2xl right-5 font-bold bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-center text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Display Name"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold">{userData?.displayName}</h2>
                  )}
                  
                  <div className="flex items-center justify-center mt-2 text-blue-100">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="text-sm">{userData?.email}</span>
                  </div>
                  
                  <div className="flex items-center justify-center mt-1 text-blue-100">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">Joined {formatDate(userData?.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${userData?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className={`w-2 h-2 rounded-full ${userData?.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span>{userData?.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Login</span>
                  <span className="text-sm text-gray-800">
                    {userData?.lastLoginAt ? formatDate(userData.lastLoginAt) : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Academic Information */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 p-8">
              <div className="flex items-center mb-6">
                <GraduationCap className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">Academic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editedData.university || ''}
                      onChange={(e) => handleInputChange('university', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-800">{userData?.university}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editedData.studentId || ''}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="text-gray-800">{userData?.studentId}</span>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Faculty</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editedData.faculty || ''}
                      onChange={(e) => handleInputChange('faculty', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="text-gray-800">{userData?.faculty}</span>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year of Study</label>
                  {editing ? (
                    <select
                      value={editedData.yearOfStudy || ''}
                      onChange={(e) => handleInputChange('yearOfStudy', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                      <option value={5}>5th Year</option>
                      <option value={6}>Postgraduate</option>
                    </select>
                  ) : (
                    <span className="text-gray-800">{userData?.yearOfStudy} Year</span>
                  )}
                </div>
              </div>
            </div>

            {/* Modules */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-800">Modules</h3>
                </div>
                {editing && (
                  <button
                    onClick={addModule}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Add Module
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(editing ? editedData.modules || [] : userData?.modules || []).map((module, index) => (
                  <div key={index} className="relative">
                    {editing ? (
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={module}
                          onChange={(e) => handleArrayChange('modules', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Module code"
                        />
                        <button
                          onClick={() => removeModule(index)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors -right-6 md:-right-4 absolute"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-lg px-4 py-3 text-center">
                        <span className="font-medium text-blue-800">{module}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Study Preferences */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 p-8">
              <div className="flex items-center mb-6">
                <Settings className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">Study Preferences</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Study Style</label>
                  {editing ? (
                    <select
                      value={editedData.studyPreferences?.studyStyle || ''}
                      onChange={(e) => handleNestedChange('studyPreferences', 'studyStyle', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select style</option>
                      <option value="visual">Visual</option>
                      <option value="auditory">Auditory</option>
                      <option value="kinesthetic">Kinesthetic</option>
                      <option value="reading">Reading/Writing</option>
                    </select>
                  ) : (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStudyStyleColor(userData?.studyPreferences?.studyStyle)}`}>
                      {userData?.studyPreferences?.studyStyle || 'Not specified'}
                    </span>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Group Size</label>
                  {editing ? (
                    <select
                      value={editedData.studyPreferences?.groupSize || ''}
                      onChange={(e) => handleNestedChange('studyPreferences', 'groupSize', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select size</option>
                      <option value="individual">Individual</option>
                      <option value="small">Small (2-4 people)</option>
                      <option value="medium">Medium (5-8 people)</option>
                      <option value="large">Large (9+ people)</option>
                    </select>
                  ) : (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-800 capitalize">{userData?.studyPreferences?.groupSize || 'Not specified'}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Location</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editedData.studyPreferences?.location || ''}
                      onChange={(e) => handleNestedChange('studyPreferences', 'location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Library, Coffee shop, Online"
                    />
                  ) : (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-800 capitalize">{userData?.studyPreferences?.location || 'Not specified'}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Study Times</label>
                  {editing ? (
                    <select
                      multiple
                      value={editedData.studyPreferences?.preferredStudyTimes || []}
                      onChange={(e) => handleNestedChange('studyPreferences', 'preferredStudyTimes', Array.from(e.target.selectedOptions, option => option.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      size="4"
                    >
                      <option value="early_morning">Early Morning (6-9 AM)</option>
                      <option value="morning">Morning (9-12 PM)</option>
                      <option value="afternoon">Afternoon (12-5 PM)</option>
                      <option value="evening">Evening (5-9 PM)</option>
                      <option value="night">Night (9 PM+)</option>
                    </select>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(userData?.studyPreferences?.preferredStudyTimes || []).map((time, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                          {time.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Profile;