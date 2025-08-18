import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertTriangle, Eye, EyeOff, Mail, Lock, User, Calendar, Briefcase, MapPin, Phone, GraduationCap, Upload, CheckCircle, XCircle } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  dateOfBirth: string;
  educationLevel: string;
  location: string;
  availability: string;
  interests: string[];
  skills: string[];
  cv?: File;
}

interface CandidateAuthProps {
  mode?: 'signin' | 'signup';
}

export default function CandidateAuth({ mode = 'signin' }: CandidateAuthProps) {
  const navigate = useNavigate();
  const { user, login, register, loading, error } = useAuth();
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    educationLevel: '',
    location: '',
    availability: '',
    interests: [],
    skills: []
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [step, setStep] = useState(1);
  const maxSteps = 3;

  useEffect(() => {
    if (user?.role === 'candidate') {
      navigate('/candidate/dashboard');
    }
  }, [user, navigate]);

  const handleInputChange = (field: keyof FormData, value: string | string[] | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) errors.firstName = 'First name is required';
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
      if (!formData.email.trim()) errors.email = 'Email is required';
      if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
      if (!formData.password) errors.password = 'Password is required';
      if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }

    if (currentStep === 2) {
      if (!formData.phone.trim()) errors.phone = 'Phone number is required';
      if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
      if (!formData.educationLevel) errors.educationLevel = 'Education level is required';
      if (!formData.location.trim()) errors.location = 'Location is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(Math.max(1, step - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      if (!validateStep(step)) return;
      
      try {
        await register({
          ...formData,
          role: 'candidate'
        });
        navigate('/candidate/profile-setup');
      } catch (err) {
        console.error('Registration failed:', err);
      }
    } else {
      try {
        await login(formData.email, formData.password, 'candidate');
        navigate('/candidate/dashboard');
      } catch (err) {
        console.error('Login failed:', err);
      }
    }
  };

  const renderSignInForm = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your candidate account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
          {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => setIsSignUp(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up as a candidate
          </button>
        </p>
      </div>
    </div>
  );

  const renderSignUpStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Join as a Candidate</h1>
        <p className="text-gray-600">Start your apprenticeship journey</p>
        <div className="flex justify-center space-x-2 mt-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i === step ? 'bg-blue-600 text-white' : i < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {i < step ? <CheckCircle className="h-5 w-5" /> : i}
            </div>
          ))}
        </div>
      </div>

      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <div className="relative">
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your first name"
                required
              />
              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <div className="relative">
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your last name"
                required
              />
              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            {formErrors.lastName && <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
          {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Create a password"
                required
              />
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm your password"
                required
              />
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            {formErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>}
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className="text-gray-600 hover:text-gray-700 font-medium"
          >
            Already have an account? Sign in
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );

  // Additional steps would be implemented here...
  // For brevity, showing the main structure

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {!isSignUp ? renderSignInForm() : renderSignUpStep1()}
      </div>
    </div>
  );
}
