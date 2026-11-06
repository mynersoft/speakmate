/**
 * Safe cleanup utilities for media streams, WebRTC peer connections, and timers
 */

export function stopMediaStream(stream) {
  if (!stream) return;
  try {
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
      try {
        track.stop();
        track.enabled = false;
      } catch (e) {
        console.warn('Error stopping track:', e);
      }
    });
  } catch (err) {
    console.warn('Error stopping media stream:', err);
  }
}

export function closePeerConnection(pc) {
  if (!pc) return;
  try {
    pc.ontrack = null;
    pc.onicecandidate = null;
    pc.oniceconnectionstatechange = null;
    pc.onsignalingstatechange = null;
    pc.onconnectionstatechange = null;

    // Close transceivers
    if (pc.getSenders) {
      pc.getSenders().forEach((sender) => {
        try {
          if (sender.track) {
            sender.track.stop();
          }
        } catch (_) {}
      });
    }

    pc.close();
  } catch (err) {
    console.warn('Error closing peer connection:', err);
  }
}

export function clearSafeTimeout(timerRef) {
  if (timerRef && timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

export function clearSafeInterval(intervalRef) {
  if (intervalRef && intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
}
