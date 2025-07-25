import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Phone,
  PhoneOff,
  Settings,
  Users,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useVideoInterview } from '../hooks/useVideoInterview';

// Daily.co types and imports
declare global {
  interface Window {
    DailyIframe?: any;
  }
}

interface Participant {
  id: string;
  name: string;
  isLocal: boolean;
  isOwner: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  joinedAt: Date;
}

interface VideoInterviewProps {
  // Meeting configuration
  roomUrl: string;
  meetingToken?: string;
  isEmployer: boolean;
  
  // Interview details
  interviewId: string;
  scheduledAt: Date;
  duration: number;
  
  // Participant information
  employerName: string;
  studentName: string;
  apprenticeshipTitle: string;
  
  // Event handlers
  onJoin?: () => void;
  onLeave?: () => void;
  onError?: (error: string) => void;
  onTechnicalIssue?: (issueType: string, description: string) => void;
}

interface CallState {
  isConnected: boolean;
  isJoined: boolean;
  isLoading: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
  isScreenSharing: boolean;
  participants: Participant[];
  connectionQuality: 'good' | 'fair' | 'poor';
  error: string | null;
}

export function VideoInterview({
  roomUrl,
  meetingToken,
  isEmployer,
  interviewId,
  scheduledAt,
  duration,
  employerName,
  studentName,
  apprenticeshipTitle,
  onJoin,
  onLeave,
  onError,
  onTechnicalIssue
}: VideoInterviewProps) {
  const callFrameRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isJoined: false,
    isLoading: true,
    hasVideo: true,
    hasAudio: true,
    isScreenSharing: false,
    participants: [],
    connectionQuality: 'good',
    error: null
  });
  
  const [showTechnicalIssueModal, setShowTechnicalIssueModal] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');
  const [issueType, setIssueType] = useState<'connection' | 'quality' | 'other'>('connection');

  // Initialize Daily.co call frame
  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Load Daily.co SDK if not already loaded
        if (!window.DailyIframe) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/@daily-co/daily-js';
          script.onload = () => initCall();
          document.head.appendChild(script);
        } else {
          initCall();
        }
      } catch (error) {
        console.error('[VideoInterview] Initialization error:', error);
        setCallState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to initialize video call'
        }));
      }
    };

    const initCall = () => {
      if (!containerRef.current || !window.DailyIframe) return;

      // Create Daily.co call frame
      callFrameRef.current = window.DailyIframe.createFrame(containerRef.current, {
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '12px'
        },
        showLeaveButton: false,
        showFullscreenButton: true,
        showLocalVideo: true,
        showParticipantsBar: true,
        theme: {
          accent: '#0080FF',
          accentText: '#FFFFFF',
          background: '#1F2937',
          backgroundAccent: '#374151',
          baseText: '#F9FAFB',
          border: '#4B5563',
          mainAreaBg: '#111827',
          mainAreaBgAccent: '#1F2937',
          mainAreaText: '#F9FAFB',
          supportiveText: '#9CA3AF'
        }
      });

      // Set up event listeners
      setupEventListeners();
      
      // Join the meeting
      joinMeeting();
    };

    initializeCall();

    // Cleanup on unmount
    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.leave();
        callFrameRef.current.destroy();
      }
    };
  }, [roomUrl, meetingToken]);

  // Set up Daily.co event listeners
  const setupEventListeners = useCallback(() => {
    const callFrame = callFrameRef.current;
    if (!callFrame) return;

    // Joined meeting
    callFrame.on('joined-meeting', (event: any) => {
      console.log('[VideoInterview] Joined meeting:', event);
      setCallState(prev => ({
        ...prev,
        isJoined: true,
        isLoading: false,
        isConnected: true
      }));
      onJoin?.();
    });

    // Left meeting
    callFrame.on('left-meeting', (event: any) => {
      console.log('[VideoInterview] Left meeting:', event);
      setCallState(prev => ({
        ...prev,
        isJoined: false,
        isConnected: false
      }));
      onLeave?.();
    });

    // Participant joined
    callFrame.on('participant-joined', (event: any) => {
      console.log('[VideoInterview] Participant joined:', event.participant);
      updateParticipants();
    });

    // Participant left
    callFrame.on('participant-left', (event: any) => {
      console.log('[VideoInterview] Participant left:', event.participant);
      updateParticipants();
    });

    // Participant updated (audio/video changes)
    callFrame.on('participant-updated', (event: any) => {
      console.log('[VideoInterview] Participant updated:', event.participant);
      updateParticipants();
    });

    // Network quality change
    callFrame.on('network-quality-change', (event: any) => {
      const quality = event.threshold > 3 ? 'good' : event.threshold > 1 ? 'fair' : 'poor';
      setCallState(prev => ({ ...prev, connectionQuality: quality }));
    });

    // Error handling
    callFrame.on('error', (event: any) => {
      console.error('[VideoInterview] Call error:', event);
      const errorMessage = event.errorMsg || 'An error occurred during the video call';
      setCallState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      onError?.(errorMessage);
    });

    // Camera/microphone events
    callFrame.on('camera-error', (event: any) => {
      console.error('[VideoInterview] Camera error:', event);
      setCallState(prev => ({ ...prev, hasVideo: false }));
    });

    callFrame.on('microphone-error', (event: any) => {
      console.error('[VideoInterview] Microphone error:', event);
      setCallState(prev => ({ ...prev, hasAudio: false }));
    });

  }, [onJoin, onLeave, onError]);

  // Join the meeting
  const joinMeeting = useCallback(async () => {
    if (!callFrameRef.current) return;

    try {
      setCallState(prev => ({ ...prev, isLoading: true, error: null }));

      const joinOptions: any = {
        url: roomUrl,
        showLeaveButton: false
      };

      if (meetingToken) {
        joinOptions.token = meetingToken;
      }

      await callFrameRef.current.join(joinOptions);
    } catch (error) {
      console.error('[VideoInterview] Join error:', error);
      setCallState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to join video call'
      }));
    }
  }, [roomUrl, meetingToken]);

  // Update participants list
  const updateParticipants = useCallback(() => {
    if (!callFrameRef.current) return;

    const participants = callFrameRef.current.participants();
    const participantList: Participant[] = Object.values(participants).map((p: any) => ({
      id: p.session_id,
      name: p.user_name || (p.local ? 'You' : 'Participant'),
      isLocal: p.local,
      isOwner: p.owner,
      audioEnabled: p.audio,
      videoEnabled: p.video,
      joinedAt: new Date(p.joined_at)
    }));

    setCallState(prev => ({ ...prev, participants: participantList }));
  }, []);

  // Control functions
  const toggleAudio = useCallback(() => {
    if (!callFrameRef.current) return;
    const newState = !callState.hasAudio;
    callFrameRef.current.setLocalAudio(newState);
    setCallState(prev => ({ ...prev, hasAudio: newState }));
  }, [callState.hasAudio]);

  const toggleVideo = useCallback(() => {
    if (!callFrameRef.current) return;
    const newState = !callState.hasVideo;
    callFrameRef.current.setLocalVideo(newState);
    setCallState(prev => ({ ...prev, hasVideo: newState }));
  }, [callState.hasVideo]);

  const toggleScreenShare = useCallback(async () => {
    if (!callFrameRef.current) return;
    
    try {
      if (callState.isScreenSharing) {
        await callFrameRef.current.stopScreenShare();
      } else {
        await callFrameRef.current.startScreenShare();
      }
      setCallState(prev => ({ ...prev, isScreenSharing: !prev.isScreenSharing }));
    } catch (error) {
      console.error('[VideoInterview] Screen share error:', error);
    }
  }, [callState.isScreenSharing]);

  const leaveCall = useCallback(() => {
    if (callFrameRef.current) {
      callFrameRef.current.leave();
    }
  }, []);

  // Report technical issue
  const reportTechnicalIssue = useCallback(async () => {
    if (!issueDescription.trim()) return;

    try {
      onTechnicalIssue?.(issueType, issueDescription);
      setShowTechnicalIssueModal(false);
      setIssueDescription('');
    } catch (error) {
      console.error('[VideoInterview] Report issue error:', error);
    }
  }, [issueType, issueDescription, onTechnicalIssue]);

  // Get connection quality indicator
  const getConnectionIndicator = () => {
    const { connectionQuality } = callState;
    if (connectionQuality === 'good') {
      return <CheckCircle className="h-4 w-4 text-green-500" aria-label="Good connection" />;
    } else if (connectionQuality === 'fair') {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" aria-label="Fair connection" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-red-500" aria-label="Poor connection" />;
    }
  };

  // Time remaining calculation
  const getTimeRemaining = () => {
    const endTime = new Date(scheduledAt.getTime() + duration * 60000);
    const remaining = endTime.getTime() - Date.now();
    if (remaining <= 0) return 'Interview time ended';
    
    const minutes = Math.floor(remaining / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  if (callState.error) {
    return (
      <div 
        className="flex flex-col items-center justify-center h-96 bg-red-50 dark:bg-red-900/20 rounded-xl p-8"
        role="alert"
        aria-live="assertive"
      >
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
          Video Call Error
        </h3>
        <p className="text-red-600 dark:text-red-300 text-center mb-4">
          {callState.error}
        </p>
        <button
          onClick={joinMeeting}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus-indicator"
          aria-label="Retry joining the video call"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Interview: {apprenticeshipTitle}
            </h2>
            <p className="text-sm text-gray-300">
              {isEmployer ? `with ${studentName}` : `with ${employerName}`}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection quality */}
            <div className="flex items-center space-x-2">
              {getConnectionIndicator()}
              <span className="text-sm text-gray-300">
                {callState.connectionQuality}
              </span>
            </div>
            
            {/* Time remaining */}
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>{getTimeRemaining()}</span>
            </div>
            
            {/* Participants count */}
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>{callState.participants.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative">
        {callState.isLoading ? (
          <div 
            className="flex items-center justify-center h-full"
            role="status"
            aria-live="polite"
          >
            <div className="loading-indicator text-white">
              <div className="loading-spinner" aria-hidden="true"></div>
              <span className="ml-2">Connecting to video call...</span>
            </div>
          </div>
        ) : (
          <div 
            ref={containerRef} 
            className="w-full h-full"
            role="application"
            aria-label="Video call interface"
          />
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="flex items-center justify-center space-x-4">
          {/* Audio toggle */}
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors focus-indicator ${
              callState.hasAudio 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            aria-label={callState.hasAudio ? 'Mute microphone' : 'Unmute microphone'}
            disabled={!callState.isJoined}
          >
            {callState.hasAudio ? (
              <Mic className="h-5 w-5" aria-hidden="true" />
            ) : (
              <MicOff className="h-5 w-5" aria-hidden="true" />
            )}
          </button>

          {/* Video toggle */}
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors focus-indicator ${
              callState.hasVideo 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            aria-label={callState.hasVideo ? 'Turn off camera' : 'Turn on camera'}
            disabled={!callState.isJoined}
          >
            {callState.hasVideo ? (
              <Video className="h-5 w-5" aria-hidden="true" />
            ) : (
              <VideoOff className="h-5 w-5" aria-hidden="true" />
            )}
          </button>

          {/* Screen share (employer only) */}
          {isEmployer && (
            <button
              onClick={toggleScreenShare}
              className={`p-3 rounded-full transition-colors focus-indicator ${
                callState.isScreenSharing 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
              aria-label={callState.isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
              disabled={!callState.isJoined}
            >
              {callState.isScreenSharing ? (
                <MonitorOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Monitor className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          )}

          {/* Technical issues */}
          <button
            onClick={() => setShowTechnicalIssueModal(true)}
            className="p-3 rounded-full bg-yellow-600 text-white hover:bg-yellow-700 transition-colors focus-indicator"
            aria-label="Report technical issue"
            title="Report technical issue"
          >
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Leave call */}
          <button
            onClick={leaveCall}
            className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors focus-indicator"
            aria-label="Leave video call"
            disabled={!callState.isJoined}
          >
            <PhoneOff className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Open in new tab */}
          <a
            href={roomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors focus-indicator"
            aria-label="Open video call in new tab"
            title="Open in new tab"
          >
            <ExternalLink className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Technical Issue Modal */}
      {showTechnicalIssueModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="issue-modal-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 
              id="issue-modal-title" 
              className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
            >
              Report Technical Issue
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Issue Type
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-indicator"
                  aria-label="Select issue type"
                >
                  <option value="connection">Connection Issues</option>
                  <option value="quality">Audio/Video Quality</option>
                  <option value="other">Other Technical Issue</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Please describe the technical issue you're experiencing..."
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-indicator"
                  rows={3}
                  maxLength={500}
                  aria-label="Describe the technical issue"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {issueDescription.length}/500 characters
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTechnicalIssueModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus-indicator"
                aria-label="Cancel reporting issue"
              >
                Cancel
              </button>
              <button
                onClick={reportTechnicalIssue}
                disabled={!issueDescription.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus-indicator"
                aria-label="Submit technical issue report"
              >
                Report Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoInterview;
