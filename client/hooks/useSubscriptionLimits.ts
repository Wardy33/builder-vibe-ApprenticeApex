import { useState, useEffect } from 'react';

interface SubscriptionLimits {
  canCreateJobPosting: boolean;
  canAddUser: boolean;
  isTrialExpired: boolean;
  daysLeftInTrial: number;
  hasSubscription: boolean;
  planType?: string;
  isInTrial?: boolean;
  loading: boolean;
  error?: string;
}

export function useSubscriptionLimits() {
  const [limits, setLimits] = useState<SubscriptionLimits>({
    canCreateJobPosting: true, // Default to true for better UX
    canAddUser: true,
    isTrialExpired: false,
    daysLeftInTrial: 0,
    hasSubscription: false,
    loading: true
  });

  useEffect(() => {
    loadSubscriptionLimits();
  }, []);

  const loadSubscriptionLimits = async () => {
    try {
      const response = await fetch('/api/subscriptions/current', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLimits({
            canCreateJobPosting: data.limits?.canCreateJobPosting ?? true,
            canAddUser: data.limits?.canAddUser ?? true,
            isTrialExpired: data.isTrialExpired ?? false,
            daysLeftInTrial: data.daysLeftInTrial ?? 0,
            hasSubscription: data.hasSubscription ?? false,
            planType: data.subscription?.planType,
            isInTrial: data.subscription?.isInTrial,
            loading: false
          });
        } else {
          setLimits(prev => ({ ...prev, loading: false, error: 'Failed to load subscription' }));
        }
      } else {
        setLimits(prev => ({ ...prev, loading: false, error: 'Network error' }));
      }
    } catch (error) {
      console.error('Error loading subscription limits:', error);
      setLimits(prev => ({ ...prev, loading: false, error: 'Connection error' }));
    }
  };

  const checkLimit = async (action: string) => {
    try {
      const response = await fetch(`/api/subscriptions/check-limits/${action}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return {
            allowed: data.allowed,
            reason: data.reason
          };
        }
      }
      
      return {
        allowed: false,
        reason: 'Unable to check subscription limits'
      };
    } catch (error) {
      console.error('Error checking subscription limit:', error);
      return {
        allowed: false,
        reason: 'Connection error'
      };
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
        await loadSubscriptionLimits(); // Reload limits after starting trial
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.error || 'Failed to start trial' };
      }
    } catch (error) {
      return { success: false, error: 'Connection error' };
    }
  };

  const refresh = () => {
    setLimits(prev => ({ ...prev, loading: true }));
    loadSubscriptionLimits();
  };

  return {
    ...limits,
    checkLimit,
    startTrial,
    refresh
  };
}
