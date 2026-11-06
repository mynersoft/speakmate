-- ==============================================================================
-- SpeakMate Supabase PostgreSQL Database Schema
-- Migration 001: Initial Schema, Security, RLS, & Atomic Matching Engine Functions
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (char_length(display_name) >= 2 AND char_length(display_name) <= 50),
  avatar_url TEXT,
  country TEXT DEFAULT 'Global',
  english_level TEXT DEFAULT 'Intermediate' CHECK (english_level IN ('Beginner', 'Intermediate', 'Advanced', 'Fluent')),
  bio TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. COMMUNITY MEMBERS TABLE (Instant Open Community Access)
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approved BOOLEAN DEFAULT TRUE NOT NULL,
  approved_at TIMESTAMPTZ DEFAULT now(),
  invite_code_used TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. USER PRESENCE TABLE (Online & Availability Tracking)
CREATE TABLE IF NOT EXISTS public.user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE NOT NULL,
  is_available BOOLEAN DEFAULT FALSE NOT NULL,
  current_call_id UUID,
  last_seen TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. MATCHING SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.matching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'timeout')),
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. CALL SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  call_type TEXT DEFAULT 'video' CHECK (call_type IN ('video', 'audio')),
  status TEXT DEFAULT 'ringing' CHECK (status IN ('ringing', 'accepted', 'rejected', 'missed', 'ended', 'failed')),
  matching_session_id UUID REFERENCES public.matching_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0
);

-- 6. MATCHING ATTEMPTS TABLE (Auditing and anti-looping)
CREATE TABLE IF NOT EXISTS public.matching_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matching_session_id UUID NOT NULL REFERENCES public.matching_sessions(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  call_id UUID REFERENCES public.call_sessions(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ringing', 'accepted', 'rejected', 'timeout', 'skipped')),
  attempted_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. USER BLOCKS TABLE
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

-- 8. USER REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (char_length(reason) >= 3),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CHECK (reporter_id <> reported_id)
);

-- 9. COMMUNITY INVITE CODES (For invite-only registration)
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  max_uses INTEGER DEFAULT 10,
  uses_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Pre-seed a few invite codes for demo testing
INSERT INTO public.invite_codes (code, max_uses, is_active)
VALUES 
  ('SPEAKMATE2026', 100, true),
  ('ENGLISH-VIP', 100, true),
  ('COMMUNITY-JOIN', 100, true)
ON CONFLICT (code) DO NOTHING;

-- INDEXES for fast lookup and high performance
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_community_members_user_approved ON public.community_members(user_id, approved);
CREATE INDEX IF NOT EXISTS idx_user_presence_online_available ON public.user_presence(is_online, is_available, last_seen);
CREATE INDEX IF NOT EXISTS idx_call_sessions_caller_receiver ON public.call_sessions(caller_id, receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_matching_attempts_session ON public.matching_attempts(matching_session_id, partner_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_lookup ON public.user_blocks(blocker_id, blocked_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matching_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- POLICIES: profiles
-- Anyone authenticated can view approved members' profiles (public card info)
CREATE POLICY "Public profiles viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

-- Users can only insert or update their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- POLICIES: community_members
-- Authenticated users can view membership status
CREATE POLICY "Community members viewable by authenticated" 
ON public.community_members FOR SELECT TO authenticated USING (true);

-- Members cannot approve themselves directly via raw SQL update
-- (Approval happens via secure server function or admin trigger)
CREATE POLICY "Users cannot insert community membership directly"
ON public.community_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND approved = false);

-- POLICIES: user_presence
-- Authenticated users can view presence of other users
CREATE POLICY "User presence viewable by authenticated" 
ON public.user_presence FOR SELECT TO authenticated USING (true);

-- Users can only modify their own presence
CREATE POLICY "Users can update own presence" 
ON public.user_presence FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- POLICIES: call_sessions
-- Only participants can see or update their call session
CREATE POLICY "Participants can view their call sessions" 
ON public.call_sessions FOR SELECT TO authenticated 
USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Participants can update their call sessions" 
ON public.call_sessions FOR UPDATE TO authenticated 
USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Callers can insert calls" 
ON public.call_sessions FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = caller_id);

-- POLICIES: matching_sessions
CREATE POLICY "Users manage own matching sessions" 
ON public.matching_sessions FOR ALL TO authenticated 
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- POLICIES: matching_attempts
CREATE POLICY "Users can view matching attempts for their sessions" 
ON public.matching_attempts FOR SELECT TO authenticated 
USING (auth.uid() = caller_id OR auth.uid() = partner_id);

CREATE POLICY "Users can insert matching attempts" 
ON public.matching_attempts FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = caller_id);

-- POLICIES: user_blocks
CREATE POLICY "Users view own blocks" 
ON public.user_blocks FOR SELECT TO authenticated 
USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others" 
ON public.user_blocks FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others" 
ON public.user_blocks FOR DELETE TO authenticated 
USING (auth.uid() = blocker_id);

-- POLICIES: user_reports
CREATE POLICY "Users can submit reports" 
ON public.user_reports FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = reporter_id);

