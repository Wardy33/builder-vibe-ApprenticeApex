import React from 'react';
import {
  Check,
  Star,
  TrendingUp,
  Shield,
  Clock,
  Users,
  Zap,
  ArrowRight,
  Mail,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { WebLayout } from '../components/WebLayout';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyFee: number | string;
  successFeeRate?: number;
  successFee?: number;
  popular?: boolean;
  features: string[];
  limits: {
    jobPostings: number | string;
    users: number | string;
    duration?: string;
  };
}

export default function ForEmployers() {
  
  const plans: PricingPlan[] = [
    {
      id: 'trial',
      name: 'Trial',
      description: '60-day risk-free trial',
      monthlyFee: 0,
      successFee: 399,
      features: [
        'Unlimited job postings',
        'AI-powered Gen Z matching',
        'Multi-platform candidate sourcing',
        'Mobile-optimized candidate profiles',
        'Basic analytics and reporting',
        'Email and chat support',
        'Platform messaging system'
      ],
      limits: {
        jobPostings: 'Unlimited',
        users: 1,
        duration: '60 days'
      }
    },
    {
      id: 'starter',
      name: 'Starter',
      description: 'For Small Training Providers',
      monthlyFee: 49,
      successFeeRate: 12,
      features: [
        'Up to 5 job postings per month',
        'Basic Gen Z matching algorithm',
        'Standard candidate profiles',
        'Email support',
        'Basic analytics dashboard',
        'Social media integration (LinkedIn, Instagram)'
      ],
      limits: {
        jobPostings: 5,
        users: 1
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'For Growing Organizations',
      monthlyFee: 99,
      successFeeRate: 12,
      popular: true,
      features: [
        'Up to 15 job postings per month',
        'Advanced AI-powered matching',
        'Premium candidate profiles with video',
        'Priority email + chat support',
        'Advanced analytics & reporting',
        'Custom branding',
        'Multi-platform social posting',
        'Basic automation workflows',
        'Candidate pool building tools'
      ],
      limits: {
        jobPostings: 15,
        users: 3
      }
    },
    {
      id: 'business',
      name: 'Business',
      description: 'For High-Volume Recruitment',
      monthlyFee: 149,
      successFeeRate: 12,
      features: [
        'Up to 30 job postings per month',
        'Premium Gen Z targeting & matching',
        'White-label career pages',
        'Phone + priority support',
        'Custom reporting & insights',
        'Advanced automation workflows',
        'Full social media marketing suite',
        'API access',
        'Bulk candidate messaging'
      ],
      limits: {
        jobPostings: 30,
        users: 5
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For Large-Scale Operations',
      monthlyFee: 'Custom',
      successFeeRate: 12,
      features: [
        'Unlimited job postings',
        'Dedicated account manager',
        'Custom AI training & matching',
        '24/7 phone support',
        'Advanced security features',
        'Unlimited users',
        'Custom integrations',
        'White-glove service',
        'SLA guarantees'
      ],
      limits: {
        jobPostings: 'Unlimited',
        users: 'Unlimited'
      }
    }
  ];
  

  
  const formatCurrency = (amount: number | string) => {
    if (typeof amount === 'string') return amount;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <WebLayout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <div className="inline-flex items-center px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full text-orange-400 text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Risk-Free Apprentice Recruitment
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
              Pay Only When You <span className="text-orange-500">Hire</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Start with our 60-day risk-free trial. No monthly fees, no setup costs. 
              Only pay £399 when you successfully hire an apprentice.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/company/signup"
                className="px-8 py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>

              <Link
                to="/contact"
                className="px-8 py-4 border border-gray-300 text-black font-semibold rounded-lg hover:border-gray-400 transition-colors flex items-center justify-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
        
        {/* Trial Offer Highlight */}
        <section className="py-16 px-4 bg-gradient-to-r from-orange-50 to-red-50 border-y border-orange-200">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                🚀 Launch Offer - First 60 Days
              </h2>
              <p className="text-xl text-gray-600">Perfect for testing ApprenticeApex risk-free</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl border border-gray-200 shadow-sm" style={{backgroundColor: '#f8f9fa'}}>
                <div className="text-orange-500 text-2xl font-bold mb-2">£0</div>
                <div className="text-black font-semibold mb-2">Setup Costs</div>
                <div className="text-gray-600 text-sm">No upfront fees or monthly charges</div>
              </div>
              
              <div className="p-6 rounded-xl border border-gray-200 shadow-sm" style={{backgroundColor: '#f8f9fa'}}>
                <div className="text-orange-500 text-2xl font-bold mb-2">£399</div>
                <div className="text-black font-semibold mb-2">Per Successful Hire</div>
                <div className="text-gray-600 text-sm">Only pay when candidate starts</div>
              </div>
              
              <div className="p-6 rounded-xl border border-gray-200 shadow-sm" style={{backgroundColor: '#f8f9fa'}}>
                <div className="text-orange-500 text-2xl font-bold mb-2">777%</div>
                <div className="text-black font-semibold mb-2">Average ROI</div>
                <div className="text-gray-600 text-sm">vs traditional recruitment</div>
              </div>
            </div>
          </div>
        </section>
        

        
        {/* Pricing Plans */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Choose Your Plan
              </h2>
              <p className="text-xl text-gray-600">Flexible pricing that grows with your business</p>
            </div>
            
            <div className="grid lg:grid-cols-5 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`relative p-6 rounded-xl border transition-all duration-300 hover:scale-105 shadow-sm ${
                    plan.popular 
                      ? 'border-orange-500 ring-2 ring-orange-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-black mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-black">
                        {typeof plan.monthlyFee === 'number' 
                          ? formatCurrency(plan.monthlyFee)
                          : plan.monthlyFee
                        }
                      </div>
                      <div className="text-gray-600 text-sm">per month</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-orange-500 font-semibold">
                        {plan.successFee 
                          ? `+ ${formatCurrency(plan.successFee)} per hire`
                          : `+ ${plan.successFeeRate}% of first year salary`
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {plan.features.slice(0, 6).map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 6 && (
                      <div className="text-gray-600 text-sm">
                        +{plan.features.length - 6} more features
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="text-gray-600 text-sm mb-2">Limits:</div>
                    <div className="space-y-1">
                      <div className="text-black text-sm">
                        📝 {plan.limits.jobPostings} job postings
                      </div>
                      <div className="text-black text-sm">
                        👤 {plan.limits.users} user{plan.limits.users !== 1 ? 's' : ''}
                      </div>
                      {plan.limits.duration && (
                        <div className="text-black text-sm">
                          ⏱️ {plan.limits.duration}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Link
                    to={plan.id === 'enterprise' ? '/contact' : '/company/signup'}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors text-center block ${
                      plan.popular
                        ? 'text-white hover:opacity-90'
                        : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-300'
                    }`}
                    style={plan.popular ? {backgroundColor: '#da6927'} : {}}
                  >
                    {plan.id === 'trial' ? 'Start Free Trial' :
                     plan.id === 'enterprise' ? 'Contact Sales' :
                     'Get Started'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Comparison Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Why Choose ApprenticeApex?
              </h2>
              <p className="text-xl text-gray-600">Compare us against traditional recruitment methods</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-xl border border-gray-200 shadow-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 text-black font-semibold">Method</th>
                    <th className="text-center p-4 text-black font-semibold">Cost per Hire</th>
                    <th className="text-center p-4 text-black font-semibold">Setup Costs</th>
                    <th className="text-center p-4 text-black font-semibold">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 bg-orange-50">
                    <td className="p-4 text-black font-semibold">ApprenticeApex Trial</td>
                    <td className="p-4 text-center text-orange-500 font-bold">£399</td>
                    <td className="p-4 text-center text-green-400 font-bold">£0</td>
                    <td className="p-4 text-center text-green-400 font-bold">No Risk</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-4 text-gray-700">Traditional Recruiter</td>
                    <td className="p-4 text-center text-gray-700">£3,000-6,000</td>
                    <td className="p-4 text-center text-gray-700">£0</td>
                    <td className="p-4 text-center text-red-400">High Risk</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-4 text-gray-700">Job Boards + Internal HR</td>
                    <td className="p-4 text-center text-gray-700">£1,500-3,000</td>
                    <td className="p-4 text-center text-gray-700">£500+</td>
                    <td className="p-4 text-center text-yellow-400">Medium Risk</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-gray-700">Training Provider Markup</td>
                    <td className="p-4 text-center text-gray-700">£1,000-2,500</td>
                    <td className="p-4 text-center text-gray-700">Variable</td>
                    <td className="p-4 text-center text-yellow-400">Medium Risk</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        
        {/* ROI Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Proven ROI for Our Clients
              </h2>
              <p className="text-xl text-gray-600">Real results from employers using ApprenticeApex</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-xl border border-gray-200 shadow-sm text-center" style={{backgroundColor: '#f8f9fa'}}>
                <TrendingUp className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-black mb-2">777%</div>
                <div className="text-black font-semibold mb-2">Average ROI</div>
                <div className="text-gray-600">during 60-day trial vs traditional recruitment</div>
              </div>
              
              <div className="p-8 rounded-xl border border-gray-200 shadow-sm text-center" style={{backgroundColor: '#f8f9fa'}}>
                <Clock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-black mb-2">14 days</div>
                <div className="text-black font-semibold mb-2">Average Time to Hire</div>
                <div className="text-gray-600">vs 45+ days for traditional methods</div>
              </div>
              
              <div className="p-8 rounded-xl border border-gray-200 shadow-sm text-center" style={{backgroundColor: '#f8f9fa'}}>
                <Users className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-black mb-2">92%</div>
                <div className="text-black font-semibold mb-2">Hire Success Rate</div>
                <div className="text-gray-600">apprentices who complete their programs</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 px-4" style={{background: '#da6927'}}>
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Revolutionize Your Apprentice Recruitment?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Start your 60-day risk-free trial today. No setup fees, no monthly costs, pay only for results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/company/signup"
                className="px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                Start Free Trial Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>

              <Link
                to="/contact"
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white transition-colors flex items-center justify-center" style={{borderColor: '#ffffff', color: '#ffffff'}} onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#da6927';}} onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#ffffff';}}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Sales
              </Link>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-6 justify-center text-white/90">
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                No long-term contracts
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Cancel anytime after trial
              </div>
              <div className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Free setup & support
              </div>
            </div>
          </div>
        </section>
        
        {/* Contact Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-8">
              Have Questions? We're Here to Help
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-gray-200 shadow-sm" style={{backgroundColor: '#f8f9fa'}}>
                <Mail className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                <h3 className="text-black font-semibold mb-2">Email Support</h3>
                <p className="text-gray-600 text-sm mb-4">Get help within 2 hours</p>
                <a href="mailto:hello@apprenticeapex.co.uk" className="text-orange-500 hover:text-orange-600">
                  hello@apprenticeapex.co.uk
                </a>
              </div>
              

              
              <div className="p-6 rounded-xl border border-gray-200 shadow-sm" style={{backgroundColor: '#f8f9fa'}}>
                <MessageCircle className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                <h3 className="text-black font-semibold mb-2">Live Chat</h3>
                <p className="text-gray-600 text-sm mb-4">Instant help when you need it</p>
                <button className="text-orange-500 hover:text-orange-600">
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </WebLayout>
  );
}
