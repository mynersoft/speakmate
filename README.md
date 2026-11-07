# SpeakMate — Practice English. Connect. Improve.

SpeakMate is an invite-only real-time English language practice platform. Approved community members connect through 1-on-1 real-time video and audio conversations powered by WebRTC, Supabase Realtime, and Supabase PostgreSQL.

---

## Key Features

1. **Invite-Only Community**: Zero public stranger chaos. New registrations remain pending until verified or approved via valid invite code.
2. **Atomic Partner Matching Engine**:
   - Searches online approved members active in the last 60 seconds.
   - Concurrency-safe matching with row-level locks (`SKIP LOCKED`).
   - Excludes recent attempts in the session and blocked users.
   - Dispatches a 15-second call invitation.
3. **15-Second Ringing Timeout & Auto-Next**:
   - If an invitation is not answered within 15 seconds, SpeakMate automatically marks it as missed and seeks the next available member.
4. **Instant Skip / Next Partner**:
   - One-click cleanly ends the current call, stops media tracks, tears down RTCPeerConnection, excludes the previous partner, and immediately connects with the next partner.
5. **Real Browser WebRTC Video & Audio**:
   - Direct peer-to-peer streaming via STUN with configurable TURN support.
   - Microphone mute/unmute and Camera on/off toggling (with smooth audio-only fallback).
   - Local floating Picture-in-Picture (PIP) video.
6. **Presence & Heartbeat**:
   - Client pings periodic heartbeats every 25s with 60s stale expiration.
   - Real-time online, available, and active conversation counters.
7. **Safety & Moderation**:
   - Instant 1-click Block and Report modals.
   - Strict Row Level Security (RLS) on all database tables.
   - Strict zero-recording architecture (no media stream is ever stored on servers).

---

## Tech Stack

- **Frontend**: React, Vite, JavaScript (ESNext), Tailwind CSS, React Router, Lucide Icons.
- **Backend**: Supabase (PostgreSQL, Supabase Auth, Supabase Realtime).
- **Communication**: WebRTC (RTCPeerConnection, getUserMedia, ICE candidates, SDP offer/answer).
- **Deployment**: Vercel (frontend) & Supabase (backend).

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
# SUPABASE PUBLIC FRONTEND CONFIGURATION
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-anon-key"

# WEBRTC STUN SERVER (Default Google public STUN)
VITE_STUN_SERVER="stun:stun.l.google.com:19302"

# WEBRTC TURN SERVER (Optional, for symmetric NATs/firewalls)
VITE_TURN_SERVER=""
VITE_TURN_USERNAME=""
VITE_TURN_CREDENTIAL=""

APP_URL="http://localhost:3000"
```

> **Note**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are safe for the client browser. Never expose Supabase `service_role` secret keys in client code.

---

## Supabase Database Setup & Migrations

1. Create a free project on [Supabase](https://supabase.com).
2. Go to **SQL Editor** in the Supabase Dashboard.
3. Open `supabase/migrations/001_initial_schema.sql` and run the entire script.
4. The migration automatically:
   - Creates the tables: `profiles`, `community_members`, `user_presence`, `matching_sessions`, `call_sessions`, `matching_attempts`, `user_blocks`, `user_reports`, and `invite_codes`.
   - Seeds default active invite codes:
     - `SPEAKMATE2026`
     - `ENGLISH-VIP`
     - `COMMUNITY-JOIN`
   - Configures triggers to auto-create user profiles upon registration.
   - Sets up stored PostgreSQL functions (`find_matching_partner`, `request_call`, `accept_call`, `reject_or_timeout_call`, `end_call`, `send_presence_heartbeat`, `apply_invite_code`).
   - Configures strict Row Level Security (RLS) policies.
5. In your Supabase Dashboard under **Database > Replication**, enable Realtime replication for:
   - `user_presence`
   - `call_sessions`
6. *(Recommended)* Under **Authentication > Providers > Email**, turn **OFF** "Confirm email" to eliminate email rate limits completely for development and test registrations. SpeakMate also includes built-in rate-limit protection that bypasses email bottlenecks automatically.

---

## Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server on port 3000
npm run dev
```

Visit `http://localhost:3000`.

---

## Deploying to Vercel

1. Push your repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New > Project** and import the SpeakMate repository.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_STUN_SERVER` (e.g. `stun:stun.l.google.com:19302`)
4. Click **Deploy**.
5. Vercel automatically uses `vercel.json` to handle SPA route rewrites to `/index.html`.
6. Ensure your custom domain or Vercel URL is served over **HTTPS** (required by modern browsers for WebRTC camera/microphone access).

---

## Metered Open Relay WebRTC Architecture

SpeakMate integrates **Metered Open Relay** for robust enterprise NAT and firewall traversal:
1. **Direct P2P Preference**: WebRTC begins with direct host-to-host and STUN candidates (`stun:stun.l.google.com:19302`, `stun:openrelay.metered.ca:80`) for zero-latency communication.
2. **Metered TURN Relay Fallback**: If symmetric NAT or firewall blocks direct P2P:
   - **UDP Relay**: `turn:openrelay.metered.ca:80`, `turn:openrelay.metered.ca:443`
   - **TCP Relay**: `turn:openrelay.metered.ca:80?transport=tcp`, `turn:openrelay.metered.ca:443?transport=tcp`
   - **Encrypted TURNS (TLS)**: `turns:openrelay.metered.ca:443?transport=tcp`
3. **Secure Backend Credential Provider**: ICE servers are fetched dynamically from the `/api/ice-servers` endpoint. Secret Metered API keys are never exposed in frontend code.
4. **Credential Expiration & Reconnection**: WebRTC automatically detects credential expiration and network changes, performing automatic ICE restarts with fresh credentials.

---

## License

MIT © SpeakMate
