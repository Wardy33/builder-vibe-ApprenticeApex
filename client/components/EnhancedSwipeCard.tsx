import { useState, useRef } from "react";
import {
  Heart,
  X,
  MapPin,
  Building2,
  Clock,
  Star,
  Car,
  Bus,
  Navigation,
  Route,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
} from "lucide-react";

interface MatchedJob {
  apprenticeshipId: string;
  matchPercentage: number;
  matchFactors: {
    location: number;
    industry: number;
    salary: number;
    workType: number;
    drivingLicense: number;
    skills: number;
    overall: number;
  };
  travelInfo: {
    distance: number;
    recommendedTransport: string[];
    estimatedTravelTime: string;
  };
  job: {
    _id: string;
    jobTitle: string;
    description: string;
    industry: string;
    location: {
      city: string;
      address: string;
      postcode: string;
    };
    salary: {
      min: number;
      max: number;
      currency: string;
    };
    workType: string;
    drivingLicenseRequired: boolean;
    accessibilitySupport: boolean;
    skills: string[];
    duration: {
      years: number;
      months: number;
    };
  };
}

interface EnhancedSwipeCardProps {
  matchedJob: MatchedJob;
  onSwipe: (direction: "left" | "right", jobId: string) => void;
  style?: React.CSSProperties;
}

const TRANSPORT_ICONS: { [key: string]: React.ReactNode } = {
  Walking: <Navigation className="h-4 w-4" />,
  Cycling: <Navigation className="h-4 w-4" />,
  "Public Transport": <Bus className="h-4 w-4" />,
  "Car/Driving": <Car className="h-4 w-4" />,
  Motorcycle: <Car className="h-4 w-4" />,
};

