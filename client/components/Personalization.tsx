"use client";

import { useState } from "react";
import { X, Palette, BookOpen } from "lucide-react";

type PersonalizationProps = {
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
};

export default function Personalization({ isOpen, onClose, theme, onThemeChange }: PersonalizationProps) {
  const [preferences, setPreferences] = useState({
    colorScheme: "blue",
    accentColor: "blue",
    defaultView: "chat",
    compactMode: false,
    autoPlaySummary: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleColorChange = (color: string) => {
    setPreferences((prev) => ({ ...prev, colorScheme: color }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    console.log("Personalization saved:", preferences);
  };

  if (!isOpen) return null;

  const colorOptions = [
    { name: "Blue", value: "blue", bg: "bg-blue-600" },
    { name: "Purple", value: "purple", bg: "bg-purple-600" },
    { name: "Indigo", value: "indigo", bg: "bg-indigo-600" },
    { name: "Green", value: "green", bg: "bg-green-600" },
    { name: "Red", value: "red", bg: "bg-red-600" },
    { name: "Orange", value: "orange", bg: "bg-orange-600" },
  ];

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Palette size={24} />
            Personalization
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Theme Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Theme</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-medium block">Light Mode</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Bright and clean interface</p>
                </div>
                <button
                  onClick={() => onThemeChange?.("light")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === "light"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {theme === "light" ? "Active" : "Switch"}
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-medium block">Dark Mode</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Easy on the eyes</p>
                </div>
                <button
                  onClick={() => onThemeChange?.("dark")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === "dark"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {theme === "dark" ? "Active" : "Switch"}
                </button>
              </div>
            </div>
          </div>

          {/* Accent Color Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Accent Color</h3>
            <div className="grid grid-cols-3 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    preferences.colorScheme === color.value
                      ? "border-slate-900 dark:border-slate-100 scale-105"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className={`w-full h-12 rounded-lg ${color.bg} mb-2`} />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{color.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* View Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">View Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <label className="text-slate-700 dark:text-slate-300 font-medium">Compact Mode</label>
                <button
                  onClick={() => setPreferences((prev) => ({ ...prev, compactMode: !prev.compactMode }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    preferences.compactMode ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      preferences.compactMode ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 px-4">
                Reduces spacing and font sizes for more content on screen
              </p>
            </div>
          </div>

          {/* Content Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <BookOpen size={20} />
              Content Preferences
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-medium block">Auto-Play Summary</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Automatically play summaries of long responses</p>
                </div>
                <button
                  onClick={() => setPreferences((prev) => ({ ...prev, autoPlaySummary: !prev.autoPlaySummary }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    preferences.autoPlaySummary ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      preferences.autoPlaySummary ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
