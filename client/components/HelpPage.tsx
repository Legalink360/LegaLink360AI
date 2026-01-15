"use client";

import { useState } from "react";
import { X, MessageCircle, Mail, AlertCircle } from "lucide-react";

type HelpPageProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function HelpPage({ isOpen, onClose }: HelpPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("general");

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const faqCategories: Record<string, Array<{ q: string; a: string }>> = {
    general: [
      {
        q: "What is LegaLink360 AI?",
        a: "LegaLink360 AI is an intelligent legal assistant powered by advanced AI technology. It helps you understand complex legal concepts, review contracts, and get guidance on various legal matters.",
      },
      {
        q: "How do I start a new chat?",
        a: "Click the 'New Chat' button in the sidebar to start a fresh conversation. You can also browse your chat history to continue previous discussions.",
      },
      {
        q: "Can I export my conversations?",
        a: "Yes, you can save and export your conversations from the chat interface. Look for the export option in the chat menu.",
      },
    ],
    account: [
      {
        q: "How do I change my password?",
        a: "Go to Settings > Privacy & Security and click 'Change Password'. You'll be prompted to enter your current password and then your new password.",
      },
      {
        q: "How do I enable two-factor authentication?",
        a: "Navigate to Settings > Privacy & Security and toggle 'Two-Factor Authentication'. Follow the prompts to set it up.",
      },
      {
        q: "How can I delete my account?",
        a: "Go to Profile Settings > Danger Zone and click 'Delete Account'. Note that this action is permanent and cannot be undone.",
      },
    ],
    billing: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for enterprise plans.",
      },
      {
        q: "Can I upgrade or downgrade my plan anytime?",
        a: "Yes, you can change your plan at any time. Changes take effect at the start of your next billing cycle.",
      },
      {
        q: "Is there a free trial available?",
        a: "Yes, we offer a 14-day free trial with full access to all features. No credit card required to start.",
      },
    ],
  };

  const categories = [
    { id: "general", label: "General" },
    { id: "account", label: "Account" },
    { id: "billing", label: "Billing" },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Help & Support</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Categories */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqCategories[selectedCategory]?.map((item, idx) => (
              <div
                key={idx}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">Q:</span>
                  {item.q}
                </h3>
                <p className="text-slate-700 dark:text-slate-400 flex gap-2">
                  <span className="text-green-600 dark:text-green-400 font-semibold">A:</span>
                  {item.a}
                </p>
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-blue-600 dark:text-blue-400" />
              Didn't find what you're looking for?
            </h3>
            <p className="text-slate-700 dark:text-slate-400 mb-4">
              Our support team is here to help! Reach out to us through any of these channels:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a
                href="mailto:support@legalink360.com"
                className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Mail size={20} className="text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">Email</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">support@legalink360.com</div>
                </div>
              </a>
              <button
                className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <MessageCircle size={20} className="text-blue-600 dark:text-blue-400" />
                <div className="text-left">
                  <div className="font-medium text-slate-900 dark:text-slate-100">Live Chat</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Available 9AM-6PM</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
