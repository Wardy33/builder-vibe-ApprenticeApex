import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  User,
} from "lucide-react";

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrently: boolean;
  description: string;
}

interface GCSEGrade {
  id: string;
  subject: string;
  grade: string;
  examBoard: string;
  year: string;
}

interface ProfileData {
  // Personal Info
  bio: string;
  dateOfBirth: string;
  phone: string;
  location: string;
  skills: string[];

  // Work Experience
  experiences: Experience[];

  // GCSE Grades
  gcseGrades: GCSEGrade[];

  // Preferences
  interestedIndustries: string[];
  availabilityDate: string;
}

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Engineering",
  "Marketing",
  "Education",
  "Manufacturing",
  "Retail",
  "Construction",
  "Hospitality",
];

const GCSE_GRADES = ["9", "8", "7", "6", "5", "4", "3", "2", "1", "U"];
const EXAM_BOARDS = ["AQA", "Edexcel", "OCR", "WJEC", "CCEA"];

function ProfileSetupStep1({
  data,
  onUpdate,
  onNext,
}: {
  data: ProfileData;
  onUpdate: (updates: Partial<ProfileData>) => void;
  onNext: () => void;
}) {
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    if (skillInput.trim() && !data.skills.includes(skillInput.trim())) {
      onUpdate({ skills: [...data.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    onUpdate({ skills: data.skills.filter((s) => s !== skill) });
  };

  const handleNext = () => {
    if (data.bio && data.dateOfBirth && data.location) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <GraduationCap className="h-16 w-16 text-orange mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Personal Information
        </h2>
        <p className="text-gray-400">Tell us about yourself</p>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Bio <span className="text-red-400">*</span>
        </label>
        <textarea
          value={data.bio}
          onChange={(e) => onUpdate({ bio: e.target.value })}
          placeholder="Write a brief description about yourself, your interests, and career goals..."
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange resize-none h-24"
          maxLength={300}
        />
        <p className="text-xs text-gray-500 mt-1">
          {data.bio.length}/300 characters
        </p>
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Date of Birth <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => onUpdate({ dateOfBirth: e.target.value })}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => onUpdate({ phone: e.target.value })}
          placeholder="07123 456789"
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Location <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={data.location}
            onChange={(e) => onUpdate({ location: e.target.value })}
            placeholder="London, UK"
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange"
          />
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Skills
        </label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addSkill()}
              placeholder="Add a skill (e.g., JavaScript, Communication)"
              className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-3 bg-orange text-white rounded-lg hover:bg-orange/90"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {data.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 text-white rounded-full text-sm"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-gray-400 hover:text-white ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={!data.bio || !data.dateOfBirth || !data.location}
        className="w-full bg-orange hover:bg-orange/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        Next: Work Experience
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}

function ProfileSetupStep2({
  data,
  onUpdate,
  onNext,
  onBack,
}: {
  data: ProfileData;
  onUpdate: (updates: Partial<ProfileData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      isCurrently: false,
      description: "",
    };
    onUpdate({ experiences: [...data.experiences, newExperience] });
  };

  const updateExperience = (id: string, updates: Partial<Experience>) => {
    onUpdate({
      experiences: data.experiences.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp,
      ),
    });
  };

  const removeExperience = (id: string) => {
    onUpdate({
      experiences: data.experiences.filter((exp) => exp.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Briefcase className="h-16 w-16 text-orange mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Work Experience</h2>
        <p className="text-gray-400">
          Add your work experience and internships
        </p>
      </div>

      {data.experiences.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">No work experience added yet</p>
          <p className="text-sm text-gray-500 mb-6">
            Include part-time jobs, internships, volunteering, or work
            experience placements
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.experiences.map((experience) => (
            <div key={experience.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-white font-medium">Work Experience</h3>
                <button
                  onClick={() => removeExperience(experience.id)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Company name"
                  value={experience.company}
                  onChange={(e) =>
                    updateExperience(experience.id, { company: e.target.value })
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange"
                />
                <input
                  type="text"
                  placeholder="Job title/position"
                  value={experience.position}
                  onChange={(e) =>
                    updateExperience(experience.id, {
                      position: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={experience.startDate}
                    onChange={(e) =>
                      updateExperience(experience.id, {
                        startDate: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={experience.endDate}
                    disabled={experience.isCurrently}
                    onChange={(e) =>
                      updateExperience(experience.id, {
                        endDate: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange disabled:opacity-50"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={experience.isCurrently}
                  onChange={(e) =>
                    updateExperience(experience.id, {
                      isCurrently: e.target.checked,
                      endDate: e.target.checked ? "" : experience.endDate,
                    })
                  }
                  className="w-4 h-4 text-orange border-gray-600 rounded focus:ring-orange bg-gray-700"
                />
                <span className="text-sm text-gray-300">
                  I currently work here
                </span>
              </label>

              <textarea
                placeholder="Describe your responsibilities and achievements..."
                value={experience.description}
                onChange={(e) =>
                  updateExperience(experience.id, {
                    description: e.target.value,
                  })
                }
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange resize-none h-20"
                maxLength={200}
              />
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addExperience}
        className="w-full border-2 border-dashed border-gray-600 hover:border-orange text-gray-400 hover:text-orange py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="h-5 w-5" />
        Add Work Experience
      </button>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-orange hover:bg-orange/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Next: GCSE Grades
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function ProfileSetupStep3({
  data,
  onUpdate,
  onNext,
  onBack,
}: {
  data: ProfileData;
  onUpdate: (updates: Partial<ProfileData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const addGCSEGrade = () => {
    const newGrade: GCSEGrade = {
      id: Date.now().toString(),
      subject: "",
      grade: "",
      examBoard: "",
      year: "",
    };
    onUpdate({ gcseGrades: [...data.gcseGrades, newGrade] });
  };

  const updateGCSEGrade = (id: string, updates: Partial<GCSEGrade>) => {
    onUpdate({
      gcseGrades: data.gcseGrades.map((grade) =>
        grade.id === id ? { ...grade, ...updates } : grade,
      ),
    });
  };

  const removeGCSEGrade = (id: string) => {
    onUpdate({
      gcseGrades: data.gcseGrades.filter((grade) => grade.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <GraduationCap className="h-16 w-16 text-orange mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">GCSE Grades</h2>
        <p className="text-gray-400">Add your GCSE results</p>
      </div>

      {data.gcseGrades.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">No GCSE grades added yet</p>
          <p className="text-sm text-gray-500 mb-6">
            Add your GCSE grades to help employers understand your academic
            background
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.gcseGrades.map((grade) => (
            <div key={grade.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-white font-medium">GCSE Subject</h3>
                <button
                  onClick={() => removeGCSEGrade(grade.id)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Subject (e.g., Mathematics)"
                  value={grade.subject}
                  onChange={(e) =>
                    updateGCSEGrade(grade.id, { subject: e.target.value })
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange"
                />
                <select
                  value={grade.grade}
                  onChange={(e) =>
                    updateGCSEGrade(grade.id, { grade: e.target.value })
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange"
                >
                  <option value="">Select Grade</option>
                  {GCSE_GRADES.map((gradeOption) => (
                    <option key={gradeOption} value={gradeOption}>
                      Grade {gradeOption}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={grade.examBoard}
                  onChange={(e) =>
                    updateGCSEGrade(grade.id, { examBoard: e.target.value })
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange"
                >
                  <option value="">Select Exam Board</option>
                  {EXAM_BOARDS.map((board) => (
                    <option key={board} value={board}>
                      {board}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Year (e.g., 2023)"
                  value={grade.year}
                  onChange={(e) =>
                    updateGCSEGrade(grade.id, { year: e.target.value })
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addGCSEGrade}
        className="w-full border-2 border-dashed border-gray-600 hover:border-orange text-gray-400 hover:text-orange py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="h-5 w-5" />
        Add GCSE Grade
      </button>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-orange hover:bg-orange/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Next: Preferences
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function ProfileSetupStep4({
  data,
  onUpdate,
  onComplete,
  onBack,
}: {
  data: ProfileData;
  onUpdate: (updates: Partial<ProfileData>) => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const toggleIndustry = (industry: string) => {
    const newIndustries = data.interestedIndustries.includes(industry)
      ? data.interestedIndustries.filter((i) => i !== industry)
      : [...data.interestedIndustries, industry];
    onUpdate({ interestedIndustries: newIndustries });
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Mock API call to save profile
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to main student app
      navigate("/student/home");
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <User className="h-16 w-16 text-orange mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Preferences</h2>
        <p className="text-gray-400">Tell us what you're looking for</p>
      </div>

      {/* Industries */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-4">
          Which industries interest you? <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {INDUSTRIES.map((industry) => (
            <button
              key={industry}
              type="button"
              onClick={() => toggleIndustry(industry)}
              className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                data.interestedIndustries.includes(industry)
                  ? "border-orange bg-orange/10 text-orange"
                  : "border-gray-600 text-gray-300 hover:border-gray-500"
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Select all that apply. You can change these later.
        </p>
      </div>

      {/* Availability Date */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          When are you available to start?{" "}
          <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="date"
            value={data.availabilityDate}
            onChange={(e) => onUpdate({ availabilityDate: e.target.value })}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        <button
          onClick={handleComplete}
          disabled={
            isLoading ||
            data.interestedIndustries.length === 0 ||
            !data.availabilityDate
          }
          className="flex-1 bg-orange hover:bg-orange/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {isLoading ? "Creating Profile..." : "Complete Setup"}
        </button>
      </div>
    </div>
  );
}

export default function StudentProfileSetup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    bio: "",
    dateOfBirth: "",
    phone: "",
    location: "",
    skills: [],
    experiences: [],
    gcseGrades: [],
    interestedIndustries: [],
    availabilityDate: "",
  });

  const updateProfileData = (updates: Partial<ProfileData>) => {
    setProfileData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <button
          onClick={() => navigate("/student")}
          className="p-2 hover:bg-gray-800 rounded-full text-white"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-white">Profile Setup</h1>
        <div className="w-10" />
      </header>

      {/* Progress Bar */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Step {currentStep} of 4</span>
          <span className="text-sm text-gray-400">
            {Math.round((currentStep / 4) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-orange h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-2xl mx-auto">
        {currentStep === 1 && (
          <ProfileSetupStep1
            data={profileData}
            onUpdate={updateProfileData}
            onNext={nextStep}
          />
        )}
        {currentStep === 2 && (
          <ProfileSetupStep2
            data={profileData}
            onUpdate={updateProfileData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {currentStep === 3 && (
          <ProfileSetupStep3
            data={profileData}
            onUpdate={updateProfileData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {currentStep === 4 && (
          <ProfileSetupStep4
            data={profileData}
            onUpdate={updateProfileData}
            onComplete={() => navigate("/student/main")}
            onBack={prevStep}
          />
        )}
      </div>
    </div>
  );
}
