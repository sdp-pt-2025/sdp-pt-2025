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
import Sidebar from "../../components/Sidebar/sidebar";

const StudyGroupManager = () => {
  const [mode, setMode] = useState(null); // null | "create" | "join"
  const [step, setStep] = useState(1);
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

  const isFormValid = formData.name.trim() && formData.moduleCode;

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Creating study group:", formData);
    alert("Study group created successfully! 🎉");
  };

  
  if (!mode) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="space-y-8 text-center max-w-lg">
          <h1 className="text-4xl font-bold text-gray-900">Study Groups</h1>
          <p className="text-gray-600 text-lg">
            Collaborate with peers or create your own focused study group.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <button
              onClick={() => setMode("join")}
              className="px-8 py-4 bg-gray-100 text-gray-800 rounded-xl font-medium hover:bg-gray-200 transition"
            >
              Join a Group
            </button>
            <button
              onClick={() => setMode("create")}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Create a Group
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Join Screen ---
  if (mode === "join") {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 overflow-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Join a Study Group</h2>
            <p className="text-gray-600">
              Find and join existing groups to collaborate with fellow students.
            </p>
            <input
              type="text"
              placeholder="Search by group name or module..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
            />
            <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
              Search & Join
            </button>
            <button
              onClick={() => setMode(null)}
              className="text-gray-500 hover:text-gray-700 underline w-full text-center mt-2"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Create Screen ---
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex-col min-h-screen bg-gray-50 overflow-y-auto p-6">
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
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
              {[1, 2, 3].map((s) => (
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
                  {s < 3 && <div className={`w-12 h-0.5 mx-2 ${step > s ? "bg-blue-600" : "bg-gray-300"}`}></div>}
                </div>
              ))}
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              {/* Step 1 */}
              {step >= 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-blue-600 font-semibold">
                    <BookOpen className="w-5 h-5" />
                    Basic Information
                  </div>
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
                    <label className="block text-gray-700 font-medium">Module</label>
                    <select
                      value={formData.moduleCode}
                      onChange={(e) => setFormData({ ...formData, moduleCode: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                    >
                      <option value="">Select module...</option>
                      {availableModules.map((mod) => (
                        <option key={mod} value={mod.split(" - ")[0]}>
                          {mod}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-gray-700 font-medium">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      placeholder="Describe your group's vision..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition resize-none"
                    />
                  </div>
                  {isFormValid && (
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                    >
                      Continue to Settings
                    </button>
                  )}
                  {!isFormValid && (
                    <div className="text-center text-gray-500 mt-2">Please fill in required fields</div>
                  )}
                </div>
              )}

              {/* Step 2: Settings */}
              {step >= 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-purple-600 font-semibold">
                    <Users className="w-5 h-5" /> Group Settings
                  </div>
                  <div className="space-y-3">
                    <label className="block text-gray-700 font-medium">Max Members</label>
                    <div className="flex flex-wrap gap-2">
                      {[4, 6, 8, 10, 12].map((num) => (
                        <button
                          key={num}
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
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="privacy"
                          checked={!formData.isPrivate}
                          onChange={() => setFormData({ ...formData, isPrivate: false })}
                          className="sr-only"
                        />
                        <div
                          className={`px-4 py-3 rounded-xl border w-full text-center ${
                            !formData.isPrivate
                              ? "bg-green-50 border-green-500 text-green-700"
                              : "border-gray-300 text-gray-500"
                          }`}
                        >
                          Open
                        </div>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="privacy"
                          checked={formData.isPrivate}
                          onChange={() => setFormData({ ...formData, isPrivate: true })}
                          className="sr-only"
                        />
                        <div
                          className={`px-4 py-3 rounded-xl border w-full text-center ${
                            formData.isPrivate
                              ? "bg-orange-50 border-orange-500 text-orange-700"
                              : "border-gray-300 text-gray-500"
                          }`}
                        >
                          Invite Only
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
                  >
                    Continue to Personalization
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full py-2 text-gray-500 hover:text-gray-700 underline"
                  >
                    ← Back
                  </button>
                </div>
              )}

              {/* Step 3: Tags & Goals */}
              {step >= 3 && (
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
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        disabled={!newTag.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Goals */}
                  <div className="space-y-2">
                    <label className="block text-gray-700 font-medium">Goals</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="e.g., Complete midterm revision"
                        className="flex-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 transition"
                      />
                      <button
                        type="button"
                        onClick={addGoal}
                        disabled={!newGoal.trim()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium disabled:opacity-50"
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
                          <button onClick={() => removeGoal(goal)}>
                            <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition"
                  >
                    Launch Your Study Group
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full py-2 text-gray-500 hover:text-gray-700 underline"
                  >
                    ← Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGroupManager;
