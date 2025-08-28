// @ts-nocheck
import React, { useState } from "react";
import {
  Plus,
  X,
  Users,
  Lock,
  Globe,
  Target,
  Hash,
  Sparkles,
  BookOpen,
  Clock,
} from "lucide-react";
import Sidebar from "@/components/Sidebar/sidebar";

// Mock Sidebar Component since we can't import the actual one

const CreateStudyGroup = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    moduleCode: "",
    maxMembers: 8,
    isPrivate: false,
    tags: [],
    goals: [],
  });

  const [newTag, setNewTag] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [step, setStep] = useState(1);

  // Mock data for module codes
  const availableModules = [
    "CS101 - Introduction to Programming",
    "MATH201 - Calculus II",
    "PHYS301 - Quantum Physics",
    "ENG102 - Academic Writing",
    "BIO250 - Molecular Biology",
    "CHEM150 - Organic Chemistry",
  ];

  const popularTags = [
    "exam-prep",
    "assignments",
    "projects",
    "homework",
    "research",
    "lab-work",
  ];

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
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
      setFormData((prev) => ({
        ...prev,
        goals: [...prev.goals, newGoal.trim()],
      }));
      setNewGoal("");
    }
  };

  const removeGoal = (goalToRemove) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.filter((goal) => goal !== goalToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Creating study group:", formData);
    alert("Study group created successfully! 🎉");
  };

  const isFormValid = formData.name.trim() && formData.moduleCode;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Main content area with sidebar offset */}
      <div className="flex-1 flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 overflow-y-auto">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none ml-64">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            {/* Header */}
            <div className="text-center mb-8 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Create Your Study Group
              </h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                Bring together passionate learners and achieve your academic
                goals together
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                        step >= stepNum
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "bg-white text-gray-400 border-2 border-gray-200"
                      }`}
                    >
                      {stepNum}
                    </div>
                    {stepNum < 3 && (
                      <div
                        className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                          step > stepNum
                            ? "bg-gradient-to-r from-blue-500 to-purple-600"
                            : "bg-gray-200"
                        }`}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Form Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-8 space-y-8">
                {/* Step 1: Basic Info */}
                {step >= 1 && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 text-blue-600 mb-6">
                      <BookOpen className="w-5 h-5" />
                      <span className="font-semibold">Basic Information</span>
                    </div>

                    {/* Group Name */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-800">
                        What should we call your study group? ✨
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="e.g., Calculus Conquerors, Biology Brainiacs..."
                        className="w-full px-6 py-4 bg-white/70 border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 placeholder-gray-400 text-lg font-medium shadow-sm hover:shadow-md backdrop-blur-sm"
                      />
                    </div>

                    {/* Module Code */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-800">
                        Which module are you studying? 📚
                      </label>
                      <div className="relative">
                        <select
                          value={formData.moduleCode}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              moduleCode: e.target.value,
                            }))
                          }
                          className="w-full px-6 py-4 bg-white/70 border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 text-lg font-medium shadow-sm hover:shadow-md backdrop-blur-sm appearance-none cursor-pointer"
                        >
                          <option value="">Choose your module...</option>
                          {availableModules.map((module) => (
                            <option key={module} value={module.split(" - ")[0]}>
                              {module}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45"></div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-800">
                        Tell us about your vision 💭
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="What makes your group special? What will you achieve together? Share your excitement and goals..."
                        rows={4}
                        className="w-full px-6 py-4 bg-white/70 border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 placeholder-gray-400 resize-none shadow-sm hover:shadow-md backdrop-blur-sm"
                      />
                    </div>

                    {isFormValid && (
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 text-white py-4 rounded-2xl font-semibold hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        Continue to Settings
                        <div className="w-5 h-5 border-2 border-white/70 border-r-white rounded-full animate-spin"></div>
                      </button>
                    )}
                  </div>
                )}

                {/* Step 2: Settings */}
                {step >= 2 && (
                  <div
                    className="space-y-6 animate-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: "100ms" }}
                  >
                    <div className="flex items-center gap-3 text-purple-600 mb-6">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">Group Settings</span>
                    </div>

                    {/* Max Members */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-800">
                        How many study buddies? 👥
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {[4, 6, 8, 10, 12, 15, 20].slice(0, 4).map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                maxMembers: num,
                              }))
                            }
                            className={`p-4 rounded-xl border-2 font-semibold transition-all duration-200 ${
                              formData.maxMembers === num
                                ? "border-blue-400 bg-blue-50 text-blue-700 shadow-md scale-105"
                                : "border-gray-200 bg-white/50 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[12, 15, 20].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                maxMembers: num,
                              }))
                            }
                            className={`p-3 rounded-xl border-2 font-semibold transition-all duration-200 ${
                              formData.maxMembers === num
                                ? "border-blue-400 bg-blue-50 text-blue-700 shadow-md scale-105"
                                : "border-gray-200 bg-white/50 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Privacy Setting */}
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-800">
                        Who can join your group? 🔐
                      </label>
                      <div className="grid gap-4">
                        <label className="group relative">
                          <input
                            type="radio"
                            name="privacy"
                            checked={!formData.isPrivate}
                            onChange={() =>
                              setFormData((prev) => ({
                                ...prev,
                                isPrivate: false,
                              }))
                            }
                            className="sr-only"
                          />
                          <div
                            className={`flex items-center gap-4 p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                              !formData.isPrivate
                                ? "border-green-400 bg-green-50/70 shadow-lg scale-[1.02]"
                                : "border-gray-200 bg-white/50 hover:border-green-300 hover:bg-green-50/30"
                            }`}
                          >
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                !formData.isPrivate
                                  ? "bg-green-500 shadow-lg"
                                  : "bg-gray-100"
                              }`}
                            >
                              <Globe
                                className={`w-6 h-6 ${
                                  !formData.isPrivate
                                    ? "text-white"
                                    : "text-gray-400"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 text-lg">
                                Open Community
                              </div>
                              <div className="text-gray-600">
                                Anyone can discover and join your group
                              </div>
                            </div>
                          </div>
                        </label>

                        <label className="group relative">
                          <input
                            type="radio"
                            name="privacy"
                            checked={formData.isPrivate}
                            onChange={() =>
                              setFormData((prev) => ({
                                ...prev,
                                isPrivate: true,
                              }))
                            }
                            className="sr-only"
                          />
                          <div
                            className={`flex items-center gap-4 p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                              formData.isPrivate
                                ? "border-orange-400 bg-orange-50/70 shadow-lg scale-[1.02]"
                                : "border-gray-200 bg-white/50 hover:border-orange-300 hover:bg-orange-50/30"
                            }`}
                          >
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                formData.isPrivate
                                  ? "bg-orange-500 shadow-lg"
                                  : "bg-gray-100"
                              }`}
                            >
                              <Lock
                                className={`w-6 h-6 ${
                                  formData.isPrivate
                                    ? "text-white"
                                    : "text-gray-400"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 text-lg">
                                Invite Only
                              </div>
                              <div className="text-gray-600">
                                You control who joins your group
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="w-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:from-purple-600 hover:via-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      Continue to Customization
                      <Target className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Step 3: Tags and Goals */}
                {step >= 3 && (
                  <div
                    className="space-y-8 animate-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: "200ms" }}
                  >
                    <div className="flex items-center gap-3 text-indigo-600 mb-6">
                      <Hash className="w-5 h-5" />
                      <span className="font-semibold">
                        Personalize Your Group
                      </span>
                    </div>

                    {/* Tags Section */}
                    <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100/50">
                      <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Hash className="w-4 h-4 text-blue-600" />
                        Study Tags
                      </label>

                      {/* Popular Tags */}
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 mb-3 font-medium">
                          Quick picks:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {popularTags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                if (!formData.tags.includes(tag)) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    tags: [...prev.tags, tag],
                                  }));
                                }
                              }}
                              className={`px-4 py-2 text-sm rounded-full border-2 transition-all duration-200 font-medium ${
                                formData.tags.includes(tag)
                                  ? "bg-blue-500 text-white border-blue-500 shadow-lg scale-105"
                                  : "bg-white/80 text-gray-600 border-gray-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:scale-105 hover:shadow-md"
                              }`}
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Add Custom Tag */}
                      <div className="space-y-3">
                        <div className="text-xs text-gray-500 font-medium">
                          Create your own:
                        </div>
                        <div className="flex gap-3 flex-col md:flex-row">
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), addTag())
                            }
                            placeholder="Custom tag name..."
                            className="flex-1 px-4 py-3 bg-white/80 border-2 border-gray-200/50 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all duration-200 font-medium"
                          />
                          <button
                            type="button"
                            onClick={addTag}
                            disabled={!newTag.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Selected Tags */}
                      {formData.tags.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <div className="text-xs text-gray-500 font-medium">
                            Your tags:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 group"
                              >
                                #{tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="hover:bg-white/20 rounded-full p-1 transition-colors ml-1 group-hover:scale-110"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Goals Section */}
                    <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-2xl p-6 border border-purple-100/50">
                      <label className=" text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-600" />
                        Study Goals
                      </label>

                      <div className="flex gap-3 mb-4 flex-col md:flex-row">
                        <input
                          type="text"
                          value={newGoal}
                          onChange={(e) => setNewGoal(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && (e.preventDefault(), addGoal())
                          }
                          placeholder="e.g., Master derivatives before midterm exam..."
                          className="flex-1 px-4 py-3 bg-white/80 border-2 border-gray-200/50 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 text-sm transition-all duration-200 font-medium"
                        />
                        <button
                          type="button"
                          onClick={addGoal}
                          disabled={!newGoal.trim()}
                          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>

                      {formData.goals.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-xs text-gray-500 mb-3 font-medium flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Your goals ({formData.goals.length}):
                          </div>
                          <div className="space-y-2">
                            {formData.goals.map((goal, index) => (
                              <div
                                key={index}
                                className="flex items-start justify-between p-4 bg-white/80 rounded-xl border border-gray-100 hover:border-purple-200 transition-all duration-200 hover:shadow-md group"
                              >
                                <span className="text-sm text-gray-700 flex-1 leading-relaxed font-medium">
                                  🎯 {goal}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeGoal(goal)}
                                  className="ml-3 p-2 text-gray-400 hover:text-red-500 transition-all duration-200 rounded-lg hover:bg-red-50 flex-shrink-0 opacity-0 group-hover:opacity-100 transform hover:scale-110"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Final Submit Button */}
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-5 rounded-2xl font-bold text-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl hover:shadow-3xl flex items-center justify-center gap-3 relative overflow-hidden group"
                      >
                        {/* Animated gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <Sparkles className="w-6 h-6 animate-pulse" />
                        Launch Your Study Group
                        <Sparkles
                          className="w-6 h-6 animate-pulse"
                          style={{ animationDelay: "1s" }}
                        />
                      </button>
                    </div>

                    {/* Back Button */}
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="w-full py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                    >
                      ← Back to previous step
                    </button>
                  </div>
                )}

                {/* Step Navigation for incomplete steps */}
                {step < 2 && !isFormValid && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-50 text-amber-700 rounded-full font-medium border border-amber-200">
                      <Clock className="w-4 h-4" />
                      Please fill in the required fields to continue
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          {/* <div className="text-center mt-8 text-gray-500 text-sm">
            <p>✨ Creating amazing study experiences, one group at a time</p>
          </div> */}
        </div>
      </div>
    </div>
    // </div>
  );
};

export default CreateStudyGroup;
