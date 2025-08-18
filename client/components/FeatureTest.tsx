import { useState } from "react";
import ProfileCompletionModal from "./ProfileCompletionModal";
import EnhancedSwipeCard from "./EnhancedSwipeCard";

// Test component to verify our enhanced features work
export default function FeatureTest() {
  const [showModal, setShowModal] = useState(false);

  // Note: This component is for internal testing and should not be visible to end users
  // Real data would be fetched from the API in production
  const testJobData = null; // Removed mock data for production
  const missingFields = []; // Would come from profile analysis API

  const handleSwipe = (direction: "left" | "right", jobId: string) => {
    console.log(`Swiped ${direction} on job ${jobId}`);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Feature Test Components</h2>

      <div className="space-y-4">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Profile Completion Modal
        </button>

        <div className="max-w-sm mx-auto">
          <h3 className="text-lg font-semibold mb-4">
            Enhanced Swipe Card Test:
          </h3>
          <EnhancedSwipeCard
            matchedJob={mockMatchedJob}
            onSwipe={handleSwipe}
          />
        </div>
      </div>

      <ProfileCompletionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        missingFields={mockMissingFields}
        completionPercentage={60}
      />
    </div>
  );
}
