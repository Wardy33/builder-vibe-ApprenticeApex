const careerCategories = {
  1: {
    id: 1,
    name: "Digital & IT",
    description: "Technology, software development, data analysis, cybersecurity",
    icon: "💻",
    traits: ["problem_solver", "analytical", "detail_oriented", "continuous_learner"],
    personality_match: ["investigative", "realistic"],
    sample_roles: ["Software Developer", "Data Analyst", "IT Support", "Web Developer"],
    growth_rate: "25%",
    avg_salary: "£25,000 - £35,000"
  },
  2: {
    id: 2,
    name: "Healthcare & Care Services",
    description: "Medical care, nursing, therapy, social care, mental health",
    icon: "🏥",
    traits: ["empathetic", "patient", "communicator", "helper"],
    personality_match: ["social", "investigative"],
    sample_roles: ["Healthcare Assistant", "Mental Health Support", "Therapy Assistant"],
    growth_rate: "15%",
    avg_salary: "£18,000 - £28,000"
  },
  3: {
    id: 3,
    name: "Engineering & Manufacturing",
    description: "Mechanical engineering, electrical, manufacturing, automotive",
    icon: "⚙️",
    traits: ["practical", "problem_solver", "methodical", "technical"],
    personality_match: ["realistic", "investigative"],
    sample_roles: ["Manufacturing Technician", "Engineering Apprentice", "Quality Control"],
    growth_rate: "12%",
    avg_salary: "£20,000 - £30,000"
  },
  4: {
    id: 4,
    name: "Business & Administration",
    description: "Office management, HR, finance, project management",
    icon: "💼",
    traits: ["organized", "communicator", "leader", "analytical"],
    personality_match: ["conventional", "enterprising"],
    sample_roles: ["Admin Assistant", "HR Assistant", "Project Coordinator"],
    growth_rate: "8%",
    avg_salary: "£18,000 - £25,000"
  },
  5: {
    id: 5,
    name: "Marketing & Creative",
    description: "Digital marketing, graphic design, content creation, advertising",
    icon: "🎨",
    traits: ["creative", "communicator", "trendy", "visual"],
    personality_match: ["artistic", "enterprising"],
    sample_roles: ["Marketing Assistant", "Content Creator", "Graphic Designer"],
    growth_rate: "20%",
    avg_salary: "£19,000 - £28,000"
  },
  6: {
    id: 6,
    name: "Retail & Customer Service",
    description: "Sales, customer support, retail management, e-commerce",
    icon: "🛍️",
    traits: ["people_person", "helpful", "patient", "persuasive"],
    personality_match: ["social", "enterprising"],
    sample_roles: ["Retail Assistant", "Customer Service", "Sales Associate"],
    growth_rate: "10%",
    avg_salary: "£16,000 - £22,000"
  },
  7: {
    id: 7,
    name: "Construction & Trades",
    description: "Building, electrical, plumbing, carpentry, bricklaying",
    icon: "🔨",
    traits: ["practical", "physical", "problem_solver", "crafty"],
    personality_match: ["realistic", "conventional"],
    sample_roles: ["Construction Worker", "Electrician Apprentice", "Plumber Apprentice"],
    growth_rate: "15%",
    avg_salary: "£18,000 - £28,000"
  },
  8: {
    id: 8,
    name: "Hospitality & Tourism",
    description: "Hotels, restaurants, events, travel, entertainment",
    icon: "🏨",
    traits: ["people_person", "energetic", "flexible", "service_oriented"],
    personality_match: ["social", "enterprising"],
    sample_roles: ["Hotel Receptionist", "Restaurant Server", "Event Assistant"],
    growth_rate: "12%",
    avg_salary: "£16,000 - £24,000"
  },
  9: {
    id: 9,
    name: "Education & Training",
    description: "Teaching, training, childcare, educational support",
    icon: "📚",
    traits: ["patient", "communicator", "helper", "knowledgeable"],
    personality_match: ["social", "investigative"],
    sample_roles: ["Teaching Assistant", "Childcare Worker", "Training Support"],
    growth_rate: "8%",
    avg_salary: "£17,000 - £25,000"
  },
  10: {
    id: 10,
    name: "Finance & Accounting",
    description: "Banking, accounting, financial services, investment",
    icon: "💰",
    traits: ["analytical", "detail_oriented", "trustworthy", "methodical"],
    personality_match: ["conventional", "investigative"],
    sample_roles: ["Accounts Assistant", "Banking Assistant", "Finance Trainee"],
    growth_rate: "10%",
    avg_salary: "£19,000 - £27,000"
  },
  11: {
    id: 11,
    name: "Legal & Professional Services",
    description: "Law, consulting, professional services, compliance",
    icon: "⚖️",
    traits: ["analytical", "detail_oriented", "ethical", "communicator"],
    personality_match: ["investigative", "conventional"],
    sample_roles: ["Legal Assistant", "Paralegal", "Compliance Assistant"],
    growth_rate: "7%",
    avg_salary: "£20,000 - £28,000"
  },
  12: {
    id: 12,
    name: "Media & Communications",
    description: "Journalism, broadcasting, PR, social media",
    icon: "📺",
    traits: ["communicator", "creative", "curious", "trendy"],
    personality_match: ["artistic", "social"],
    sample_roles: ["Media Assistant", "Communications Trainee", "Social Media Coordinator"],
    growth_rate: "18%",
    avg_salary: "£18,000 - £26,000"
  },
  13: {
    id: 13,
    name: "Transport & Logistics",
    description: "Delivery, warehousing, supply chain, transportation",
    icon: "🚛",
    traits: ["organized", "physical", "reliable", "efficient"],
    personality_match: ["realistic", "conventional"],
    sample_roles: ["Warehouse Operative", "Logistics Coordinator", "Driver Apprentice"],
    growth_rate: "13%",
    avg_salary: "£17,000 - £25,000"
  },
  14: {
    id: 14,
    name: "Hair & Beauty",
    description: "Hairdressing, beauty therapy, cosmetics, wellness",
    icon: "💄",
    traits: ["creative", "people_person", "artistic", "trendy"],
    personality_match: ["artistic", "social"],
    sample_roles: ["Hair Stylist Apprentice", "Beauty Therapist", "Nail Technician"],
    growth_rate: "11%",
    avg_salary: "£16,000 - £24,000"
  },
  15: {
    id: 15,
    name: "Sports & Fitness",
    description: "Personal training, sports coaching, fitness, recreation",
    icon: "🏃‍♂️",
    traits: ["energetic", "motivator", "physical", "health_conscious"],
    personality_match: ["social", "realistic"],
    sample_roles: ["Fitness Instructor", "Sports Coach", "Gym Assistant"],
    growth_rate: "14%",
    avg_salary: "£17,000 - £25,000"
  },
  16: {
    id: 16,
    name: "Science & Environment",
    description: "Laboratory work, environmental science, research",
    icon: "🔬",
    traits: ["analytical", "curious", "methodical", "detail_oriented"],
    personality_match: ["investigative", "realistic"],
    sample_roles: ["Lab Technician", "Environmental Assistant", "Research Support"],
    growth_rate: "16%",
    avg_salary: "£19,000 - £28,000"
  },
  17: {
    id: 17,
    name: "Protective Services",
    description: "Security, emergency services, military, safety",
    icon: "👮‍♂️",
    traits: ["responsible", "brave", "physical", "helper"],
    personality_match: ["realistic", "social"],
    sample_roles: ["Security Officer", "Emergency Services Support", "Safety Coordinator"],
    growth_rate: "9%",
    avg_salary: "£18,000 - £26,000"
  },
  18: {
    id: 18,
    name: "Agriculture & Animals",
    description: "Farming, veterinary assistance, animal care, horticulture",
    icon: "🐄",
    traits: ["caring", "physical", "patient", "nature_lover"],
    personality_match: ["realistic", "investigative"],
    sample_roles: ["Veterinary Assistant", "Farm Worker", "Animal Care Assistant"],
    growth_rate: "6%",
    avg_salary: "£16,000 - £23,000"
  }
};

module.exports = careerCategories;
