import React, { useState } from "react";
import {
  X,
  Users,
  Lock,
  Globe,
  Hash,
  BookOpen,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  MapPin
} from "lucide-react";
import toast from "react-hot-toast";

const CreateGroupForm = ({ onBack, currentUser, baseUrl, onGroupCreated }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    modules: [], 
    topic: "",
    maxMembers: 8,
    isPrivate: false,
    tags: [],
    goals: [],
    schedule: {
      frequency: "", 
      dayOfWeek: "", 
      time: "", 
      duration: "", 
      startDate: "",
      endDate: "",
      timezone: "UTC+2" 
    },
    location: {
      type: "in-person", 
      venue: "", 
      address: "",
      coordinates: null
    }
  });
  const [newTag, setNewTag] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [newModule, setNewModule] = useState("");

  const popularTags = [
    "exam-prep",
    "assignments",
    "projects",
    "homework",
    "research",
    "lab-work",
  ];

  const frequencyOptions = [
    { value: "weekly", label: "Weekly" },
    { value: "bi-weekly", label: "Bi-weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "one-time", label: "One-time" }
  ];

  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  const locationTypes = [
    { value: "in-person", label: "In-Person", icon: MapPin },
    { value: "online", label: "Online", icon: Globe },
    { value: "hybrid", label: "Hybrid", icon: Users }
  ];

  const isFormValid = formData.name.trim() && formData.modules.length > 0 && formData.topic.trim();

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addGoal = () => {
    if (newGoal.trim() && !formData.goals.includes(newGoal.trim())) {
      setFormData((prev) => ({ ...prev, goals: [...prev.goals, newGoal.trim()] }));
      setNewGoal("");
    }
  };

  const removeGoal = (goalToRemove) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.filter((goal) => goal !== goalToRemove),
    }));
  };

  const addModule = () => {
    if (newModule.trim() && !formData.modules.includes(newModule.trim())) {
      setFormData((prev) => ({ ...prev, modules: [...prev.modules, newModule.trim()] }));
      setNewModule("");
    }
  };

  const removeModule = (moduleToRemove) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.filter((module) => module !== moduleToRemove),
    }));
  };

  const handleScheduleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [field]: value
      }
    }));
  };

  const handleLocationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      
      const scheduleData = formData.schedule.frequency ? {
        frequency: formData.schedule.frequency,
        dayOfWeek: formData.schedule.dayOfWeek,
        time: formData.schedule.time,
        duration: parseInt(formData.schedule.duration) || null,
        startDate: formData.schedule.startDate || null,
        endDate: formData.schedule.endDate || null,
        timezone: formData.schedule.timezone
      } : null;

     
      const locationData = {
        type: formData.location.type,
        venue: formData.location.venue || null,
        address: formData.location.address || null,
        coordinates: formData.location.coordinates || null
      };

      const response = await fetch(`${baseUrl}/api/study-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          module: formData.modules.join(', '), 
          topic: formData.topic,
          createdBy: currentUser.uid,
          createdByName: currentUser.displayName,
          maxMembers: formData.maxMembers,
          isPublic: !formData.isPrivate,
          tags: formData.tags,
          location: locationData,
          schedule: scheduleData,
          email: currentUser.email,
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Study group created successfully!', { duration: 5000});
        
        setFormData({
          name: "",
          description: "",
          modules: [],
          topic: "",
          maxMembers: 8,
          isPrivate: false,
          tags: [],
          goals: [],
          schedule: {
            frequency: "",
            dayOfWeek: "",
            time: "",
            duration: "",
            startDate: "",
            endDate: "",
            timezone: "UTC+2"
          },
          location: {
            type: "in-person",
            venue: "",
            address: "",
            coordinates: null
          }
        });
        setStep(1);
        
        // Call success callback
        if (onGroupCreated) {
          onGroupCreated(result.data);
        }
        
        // Go back to browse view, not the hom page
        onBack();
      } else {
        toast.error(result.error || 'Failed to create study group');
      }
    } catch (error) {
      console.error('Error creating study group:', error);
      toast.error('Failed to create study group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto p-6">
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ChevronRight className="w-4 h-4 transform rotate-180" />
            Back to Groups
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Create Your Study Group
            </h1>
            <p className="text-gray-600 mt-2">
              Bring together passionate learners and achieve your academic goals.
            </p>
          </div>

          {/* Step Progress */}
          <div className="flex justify-center mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition ${
                    step >= s
                      ? "bg-blue-600 text-white shadow"
                      : "bg-white text-gray-400 border border-gray-300"
                  }`}
                >
                  {s}
                </div>
                {s < 4 && <div className={`w-12 h-0.5 mx-2 ${step > s ? "bg-blue-600" : "bg-gray-300"}`}></div>}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            {/* Step 1: Basic Information */}
            {step >= 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                  <BookOpen className="w-5 h-5" />
                  Basic Information
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-gray-700 font-medium">Group Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Calculus Conquerors"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-gray-700 font-medium">Topic</label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="e.g., Exam Preparation, Project Work"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-gray-700 font-medium">Modules</label>
                  <div className="flex flex-col md:flex-row gap-2">
                    <input
                      type="text"
                      value={newModule}
                      onChange={(e) => setNewModule(e.target.value)}
                      placeholder="e.g., COMS3012 - Computer Graphics"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addModule())}
                    />
                    <button
                      type="button"
                      onClick={addModule}
                      disabled={!newModule.trim()}
                      className="px-6 text-center py-3 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-blue-700 transition flex items-center gap-2 justify-center"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  {formData.modules.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.modules.map((module) => (
                        <div
                          key={module}
                          className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-full text-sm font-medium"
                        >
                          {module}
                          <button
                            type="button"
                            onClick={() => removeModule(module)}
                            className="hover:text-blue-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-gray-700 font-medium">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Describe your group's vision and what you hope to achieve together..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition resize-none"
                  />
                </div>

                {isFormValid && step === 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                  >
                    Continue to Settings
                  </button>
                )}
                {!isFormValid && step === 1 && (
                  <div className="text-center text-gray-500 mt-2">Please fill in group name, at least one module, and topic</div>
                )}
              </div>
            )}

            {/* Step 2: Group Settings */}
            {step >= 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-purple-600 font-semibold">
                  <Users className="w-5 h-5" /> Group Settings
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-gray-700 font-medium">Max Members</label>
                    <div className="flex flex-wrap gap-2">
                      {[4, 6, 8, 10, 12, 15, 20].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setFormData({ ...formData, maxMembers: num })}
                          className={`px-4 py-2 rounded-xl border font-medium ${
                            formData.maxMembers === num
                              ? "bg-blue-50 border-blue-500 text-blue-700 shadow"
                              : "border-gray-300 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-gray-700 font-medium">Privacy</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="radio"
                          name="privacy"
                          checked={!formData.isPrivate}
                          onChange={() => setFormData({ ...formData, isPrivate: false })}
                          className="sr-only"
                        />
                        <div
                          className={`px-4 py-3 rounded-xl border w-full text-center flex items-center justify-center gap-2 ${
                            !formData.isPrivate
                              ? "bg-green-50 border-green-500 text-green-700"
                              : "border-gray-300 text-gray-500"
                          }`}
                        >
                          <Globe className="w-4 h-4" />
                          Public
                        </div>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="radio"
                          name="privacy"
                          checked={formData.isPrivate}
                          onChange={() => setFormData({ ...formData, isPrivate: true })}
                          className="sr-only"
                        />
                        <div
                          className={`px-4 py-3 rounded-xl border w-full text-center flex items-center justify-center gap-2 ${
                            formData.isPrivate
                              ? "bg-orange-50 border-orange-500 text-orange-700"
                              : "border-gray-300 text-gray-500"
                          }`}
                        >
                          <Lock className="w-4 h-4" />
                          Private
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {step === 2 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
                    >
                      Continue to Schedule & Location
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full py-2 text-gray-500 hover:text-gray-700 underline"
                    >
                      ← Back
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Schedule & Location */}
            {step >= 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <Calendar className="w-5 h-5" />
                  Schedule & Location
                </div>

                {/* Location Type */}
                <div className="space-y-3">
                  <label className="block text-gray-700 font-medium">Location Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {locationTypes.map((type) => (
                      <label key={type.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="locationType"
                          value={type.value}
                          checked={formData.location.type === type.value}
                          onChange={(e) => handleLocationChange('type', e.target.value)}
                          className="sr-only"
                        />
                        <div
                          className={`p-4 rounded-xl border text-center flex flex-col items-center gap-2 ${
                            formData.location.type === type.value
                              ? "bg-green-50 border-green-500 text-green-700"
                              : "border-gray-300 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <type.icon className="w-5 h-5" />
                          <span className="font-medium">{type.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Location Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-gray-700 font-medium">
                      {formData.location.type === 'online' ? 'Platform' : 'Venue'}
                    </label>
                    <input
                      type="text"
                      value={formData.location.venue}
                      onChange={(e) => handleLocationChange('venue', e.target.value)}
                      placeholder={
                        formData.location.type === 'online' 
                          ? 'e.g., Zoom, Teams, Discord' 
                          : 'e.g., Library Study Room 3'
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 transition"
                    />
                  </div>

                  {formData.location.type !== 'online' && (
                    <div className="space-y-3">
                      <label className="block text-gray-700 font-medium">Address</label>
                      <input
                        type="text"
                        value={formData.location.address}
                        onChange={(e) => handleLocationChange('address', e.target.value)}
                        placeholder="e.g., University of the Witwatersrand, Johannesburg"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 transition"
                      />
                    </div>
                  )}
                </div>

                {/* Schedule */}
                <div className="space-y-4">
                  <h4 className="text-gray-700 font-medium">Schedule (Optional)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm text-gray-600">Frequency</label>
                      <select
                        value={formData.schedule.frequency}
                        onChange={(e) => handleScheduleChange('frequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                      >
                        <option value="">Select frequency...</option>
                        {frequencyOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm text-gray-600">Day</label>
                      <select
                        value={formData.schedule.dayOfWeek}
                        onChange={(e) => handleScheduleChange('dayOfWeek', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                        disabled={!formData.schedule.frequency}
                      >
                        <option value="">Select day...</option>
                        {daysOfWeek.map((day) => (
                          <option key={day} value={day.toLowerCase()}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm text-gray-600">Time</label>
                      <input
                        type="time"
                        value={formData.schedule.time}
                        onChange={(e) => handleScheduleChange('time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                        disabled={!formData.schedule.frequency}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm text-gray-600">Duration (minutes)</label>
                      <input
                        type="number"
                        value={formData.schedule.duration}
                        onChange={(e) => handleScheduleChange('duration', e.target.value)}
                        placeholder="e.g., 120"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                        disabled={!formData.schedule.frequency}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.schedule.startDate}
                        onChange={(e) => handleScheduleChange('startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                        disabled={!formData.schedule.frequency}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.schedule.endDate}
                        onChange={(e) => handleScheduleChange('endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                        disabled={!formData.schedule.frequency}
                        min={formData.schedule.startDate}
                      />
                    </div>
                  </div>
                </div>

                {step === 3 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
                    >
                      Continue to Personalization
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full py-2 text-gray-500 hover:text-gray-700 underline"
                    >
                      ← Back
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Step 4: Tags & Goals */}
            {step >= 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                  <Hash className="w-5 h-5" /> Personalization
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (!formData.tags.includes(tag)) {
                            setFormData({ ...formData, tags: [...formData.tags, tag] });
                          }
                        }}
                        className={`px-3 py-1 rounded-full border text-sm font-medium ${
                          formData.tags.includes(tag)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Custom tag..."
                      className="flex-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 transition"
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={!newTag.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-blue-700 transition"
                    >
                      Add
                    </button>
                  </div>

                  {/* Show selected tags */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <div
                          key={tag}
                          className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Goals */}
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">Goals (Optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="e.g., Complete midterm revision"
                      className="flex-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 transition"
                      onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                    />
                    <button
                      type="button"
                      onClick={addGoal}
                      disabled={!newGoal.trim()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-purple-700 transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1 mt-2">
                    {formData.goals.map((goal, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-200"
                      >
                        <span>{goal}</span>
                        <button 
                          type="button"
                          onClick={() => removeGoal(goal)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Creating...
                    </>
                  ) : (
                    'Launch Your Study Group'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full py-2 text-gray-500 hover:text-gray-700 underline"
                  disabled={loading}
                >
                  ← Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupForm;