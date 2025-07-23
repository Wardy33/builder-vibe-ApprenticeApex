import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  Settings,
  ArrowUp,
  Download,
  X
} from 'lucide-react';

interface SubscriptionData {
  subscription: {
    planType: string;
    status: string;
    isInTrial: boolean;
    monthlyFee: number;
    successFeeRate: number;
    features: any;
    usage: {
      jobPostingsThisMonth: number;
      usersActive: number;
      hiresThisMonth: number;
    };
    trialEndDate?: string;
  };
  outstandingBalance: {
    totalAmount: number;
    count: number;
  };
  isTrialExpired: boolean;
  daysLeftInTrial: number;
  limits: {
    canCreateJobPosting: boolean;
    canAddUser: boolean;
  };
}

export default function SubscriptionManager() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
    loadBillingHistory();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscriptions/current', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.hasSubscription) {
          setSubscriptionData(data);
        }
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBillingHistory = async () => {
    try {
      const response = await fetch('/api/subscriptions/billing-history?limit=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBillingHistory(data.billingHistory);
        }
      }
    } catch (error) {
      console.error('Error loading billing history:', error);
    }
  };

  const startTrial = async () => {
    try {
      // For demo purposes, simulate starting a trial
      if (confirm('Start your 60-day free trial? You will have full access to all features.')) {
        // Simulate successful trial start
        alert('Trial started successfully! You now have 60 days of full access.');

        // For demo, set mock subscription data
        const mockTrialData = {
          subscription: {
            planType: 'trial',
            status: 'active',
            isInTrial: true,
            monthlyFee: 0,
            successFeeRate: 0,
            features: {},
            usage: {
              jobPostingsThisMonth: 2,
              usersActive: 1,
              hiresThisMonth: 0
            },
            trialEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
          },
          outstandingBalance: {
            totalAmount: 0,
            count: 0
          },
          isTrialExpired: false,
          daysLeftInTrial: 60,
          limits: {
            canCreateJobPosting: true,
            canAddUser: true
          }
        };

        setSubscriptionData(mockTrialData);
        // Store demo data in localStorage
        localStorage.setItem('demoSubscriptionData', JSON.stringify(mockTrialData));
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      alert('Failed to start trial. Please try again.');
    }
  };

  const upgradePlan = async (planType: string) => {
    try {
      const response = await fetch('/api/subscriptions/upgrade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planType })
      });
      
      if (response.ok) {
        setShowUpgradeModal(false);
        await loadSubscriptionData();
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getPlanDisplayName = (planType: string) => {
    const names = {
      trial: 'Trial',
      starter: 'Starter',
      professional: 'Professional',
      business: 'Business',
      enterprise: 'Enterprise'
    };
    return names[planType as keyof typeof names] || planType;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-400',
      expired: 'text-red-400',
      cancelled: 'text-gray-400'
    };
    return colors[status as keyof typeof colors] || 'text-gray-400';
  };

  const getBillingStatusColor = (status: string) => {
    const colors = {
      paid: 'text-green-400 bg-green-400/10',
      pending: 'text-yellow-400 bg-yellow-400/10',
      overdue: 'text-red-400 bg-red-400/10'
    };
    return colors[status as keyof typeof colors] || 'text-gray-400 bg-gray-400/10';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const subscriptionPlans = [
    {
      id: 'trial',
      name: 'Free Trial',
      price: '£0',
      period: '60 days',
      description: 'Risk-free trial with full access',
      features: [
        'Post unlimited jobs',
        'Access to all candidates',
        'Basic analytics',
        'Email support',
        'Pay only £399 per successful hire'
      ],
      buttonText: 'Start Free Trial',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      popular: false,
      action: startTrial
    },
    {
      id: 'starter',
      name: 'Starter',
      price: '£49',
      period: 'month',
      description: 'Perfect for small businesses',
      features: [
        'Up to 5 job postings per month',
        'Access to verified candidates',
        'Basic analytics & reporting',
        'Email support',
        '12% success fee per hire'
      ],
      buttonText: 'Choose Starter',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      popular: false,
      stripeLink: 'https://buy.stripe.com/test_starter_plan'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '£99',
      period: 'month',
      description: 'Most popular for growing teams',
      features: [
        'Up to 15 job postings per month',
        'Priority candidate matching',
        'Advanced analytics & insights',
        'Phone & email support',
        '10% success fee per hire',
        'Custom branding'
      ],
      buttonText: 'Choose Professional',
      buttonColor: 'bg-orange-600 hover:bg-orange-700',
      popular: true,
      stripeLink: 'https://buy.stripe.com/test_professional_plan'
    },
    {
      id: 'business',
      name: 'Business',
      price: '£199',
      period: 'month',
      description: 'For established enterprises',
      features: [
        'Unlimited job postings',
        'Dedicated account manager',
        'Custom integrations',
        'Priority support',
        '8% success fee per hire',
        'Advanced reporting',
        'Multi-user access'
      ],
      buttonText: 'Choose Business',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      popular: false,
      stripeLink: 'https://buy.stripe.com/test_business_plan'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Tailored for large organizations',
      features: [
        'Everything in Business',
        'Custom pricing',
        'API access',
        'White-label solution',
        'Negotiable success fees',
        'Dedicated support team',
        'SLA guarantees'
      ],
      buttonText: 'Contact Sales',
      buttonColor: 'bg-gray-600 hover:bg-gray-700',
      popular: false,
      action: () => window.open('mailto:sales@apprenticeapex.co.uk?subject=Enterprise Plan Inquiry', '_blank')
    }
  ];

  const handlePlanSelection = (plan: any) => {
    if (plan.action) {
      plan.action();
    } else if (plan.stripeLink) {
      // In a real implementation, this would be a proper Stripe Checkout URL
      // For demo, we'll show an alert and open a placeholder
      if (confirm(`Redirect to Stripe to purchase ${plan.name} plan for ${plan.price}/${plan.period}?`)) {
        // This would be the actual Stripe checkout URL
        window.open(plan.stripeLink, '_blank');
      }
    }
  };

  if (!subscriptionData) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start with our risk-free trial or choose a plan that fits your hiring needs.
            All plans include access to our complete platform and candidate network.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
                plan.popular ? 'border-orange-500 shadow-orange-100' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-600">/{plan.period}</span>}
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanSelection(plan)}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-colors ${plan.buttonColor}`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What's included in the free trial?</h4>
              <p className="text-gray-600 text-sm">Full access to our platform for 60 days. No monthly fees - only pay £399 when you successfully hire.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-600 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600 text-sm">We accept all major credit cards, debit cards, and bank transfers through our secure Stripe integration.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a setup fee?</h4>
              <p className="text-gray-600 text-sm">No setup fees ever. Start immediately with your chosen plan.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { subscription, outstandingBalance, isTrialExpired, daysLeftInTrial } = subscriptionData;

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Subscription Overview</h2>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors flex items-center"
          >
            <ArrowUp className="w-4 h-4 mr-2" />
            Upgrade Plan
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Plan Details */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <CreditCard className="w-5 h-5 text-orange-400 mr-2" />
              <h3 className="font-semibold text-white">Current Plan</h3>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {getPlanDisplayName(subscription.planType)}
            </div>
            <div className={`text-sm ${getStatusColor(subscription.status)}`}>
              {subscription.status} {subscription.isInTrial && '(Trial)'}
            </div>
            <div className="text-gray-400 text-sm mt-2">
              Monthly: {formatCurrency(subscription.monthlyFee)}
            </div>
            <div className="text-gray-400 text-sm">
              Success Fee: {subscription.successFeeRate}%
            </div>
          </div>

          {/* Trial Status */}
          {subscription.isInTrial && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Clock className="w-5 h-5 text-orange-400 mr-2" />
                <h3 className="font-semibold text-white">Trial Status</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {daysLeftInTrial} days
              </div>
              <div className="text-gray-400 text-sm">remaining</div>
              {isTrialExpired && (
                <div className="flex items-center mt-2 text-red-400">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Trial expired</span>
                </div>
              )}
            </div>
          )}

          {/* Outstanding Balance */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <DollarSign className="w-5 h-5 text-orange-400 mr-2" />
              <h3 className="font-semibold text-white">Outstanding</h3>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {formatCurrency(outstandingBalance.totalAmount)}
            </div>
            <div className="text-gray-400 text-sm">
              {outstandingBalance.count} invoice{outstandingBalance.count !== 1 ? 's' : ''}
            </div>
            {outstandingBalance.totalAmount > 0 && (
              <button className="mt-2 text-orange-400 hover:text-orange-300 text-sm">
                Pay Now →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">This Month's Usage</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <Briefcase className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {subscription.usage.jobPostingsThisMonth}
            </div>
            <div className="text-gray-400 text-sm">Job Postings</div>
          </div>
          
          <div className="text-center">
            <Users className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {subscription.usage.usersActive}
            </div>
            <div className="text-gray-400 text-sm">Active Users</div>
          </div>
          
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {subscription.usage.hiresThisMonth}
            </div>
            <div className="text-gray-400 text-sm">Successful Hires</div>
          </div>
        </div>
      </div>

      {/* Recent Billing */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Recent Billing</h3>
          <button className="text-orange-400 hover:text-orange-300 flex items-center">
            <Download className="w-4 h-4 mr-1" />
            Download All
          </button>
        </div>
        
        {billingHistory.length > 0 ? (
          <div className="space-y-3">
            {billingHistory.slice(0, 5).map((bill) => (
              <div key={bill._id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <div className="text-white font-medium">{bill.description}</div>
                  <div className="text-gray-400 text-sm">
                    {formatDate(bill.createdAt)} • Due: {formatDate(bill.dueDate)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">
                    {formatCurrency(bill.amount)}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${getBillingStatusColor(bill.status)}`}>
                    {bill.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            No billing history yet
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Upgrade Your Plan</h3>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {subscriptionPlans.filter(p => p.id !== 'trial').map((plan) => (
                <div
                  key={plan.id}
                  className={`border-2 rounded-xl p-4 ${
                    plan.popular ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <span className="inline-block bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold mb-2">
                      Recommended
                    </span>
                  )}
                  <h4 className="font-bold text-gray-900 text-lg mb-1">{plan.name}</h4>
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-600">/{plan.period}</span>}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{plan.description}</p>

                  <ul className="space-y-1 mb-4">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-gray-700 text-xs">{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-gray-500 text-xs">
                        +{plan.features.length - 3} more features...
                      </li>
                    )}
                  </ul>

                  <button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      handlePlanSelection(plan);
                    }}
                    className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition-colors ${plan.buttonColor}`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Need help choosing? <button
                  onClick={() => window.open('mailto:sales@apprenticeapex.co.uk?subject=Plan Selection Help', '_blank')}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Contact our sales team
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