export default function EnhancedSwipeCard({
  matchedJob,
  onSwipe,
  style,
}: EnhancedSwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDistance, setDragDistance] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { job, matchPercentage, matchFactors, travelInfo } = matchedJob;

  const handleDragStart = () => setIsDragging(true);

  const handleDragEnd = () => {
    setIsDragging(false);
    if (Math.abs(dragDistance) > 100) {
      onSwipe(dragDistance > 0 ? "right" : "left", job._id);
    }
    setDragDistance(0);
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const distance = e.clientX - (rect.left + rect.width / 2);
      setDragDistance(distance);
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-100";
    if (percentage >= 60) return "text-orange bg-orange/10";
    if (percentage >= 40) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const formatSalary = () => {
    return `£${job.salary.min.toLocaleString()} - £${job.salary.max.toLocaleString()}`;
  };

  const formatDuration = () => {
    if (job.duration.years > 0 && job.duration.months > 0) {
      return `${job.duration.years}y ${job.duration.months}m`;
    } else if (job.duration.years > 0) {
      return `${job.duration.years} year${job.duration.years > 1 ? "s" : ""}`;
    } else {
      return `${job.duration.months} month${job.duration.months > 1 ? "s" : ""}`;
    }\n  };\n\n  return (\n    <>\n      <div\n        ref={cardRef}\n        className={`relative w-full h-[600px] bg-white rounded-2xl shadow-lg overflow-hidden cursor-grab ${\n          isDragging ? \"cursor-grabbing\" : \"\"\n        }`}\n        style={{\n          ...style,\n          transform: `translateX(${dragDistance}px) rotate(${dragDistance / 10}deg)`,\n          transition: isDragging ? \"none\" : \"transform 0.3s ease-out\",\n        }}\n        onMouseDown={handleDragStart}\n        onMouseMove={handleDrag}\n        onMouseUp={handleDragEnd}\n        onMouseLeave={handleDragEnd}\n      >\n        {/* Match Percentage Badge */}\n        <div className=\"absolute top-4 right-4 z-10\">\n          <div\n            className={`px-3 py-2 rounded-full font-bold text-sm ${getMatchColor(\n              matchPercentage,\n            )}`}\n          >\n            <div className=\"flex items-center space-x-1\">\n              <Star className=\"h-4 w-4\" />\n              <span>{matchPercentage}% Match</span>\n            </div>\n          </div>\n        </div>\n\n        {/* Header Image/Gradient */}\n        <div className=\"h-48 bg-gradient-to-br from-orange to-orange/80 relative\">\n          <div className=\"absolute inset-0 bg-black/20\" />\n          <div className=\"absolute bottom-4 left-4 text-white\">\n            <h2 className=\"text-2xl font-bold mb-1\">{job.jobTitle}</h2>\n            <div className=\"flex items-center space-x-2 text-white/90\">\n              <Building2 className=\"h-4 w-4\" />\n              <span>Company Name</span> {/* Would come from company data */}\n            </div>\n          </div>\n        </div>\n\n        {/* Content */}\n        <div className=\"p-6 space-y-4\">\n          {/* Location and Travel Info */}\n          <div className=\"bg-gray-50 rounded-lg p-4\">\n            <div className=\"flex items-center justify-between mb-2\">\n              <div className=\"flex items-center space-x-2\">\n                <MapPin className=\"h-5 w-5 text-gray-600\" />\n                <span className=\"font-medium text-gray-900\">\n                  {job.location.city}\n                </span>\n              </div>\n              <span className=\"text-sm text-gray-600\">\n                {travelInfo.distance} miles away\n              </span>\n            </div>\n            <div className=\"flex items-center justify-between\">\n              <div className=\"flex items-center space-x-2\">\n                <Clock className=\"h-4 w-4 text-gray-600\" />\n                <span className=\"text-sm text-gray-600\">\n                  {travelInfo.estimatedTravelTime}\n                </span>\n              </div>\n              <div className=\"flex items-center space-x-1\">\n                {travelInfo.recommendedTransport.slice(0, 2).map((mode, index) => (\n                  <div\n                    key={index}\n                    className=\"flex items-center space-x-1 bg-white px-2 py-1 rounded text-xs text-gray-600\"\n                  >\n                    {TRANSPORT_ICONS[mode] || <Navigation className=\"h-3 w-3\" />}\n                    <span className=\"hidden sm:inline\">{mode}</span>\n                  </div>\n                ))}\n              </div>\n            </div>\n          </div>\n\n          {/* Key Details */}\n          <div className=\"grid grid-cols-2 gap-4\">\n            <div className=\"flex items-center space-x-2\">\n              <DollarSign className=\"h-5 w-5 text-green-600\" />\n              <div>\n                <div className=\"text-sm text-gray-600\">Salary</div>\n                <div className=\"font-semibold text-gray-900\">{formatSalary()}</div>\n              </div>\n            </div>\n            <div className=\"flex items-center space-x-2\">\n              <Calendar className=\"h-5 w-5 text-blue-600\" />\n              <div>\n                <div className=\"text-sm text-gray-600\">Duration</div>\n                <div className=\"font-semibold text-gray-900\">{formatDuration()}</div>\n              </div>\n            </div>\n          </div>\n\n          {/* Job Requirements */}\n          <div>\n            <div className=\"text-sm text-gray-600 mb-2\">Key Requirements:</div>\n            <div className=\"flex flex-wrap gap-2\">\n              {job.skills.slice(0, 3).map((skill, index) => (\n                <span\n                  key={index}\n                  className=\"bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs\"\n                >\n                  {skill}\n                </span>\n              ))}\n              {job.skills.length > 3 && (\n                <span className=\"bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs\">\n                  +{job.skills.length - 3} more\n                </span>\n              )}\n            </div>\n          </div>\n\n          {/* Special Requirements */}\n          <div className=\"flex items-center justify-between text-sm\">\n            <div className=\"flex items-center space-x-4\">\n              {job.drivingLicenseRequired && (\n                <div className=\"flex items-center space-x-1 text-orange\">\n                  <Car className=\"h-4 w-4\" />\n                  <span>License Required</span>\n                </div>\n              )}\n              {job.accessibilitySupport && (\n                <div className=\"flex items-center space-x-1 text-green-600\">\n                  <CheckCircle className=\"h-4 w-4\" />\n                  <span>Accessible</span>\n                </div>\n              )}\n            </div>\n            <div className=\"text-gray-600 capitalize\">{job.workType}</div>\n          </div>\n\n          {/* Description Preview */}\n          <div>\n            <p className=\"text-gray-700 text-sm line-clamp-2\">\n              {job.description}\n            </p>\n          </div>\n        </div>\n\n        {/* Action Buttons */}\n        <div className=\"absolute bottom-6 left-6 right-6\">\n          <div className=\"flex items-center justify-between\">\n            <button\n              onClick={() => onSwipe(\"left\", job._id)}\n              className=\"w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors\"\n            >\n              <X className=\"h-6 w-6\" />\n            </button>\n            \n            <button\n              onClick={() => setShowDetails(true)}\n              className=\"px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors\"\n            >\n              More Details\n            </button>\n\n            <button\n              onClick={() => onSwipe(\"right\", job._id)}\n              className=\"w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors\"\n            >\n              <Heart className=\"h-6 w-6\" />\n            </button>\n          </div>\n        </div>\n\n        {/* Swipe Indicators */}\n        {isDragging && (\n          <>\n            <div\n              className={`absolute inset-0 flex items-center justify-center transition-opacity ${\n                dragDistance > 50 ? \"opacity-100\" : \"opacity-0\"\n              }`}\n            >\n              <div className=\"bg-green-500 text-white px-8 py-4 rounded-2xl font-bold text-xl transform rotate-12\">\n                LIKE\n              </div>\n            </div>\n            <div\n              className={`absolute inset-0 flex items-center justify-center transition-opacity ${\n                dragDistance < -50 ? \"opacity-100\" : \"opacity-0\"\n              }`}\n            >\n              <div className=\"bg-red-500 text-white px-8 py-4 rounded-2xl font-bold text-xl transform -rotate-12\">\n                PASS\n              </div>\n            </div>\n          </>\n        )}\n      </div>\n\n      {/* Details Modal */}\n      {showDetails && (\n        <div className=\"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4\">\n          <div className=\"bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto\">\n            <div className=\"p-6\">\n              <div className=\"flex items-center justify-between mb-4\">\n                <h3 className=\"text-xl font-bold text-gray-900\">Match Details</h3>\n                <button\n                  onClick={() => setShowDetails(false)}\n                  className=\"p-2 hover:bg-gray-100 rounded-lg\"\n                >\n                  <X className=\"h-5 w-5\" />\n                </button>\n              </div>\n\n              {/* Match Breakdown */}\n              <div className=\"space-y-4\">\n                <div className=\"text-center\">\n                  <div className={`text-3xl font-bold ${getMatchColor(matchPercentage).split(' ')[0]}`}>\n                    {matchPercentage}%\n                  </div>\n                  <div className=\"text-gray-600\">Overall Match</div>\n                </div>\n\n                <div className=\"space-y-3\">\n                  {Object.entries(matchFactors)\n                    .filter(([key]) => key !== \"overall\")\n                    .map(([category, score]) => (\n                      <div key={category} className=\"flex items-center justify-between\">\n                        <span className=\"text-sm text-gray-600 capitalize\">\n                          {category === \"drivingLicense\" ? \"Driving License\" : category}\n                        </span>\n                        <div className=\"flex items-center space-x-2\">\n                          <div className=\"w-20 bg-gray-200 rounded-full h-2\">\n                            <div\n                              className=\"bg-orange h-2 rounded-full\"\n                              style={{ width: `${score}%` }}\n                            />\n                          </div>\n                          <span className=\"text-sm font-medium w-8\">{score}%</span>\n                        </div>\n                      </div>\n                    ))}\n                </div>\n\n                {/* Travel Details */}\n                <div className=\"bg-gray-50 rounded-lg p-4\">\n                  <h4 className=\"font-semibold text-gray-900 mb-2\">Travel Information</h4>\n                  <div className=\"space-y-2 text-sm\">\n                    <div>Distance: {travelInfo.distance} miles</div>\n                    <div>Travel time: {travelInfo.estimatedTravelTime}</div>\n                    <div>\n                      Recommended transport: {travelInfo.recommendedTransport.join(\", \")}\n                    </div>\n                  </div>\n                </div>\n\n                {/* Action Buttons */}\n                <div className=\"flex gap-3 pt-4\">\n                  <button\n                    onClick={() => {\n                      onSwipe(\"left\", job._id);\n                      setShowDetails(false);\n                    }}\n                    className=\"flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium\"\n                  >\n                    Pass\n                  </button>\n                  <button\n                    onClick={() => {\n                      onSwipe(\"right\", job._id);\n                      setShowDetails(false);\n                    }}\n                    className=\"flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium\"\n                  >\n                    Apply\n                  </button>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n      )}\n    </>\n  );\n}"}