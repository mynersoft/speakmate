import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { callService } from '../services/callService';
import { useWebRTC } from '../hooks/useWebRTC';
import VideoCall from '../components/VideoCall';
import LoadingScreen from '../components/LoadingScreen';
import PartnerCard from '../components/PartnerCard';

export default function VideoCallPage() {
  const { callId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [callSession, setCallSession] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callEndedReason, setCallEndedReason] = useState(null);

  // Load call details
  useEffect(() => {
    let active = true;

    async function loadCall() {
      if (!callId || !user) return;
      try {
        const session = await callService.getCallSession(callId);
        if (!active) return;

        if (!session) {
          setCallEndedReason('Call session could not be found.');
          setLoading(false);
          return;
        }

        setCallSession(session);
        // Identify remote partner
        const isUserCaller = session.caller_id === user.id;
        const remotePartner = isUserCaller ? session.receiver : session.caller;
        setPartner(remotePartner || { display_name: 'Approved Member', country: 'Global' });
      } catch (err) {
        console.error('Error fetching call:', err);
        if (active) {
          setCallEndedReason('Unable to connect to call session.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCall();

    return () => {
      active = false;
    };
  }, [callId, user]);

  const isCaller = callSession ? callSession.caller_id === user?.id : false;

  const handleCallEnded = useCallback((reason) => {
    setCallEndedReason(reason || 'Call ended');
  }, []);

  const {
    localStream,
    remoteStream,
    connectionStatus,
    connectionType,
    isAudioEnabled,
    isVideoEnabled,
    remoteAudioEnabled,
    remoteVideoEnabled,
    callDuration,
    errorMessage,
    toggleAudio,
    toggleVideo,
    endCall,
  } = useWebRTC({
    callId,
    isCaller,
    currentUserId: user?.id,
    onCallEnded: handleCallEnded,
  });

  // Next Partner Button action: end current call and navigate to matching to trigger auto-next
  const handleNextPartner = async () => {
    await endCall();
    navigate('/matching');
  };

  const handleReturnDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return <LoadingScreen message="Connecting secure peer-to-peer call session..." />;
  }

  // CALL ENDED MODAL / SCREEN
  if (callEndedReason) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Conversation Ended
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          {callEndedReason}
        </p>

        {partner && (
          <div className="mb-6 text-left">
            <PartnerCard partner={partner} />
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/matching')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
          >
            Find Next Partner
          </button>
          <button
            onClick={handleReturnDashboard}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
      <VideoCall
        partner={partner}
        localStream={localStream}
        remoteStream={remoteStream}
        connectionStatus={connectionStatus}
        connectionType={connectionType}
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        remoteAudioEnabled={remoteAudioEnabled}
        remoteVideoEnabled={remoteVideoEnabled}
        callDuration={callDuration}
        errorMessage={errorMessage}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onEndCall={endCall}
        onNextPartner={handleNextPartner}
      />
    </div>
  );
}
