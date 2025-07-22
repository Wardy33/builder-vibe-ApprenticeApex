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
  Upgrade,
  Download
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
      const response = await fetch('/api/subscriptions/start-trial', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await loadSubscriptionData();
      }
    } catch (error) {
      console.error('Error starting trial:', error);
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

  if (!subscriptionData) {
    return (
      <div className="bg-gray-900 p-8 rounded-xl border border-gray-700">
        <div className="text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-4">Start Your Journey</h3>
          <p className="text-gray-400 mb-6">
            Begin with our 60-day risk-free trial. No monthly fees, no setup costs.
            Only pay £399 when you successfully hire an apprentice.
          </p>
          <button
            onClick={startTrial}
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
          >
            Start Free Trial
          </button>
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
            <Upgrade className="w-4 h-4 mr-2" />
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
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Upgrade Your Plan</h3>
            
            <div className="space-y-3 mb-6">
              {['starter', 'professional', 'business'].map((plan) => (
                <button
                  key={plan}
                  onClick={() => upgradePlan(plan)}
                  className="w-full p-3 text-left bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition-colors"
                >
                  <div className="font-semibold text-white capitalize">{plan}</div>
                  <div className="text-gray-400 text-sm">
                    {plan === 'starter' && '£49/month + 12% success fee'}
                    {plan === 'professional' && '£99/month + 12% success fee'}
                    {plan === 'business' && '£149/month + 12% success fee'}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 text-orange-400 hover:text-orange-300"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
