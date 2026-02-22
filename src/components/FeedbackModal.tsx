"use client";

import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import Button from "./ui/Button";

const CATEGORIES = [
  { value: "bug_report", label: "Bug Report", description: "Something isn't working correctly" },
  { value: "feature_request", label: "Feature Request", description: "Suggest a new feature or improvement" },
  { value: "usability", label: "Usability", description: "Feedback on ease of use or design" },
  { value: "general", label: "General Feedback", description: "Any other thoughts or comments" },
];

interface FeedbackModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setCategory("");
    setMessage("");
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalOpen(false);
    }
    setTimeout(reset, 300);
  };

  const handleSubmit = async () => {
    if (!category) {
      setError("Please select a category");
      return;
    }
    if (!message.trim()) {
      setError("Please enter your feedback");
      return;
    }
    if (message.trim().length > 2000) {
      setError("Feedback must be 2000 characters or less");
      return;
    }

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit feedback");
      }
    } catch {
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {isOpen === undefined && (
        <button
          onClick={() => setInternalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-coral-200 hover:text-coral-600 transition-colors shadow-sm"
        >
          <MessageSquare className="h-4 w-4" />
          Send Feedback
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-coral-500" />
                <h2 className="text-lg font-semibold text-gray-900">Send Feedback</h2>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-4">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank you!</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Your feedback has been submitted. We appreciate you helping us improve CoachConnect.
                  </p>
                  <Button onClick={handleClose}>Close</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Help us improve CoachConnect! Your feedback is valuable and will be reviewed by our team.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => setCategory(cat.value)}
                          className={`text-left p-3 rounded-lg border-2 transition-colors ${
                            category === cat.value
                              ? "border-coral-500 bg-coral-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <p className={`text-sm font-medium ${category === cat.value ? "text-coral-700" : "text-gray-900"}`}>
                            {cat.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Feedback</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what's on your mind..."
                      rows={5}
                      maxLength={2000}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/2000</p>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={handleClose} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={sending} className="flex-1">
                      {sending ? "Submitting..." : "Submit Feedback"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