-- POLICIES: invite_codes
CREATE POLICY "Anyone authenticated can check active invite codes"
ON public.invite_codes FOR SELECT TO authenticated
USING (is_active = true);


-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- When a user registers through Supabase Auth, auto-provision profile, presence,
-- and community_members records.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_display_name TEXT;
  v_avatar_url TEXT;
  v_invite_code TEXT;
  v_auto_approve BOOLEAN := TRUE;
BEGIN
  v_display_name := COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1));
  v_avatar_url := COALESCE(new.raw_user_meta_data->>'avatar_url', '');
  v_invite_code := new.raw_user_meta_data->>'invite_code';

  -- Check if valid invite code was supplied during registration
  IF v_invite_code IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.invite_codes 
    WHERE code = v_invite_code AND is_active = true AND (expires_at IS NULL OR expires_at > now()) AND (max_uses > uses_count)
  ) THEN
    v_auto_approve := TRUE;
    UPDATE public.invite_codes SET uses_count = uses_count + 1 WHERE code = v_invite_code;
  END IF;

  -- 1. Create Profile
  INSERT INTO public.profiles (id, display_name, avatar_url, country, english_level)
  VALUES (
    new.id,
    v_display_name,
    v_avatar_url,
    COALESCE(new.raw_user_meta_data->>'country', 'Global'),
    COALESCE(new.raw_user_meta_data->>'english_level', 'Intermediate')
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create Community Membership (pending or approved with invite code)
  INSERT INTO public.community_members (user_id, approved, approved_at, invite_code_used)
  VALUES (
    new.id,
    v_auto_approve,
    CASE WHEN v_auto_approve THEN now() ELSE NULL END,
    v_invite_code
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- 3. Create Presence
  INSERT INTO public.user_presence (user_id, is_online, is_available, last_seen)
  VALUES (new.id, false, false, now())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger attachment
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================
-- ATOMIC STORED FUNCTIONS FOR PARTNER MATCHING & REALTIME ENGINE
-- ==============================================================================

-- 1. Find an eligible matching partner atomically
CREATE OR REPLACE FUNCTION public.find_matching_partner(
  p_user_id UUID,
  p_session_id UUID
)
RETURNS TABLE (
  partner_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  country TEXT,
  english_level TEXT
) AS $$
DECLARE
  v_partner_id UUID;
BEGIN
  -- Verify caller is approved
  IF NOT EXISTS (
    SELECT 1 FROM public.community_members 
    WHERE user_id = p_user_id AND approved = true
  ) THEN
    RAISE EXCEPTION 'User is not an approved community member.';
  END IF;

  -- Select one available, approved member
  -- Exclude:
  -- 1. Current user
  -- 2. Users already in active call
  -- 3. Users not marked is_available = true
  -- 4. Users not online or heartbeat stale (> 60 seconds)
  -- 5. Users previously attempted during this matching session
  -- 6. Users blocked by or who blocked caller
  SELECT up.user_id INTO v_partner_id
  FROM public.user_presence up
  JOIN public.community_members cm ON cm.user_id = up.user_id
  WHERE up.user_id <> p_user_id
    AND cm.approved = true
    AND up.is_online = true
    AND up.is_available = true
    AND up.current_call_id IS NULL
    AND up.last_seen > (now() - INTERVAL '60 seconds')
    AND up.user_id NOT IN (
      SELECT ma.partner_id FROM public.matching_attempts ma 
      WHERE ma.matching_session_id = p_session_id
    )
    AND up.user_id NOT IN (
      SELECT ub.blocked_id FROM public.user_blocks ub WHERE ub.blocker_id = p_user_id
      UNION
      SELECT ub.blocker_id FROM public.user_blocks ub WHERE ub.blocked_id = p_user_id
    )
  ORDER BY up.last_seen DESC
  LIMIT 1
  FOR UPDATE OF up SKIP LOCKED;

  IF v_partner_id IS NOT NULL THEN
    RETURN QUERY
    SELECT p.id, p.display_name, p.avatar_url, p.country, p.english_level
    FROM public.profiles p
    WHERE p.id = v_partner_id;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Request a call atomically with a matched partner
CREATE OR REPLACE FUNCTION public.request_call(
  p_caller_id UUID,
  p_receiver_id UUID,
  p_session_id UUID,
  p_call_type TEXT DEFAULT 'video'
)
RETURNS UUID AS $$
DECLARE
  v_call_id UUID;
BEGIN
  -- Verify receiver is still available
  IF NOT EXISTS (
    SELECT 1 FROM public.user_presence 
    WHERE user_id = p_receiver_id AND is_available = true AND current_call_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Selected partner is no longer available.';
  END IF;

  -- Create call session
  INSERT INTO public.call_sessions (caller_id, receiver_id, call_type, status, matching_session_id)
  VALUES (p_caller_id, p_receiver_id, p_call_type, 'ringing', p_session_id)
  RETURNING id INTO v_call_id;

  -- Record matching attempt
  INSERT INTO public.matching_attempts (matching_session_id, caller_id, partner_id, call_id, status)
  VALUES (p_session_id, p_caller_id, p_receiver_id, v_call_id, 'ringing');

  -- Mark receiver with current_call_id so they cannot get double-called
  UPDATE public.user_presence 
  SET current_call_id = v_call_id, updated_at = now()
  WHERE user_id = p_receiver_id;

  -- Mark caller as in call
  UPDATE public.user_presence
  SET current_call_id = v_call_id, updated_at = now()
  WHERE user_id = p_caller_id;

  RETURN v_call_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Accept call request
CREATE OR REPLACE FUNCTION public.accept_call(
  p_call_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_session RECORD;
BEGIN
  SELECT * INTO v_session FROM public.call_sessions WHERE id = p_call_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Call session not found.';
  END IF;

  IF v_session.receiver_id <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Only receiver can accept.';
  END IF;

  IF v_session.status <> 'ringing' THEN
    RAISE EXCEPTION 'Call is no longer ringing (current status: %)', v_session.status;
  END IF;

  -- Update call state
  UPDATE public.call_sessions
  SET status = 'accepted', accepted_at = now(), started_at = now()
  WHERE id = p_call_id;

  -- Update matching attempt record
  UPDATE public.matching_attempts
  SET status = 'accepted'
  WHERE call_id = p_call_id;

  -- Both participants are busy
  UPDATE public.user_presence
  SET is_available = false, current_call_id = p_call_id, updated_at = now()
  WHERE user_id IN (v_session.caller_id, v_session.receiver_id);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Reject or Miss call
CREATE OR REPLACE FUNCTION public.reject_or_timeout_call(
  p_call_id UUID,
  p_user_id UUID,
  p_reason TEXT DEFAULT 'rejected'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_session RECORD;
BEGIN
  SELECT * INTO v_session FROM public.call_sessions WHERE id = p_call_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Only caller or receiver can reject/miss
  IF v_session.caller_id <> p_user_id AND v_session.receiver_id <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized call transition.';
  END IF;

  UPDATE public.call_sessions
  SET status = CASE WHEN p_reason = 'timeout' THEN 'missed' ELSE 'rejected' END,
      ended_at = now()
  WHERE id = p_call_id;

  UPDATE public.matching_attempts
  SET status = CASE WHEN p_reason = 'timeout' THEN 'timeout' ELSE 'rejected' END
  WHERE call_id = p_call_id;

  -- Free up receiver presence
  UPDATE public.user_presence
  SET current_call_id = NULL, updated_at = now()
  WHERE user_id = v_session.receiver_id AND current_call_id = p_call_id;

  -- Free up caller presence
  UPDATE public.user_presence
  SET current_call_id = NULL, updated_at = now()
  WHERE user_id = v_session.caller_id AND current_call_id = p_call_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. End call session
CREATE OR REPLACE FUNCTION public.end_call(
  p_call_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_session RECORD;
  v_duration INT := 0;
BEGIN
  SELECT * INTO v_session FROM public.call_sessions WHERE id = p_call_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF v_session.caller_id <> p_user_id AND v_session.receiver_id <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized to end call.';
  END IF;

  IF v_session.started_at IS NOT NULL THEN
    v_duration := EXTRACT(EPOCH FROM (now() - v_session.started_at))::INTEGER;
  END IF;

  UPDATE public.call_sessions
  SET status = 'ended', ended_at = now(), duration_seconds = v_duration
  WHERE id = p_call_id;

  -- Free up presence for both
  UPDATE public.user_presence
  SET current_call_id = NULL, is_available = false, updated_at = now()
  WHERE user_id IN (v_session.caller_id, v_session.receiver_id);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. Heartbeat function for presence
CREATE OR REPLACE FUNCTION public.send_presence_heartbeat(
  p_user_id UUID,
  p_is_available BOOLEAN DEFAULT false
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_presence (user_id, is_online, is_available, last_seen, updated_at)
  VALUES (p_user_id, true, p_is_available, now(), now())
  ON CONFLICT (user_id) DO UPDATE
  SET is_online = true,
      is_available = p_is_available,
      last_seen = now(),
      updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. Approve community member (Requires invite code validation or admin role)
CREATE OR REPLACE FUNCTION public.apply_invite_code(
  p_user_id UUID,
  p_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_invite RECORD;
BEGIN
  SELECT * INTO v_invite FROM public.invite_codes
  WHERE code = trim(p_code) AND is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses > uses_count)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invite code.';
  END IF;

  -- Approve user
  UPDATE public.community_members
  SET approved = true, approved_at = now(), invite_code_used = p_code
  WHERE user_id = p_user_id;

  -- Increment use count
  UPDATE public.invite_codes
  SET uses_count = uses_count + 1
  WHERE id = v_invite.id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
