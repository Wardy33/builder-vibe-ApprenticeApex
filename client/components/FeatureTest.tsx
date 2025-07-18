import { useState } from "react";
import ProfileCompletionModal from "./ProfileCompletionModal";
import EnhancedSwipeCard from "./EnhancedSwipeCard";

// Test component to verify our enhanced features work
export default function FeatureTest() {
  const [showModal, setShowModal] = useState(false);

  // Mock data for testing
  const mockMatchedJob = {
    apprenticeshipId: "test-job-1",
    matchPercentage: 85,
    matchFactors: {
      location: 90,
      industry: 100,
      salary: 75,
      workType: 100,
      drivingLicense: 100,
      skills: 60,
      overall: 85,
    },
    travelInfo: {
      distance: 2.5,
      recommendedTransport: ["Public Transport", "Cycling"],
      estimatedTravelTime: "20-30 minutes",
    },
    job: {
      _id: "test-job-1",
      jobTitle: "Software Developer Apprentice",
      description:
        "Join our dynamic team and learn cutting-edge web development technologies.",
      industry: "Technology",
      location: {
        city: "London",
        address: "123 Tech Street",
        postcode: "SW1A 1AA",
      },
      salary: {
        min: 18000,
        max: 25000,
        currency: "GBP",
      },
      workType: "full-time",
      drivingLicenseRequired: false,
      accessibilitySupport: true,
      skills: ["JavaScript", "React", "Node.js"],
      duration: {
        years: 3,
        months: 0,
      },
    },
  };

  const mockMissingFields = [
    "Industry preferences",
    "Salary expectations",
    "Transport modes",
  ];

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
