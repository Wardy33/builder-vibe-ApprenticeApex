import { useState, useCallback } from 'react';
import { useApi } from './useApi';

interface InterviewParticipant {
  name: string;
  email: string;
  isEmployer: boolean;
}

interface VideoInterviewData {
  interviewId: string;
  scheduledAt: Date;
  duration: number;
  roomUrl: string;
  meetingToken?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  employer: InterviewParticipant;
  student: InterviewParticipant;
  apprenticeship: {
    title: string;
    company: string;
  };
}

interface ScheduleInterviewRequest {
  applicationId: string;
  scheduledAt: string;
  duration?: number;
}

interface TechnicalIssueReport {
  issueType: 'connection' | 'quality' | 'other';
  description: string;
}

export function useVideoInterview() {
  const { request } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scheduleInterview = useCallback(async (data: ScheduleInterviewRequest): Promise<VideoInterviewData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await request('/api/video-interview/schedule', {
        method: 'POST',
        body: data
      });

      if (response.error) {
        setError(response.error.message || 'Failed to schedule interview');
        return null;
      }

      return response.data;
    } catch (err) {
      setError('Network error while scheduling interview');
      console.error('Schedule interview error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [request]);

  const getInterviewDetails = useCallback(async (interviewId: string): Promise<VideoInterviewData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await request(`/api/video-interview/${interviewId}`, {
        method: 'GET'
      });

      if (response.error) {
        setError(response.error.message || 'Failed to get interview details');
        return null;
      }

      return response.data;
    } catch (err) {
      setError('Network error while fetching interview details');
      console.error('Get interview details error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [request]);

  const joinInterview = useCallback(async (interviewId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await request(`/api/video-interview/${interviewId}/join`, {
        method: 'POST'
      });

      if (response.error) {
        setError(response.error.message || 'Failed to join interview');
        return false;
      }

      return true;
    } catch (err) {
      setError('Network error while joining interview');
      console.error('Join interview error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [request]);

  const leaveInterview = useCallback(async (interviewId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await request(`/api/video-interview/${interviewId}/leave`, {
        method: 'POST'
      });

      if (response.error) {
        setError(response.error.message || 'Failed to leave interview');
        return false;
      }

      return true;
    } catch (err) {
      setError('Network error while leaving interview');
      console.error('Leave interview error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [request]);

  const cancelInterview = useCallback(async (interviewId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await request(`/api/video-interview/${interviewId}`, {
        method: 'DELETE'
      });

      if (response.error) {
        setError(response.error.message || 'Failed to cancel interview');
        return false;
      }

      return true;
    } catch (err) {
      setError('Network error while cancelling interview');
      console.error('Cancel interview error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [request]);

  const reportTechnicalIssue = useCallback(async (
    interviewId: string, 
    report: TechnicalIssueReport
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await request(`/api/video-interview/${interviewId}/report-issue`, {
        method: 'POST',
        body: report
      });

      if (response.error) {
        setError(response.error.message || 'Failed to report technical issue');
        return false;
      }

      return true;
    } catch (err) {
      setError('Network error while reporting issue');
      console.error('Report technical issue error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [request]);

  const getMyInterviews = useCallback(async (): Promise<{
    upcoming: VideoInterviewData[];
    past: VideoInterviewData[];
    total: number;
  } | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await request('/api/video-interview/my-interviews', {
        method: 'GET'
      });

      if (response.error) {
        setError(response.error.message || 'Failed to get interviews');
        return null;
      }

      return response.data;
    } catch (err) {
      setError('Network error while fetching interviews');
      console.error('Get my interviews error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [request]);

  return {
    loading,
    error,
    scheduleInterview,
    getInterviewDetails,
    joinInterview,
    leaveInterview,
    cancelInterview,
    reportTechnicalIssue,
    getMyInterviews,
    clearError: () => setError(null)
  };
}
