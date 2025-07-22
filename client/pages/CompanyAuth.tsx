import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building2, Mail, Lock, User, MapPin, CheckCircle } from 'lucide-react';
import { WebLayout } from '../components/WebLayout';
import { LoadingButton } from '../components/ui/loading';

interface CompanySignUpData {
  // Company Information
  companyName: string;
  industry: string;
  companySize: string;
  website: string;
  description: string;
  
  // Contact Person
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  
  // Location
  address: string;
  city: string;
  postcode: string;
  
  // Account
  password: string;
  confirmPassword: string;
  
  // Agreements
  termsAccepted: boolean;
  privacyAccepted: boolean;
  noPoacingAccepted: boolean;
  exclusivityAccepted: boolean;
  dataProcessingAccepted: boolean;
}

interface CompanySignInData {
  email: string;
  password: string;
}

export function CompanySignUpForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CompanySignUpData>({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    description: '',
    firstName: '',
    lastName: '',
    position: '',
    email: '',
    address: '',
    city: '',
    postcode: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    privacyAccepted: false,
    noPoacingAccepted: false,
    exclusivityAccepted: false,
    dataProcessingAccepted: false
  });

  const handleInputChange = (field: keyof CompanySignUpData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.companyName && formData.industry && formData.companySize);
      case 2:
        return !!(formData.firstName && formData.lastName && formData.position && formData.email);
      case 3:
        return !!(formData.address && formData.city && formData.postcode);
      case 4:
        return !!(formData.password && formData.confirmPassword && formData.password === formData.confirmPassword);
      case 5:
        return formData.termsAccepted && formData.privacyAccepted && formData.noPoacingAccepted && formData.exclusivityAccepted && formData.dataProcessingAccepted;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/company/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        navigate('/company');
      } else {
        const error = await response.json();
        alert(error.error || 'Registration failed');
      }
    } catch (error) {
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Construction',
    'Education', 'Hospitality', 'Marketing', 'Legal', 'Automotive', 'Energy', 'Other'
  ];

  const companySizes = [
    '1-10 employees', '11-50 employees', '51-200 employees', 
    '201-500 employees', '501-1000 employees', '1000+ employees'
  ];

  return (
    <WebLayout>
      <div className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <Building2 className="h-12 w-12 mx-auto mb-4" style={{color: '#da6927'}} />
            <h1 className="text-3xl font-bold mb-2" style={{color: '#020202'}}>Join ApprenticeApex</h1>
            <p className="text-gray-600">Start your 60-day risk-free trial today</p>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center relative">
              {/* Progress line background */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
              <div
                className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 z-0 transition-all duration-500"
                style={{backgroundColor: '#da6927'}}
                style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
              ></div>

              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2 ${
                    step < currentStep
                      ? 'text-white shadow-lg'
                      : step === currentStep
                      ? 'bg-white shadow-md'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                  style={{
                    ...(step < currentStep ? {backgroundColor: '#da6927', borderColor: '#da6927'} : {}),
                    ...(step === currentStep ? {borderColor: '#da6927', color: '#da6927'} : {})
                  }}>
                    {step < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="font-semibold">{step}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="text-gray-600 text-sm font-medium">
                Step {currentStep} of 5: {
                  ['Company Details', 'Contact Information', 'Address', 'Account Setup', 'Agreements'][currentStep - 1]
                }
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 shadow-sm p-8" style={{backgroundColor: '#f8f9fa'}}>
            {/* Step 1: Company Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-black mb-6">Company Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    placeholder="Acme Training Ltd"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Industry *
                  </label>
                  <select
                    required
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select industry</option>
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Size *
                  </label>
                  <select
                    required
                    value={formData.companySize}
                    onChange={(e) => handleInputChange('companySize', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select company size</option>
                    {companySizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    placeholder="https://www.company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Description (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    placeholder="Brief description of your company and what you do..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-black mb-6">Contact Information</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      placeholder="John"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Position *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    placeholder="HR Manager / CEO / Training Director"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    placeholder="john.smith@company.com"
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    We'll use this for account verification and important notifications
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Address */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-black mb-6">Company Address</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    placeholder="123 Business Street"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      placeholder="London"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Postcode *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.postcode}
                      onChange={(e) => handleInputChange('postcode', e.target.value)}
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      placeholder="SW1A 1AA"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Account Setup */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-black mb-6">Account Security</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-orange-500 pr-12"
                      placeholder="Enter a strong password"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    placeholder="Confirm your password"
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Agreements */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-black mb-6">Legal Agreements</h2>
                <p className="text-gray-600 mb-6">
                  Please review and accept the following agreements to complete your registration:
                </p>
                
                <div className="space-y-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                      className="mt-1 w-5 h-5 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                    />
                    <span className="text-gray-700">
                      I accept the <Link to="/terms-of-service" className="text-orange-500 hover:underline" target="_blank">Terms of Service</Link> *
                    </span>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.privacyAccepted}
                      onChange={(e) => handleInputChange('privacyAccepted', e.target.checked)}
                      className="mt-1 w-5 h-5 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                    />
                    <span className="text-gray-700">
                      I accept the <Link to="/privacy-policy" className="text-orange-500 hover:underline" target="_blank">Privacy Policy</Link> *
                    </span>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.noPoacingAccepted}
                      onChange={(e) => handleInputChange('noPoacingAccepted', e.target.checked)}
                      className="mt-1 w-5 h-5 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                    />
                    <div className="text-gray-700">
                      <strong>I agree to the No-Poaching Policy:</strong> I will not contact candidates found through ApprenticeApex directly outside the platform for hiring purposes. All hiring must go through ApprenticeApex services. *
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.exclusivityAccepted}
                      onChange={(e) => handleInputChange('exclusivityAccepted', e.target.checked)}
                      className="mt-1 w-5 h-5 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                    />
                    <div className="text-gray-700">
                      <strong>I agree to the 12-Month Exclusivity Period:</strong> For any candidate I contact through ApprenticeApex, I agree to use only ApprenticeApex services for hiring that candidate for a period of 12 months from first contact. *
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.dataProcessingAccepted}
                      onChange={(e) => handleInputChange('dataProcessingAccepted', e.target.checked)}
                      className="mt-1 w-5 h-5 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                    />
                    <span className="text-gray-700">
                      I consent to the processing of my business data as described in the Privacy Policy *
                    </span>
                  </label>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mt-6">
                  <h3 className="text-orange-500 font-semibold mb-2">Important:</h3>
                  <p className="text-gray-700 text-sm">
                    By accepting these agreements, you acknowledge that you have the authority to bind your company to these terms. 
                    Violation of the no-poaching or exclusivity clauses may result in penalties as outlined in our Terms of Service.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 text-black rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Previous
                </button>
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="ml-auto px-6 py-3 text-white rounded-lg hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  style={{backgroundColor: '#da6927'}}
                >
                  Next
                </button>
              ) : (
                <LoadingButton
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={!validateStep(5)}
                  loadingText="Creating Account..."
                  className="ml-auto px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                >
                  Complete Registration
                </LoadingButton>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/company/signin" className="text-orange-500 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </WebLayout>
  );
}

export function CompanySignInForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CompanySignInData>({
    email: '',
    password: ''
  });

  const handleInputChange = (field: keyof CompanySignInData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/company/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        navigate('/company');
      } else {
        const error = await response.json();
        alert(error.error || 'Sign in failed');
      }
    } catch (error) {
      alert('Sign in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WebLayout>
      <div className="min-h-screen bg-gray-950 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <Building2 className="h-12 w-12 mx-auto mb-4" style={{color: '#da6927'}} />
            <h1 className="text-3xl font-bold mb-2" style={{color: '#020202'}}>Welcome Back</h1>
            <p className="text-gray-600">Sign in to your company portal</p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 shadow-sm p-8 space-y-6" style={{backgroundColor: '#f8f9fa'}}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="john@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              loadingText="Signing In..."
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Sign In
            </LoadingButton>

            <div className="text-center space-y-4">
              <Link to="/company/forgot-password" className="text-orange-400 hover:underline text-sm">
                Forgot your password?
              </Link>
              
              <div className="border-t border-gray-700 pt-4">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{' '}
                  <Link to="/company/signup" className="text-orange-500 hover:underline">
                    Start your free trial
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </WebLayout>
  );
}
