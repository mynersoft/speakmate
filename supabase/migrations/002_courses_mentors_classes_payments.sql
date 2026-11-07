-- ==============================================================================
-- SpeakMate Supabase PostgreSQL Database Schema
-- Migration 002: Courses, Mentors, Live Classes, Subscriptions, Payments & Ledger
-- ==============================================================================

-- 1. MEMBERSHIP PLANS TABLE
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  price_bdt NUMERIC(10, 2) NOT NULL DEFAULT 0,
  price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('free', 'monthly', 'quarterly', 'yearly')),
  daily_practice_minutes INTEGER NOT NULL DEFAULT 15, -- 15 mins for Free, 0 = unlimited for Premium
  is_unlimited BOOLEAN DEFAULT false,
  priority_matching BOOLEAN DEFAULT false,
  access_live_classes BOOLEAN DEFAULT false,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Seed Default Membership Plans
INSERT INTO public.membership_plans (name, slug, description, price_bdt, price_usd, billing_cycle, daily_practice_minutes, is_unlimited, priority_matching, access_live_classes, features)
VALUES 
  ('Free Member', 'free', 'Ideal for daily basic speaking practice and community classes', 0, 0, 'free', 15, false, false, false, 
   '["15 minutes daily English speaking practice", "Free community mentor classes", "Free course library access", "Standard matching queue", "Basic progress tracking"]'::jsonb),
  ('Premium Monthly', 'premium-monthly', 'Accelerate your fluency with unlimited speaking and priority partner matching', 599, 5.99, 'monthly', 0, true, true, true, 
   '["Unlimited daily English speaking practice", "Priority partner matching engine", "Access to premium mentor masterclasses", "Course certificates & assignments", "Detailed AI speech analytics (coming soon)", "Ad-free experience"]'::jsonb),
  ('Premium Quarterly', 'premium-quarterly', 'Popular choice for dedicated English learners with 15% discount', 1499, 14.99, 'quarterly', 0, true, true, true, 
   '["Everything in Premium Monthly", "Save 15% vs monthly plan", "Priority matching & VIP badge", "Exclusive group conversation clubs", "Direct access to mentor Q&A"]'::jsonb),
  ('Premium Annual', 'premium-yearly', 'Best value: 1 full year of fluency mastery with 35% savings', 4499, 44.99, 'yearly', 0, true, true, true, 
   '["Everything in Premium Quarterly", "Save 35% annually", "Permanent VIP Fluency Badge", "Personal study plan recommendation", "1 Free 1-on-1 mentor strategy session"]'::jsonb)
ON CONFLICT (slug) DO UPDATE 
SET price_bdt = EXCLUDED.price_bdt, features = EXCLUDED.features;

-- 2. USER SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.membership_plans(id) ON DELETE RESTRICT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'past_due')),
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ,
  practice_minutes_used_today INTEGER DEFAULT 0,
  last_practice_date DATE DEFAULT CURRENT_DATE,
  payment_id UUID,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. MENTOR APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.mentor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  teaching_experience TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  english_proficiency TEXT NOT NULL CHECK (english_proficiency IN ('Native', 'C2 Proficient', 'C1 Advanced', 'B2 Upper-Intermediate')),
  introduction TEXT NOT NULL,
  intro_video_url TEXT,
  phone_or_whatsapp TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  admin_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. MENTOR PROFILES TABLE (Created once application is approved)
CREATE TABLE IF NOT EXISTS public.mentor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  headline TEXT DEFAULT 'English Language Mentor',
  bio TEXT DEFAULT '',
  teaching_experience TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{"English", "Bengali"}',
  hourly_rate_bdt NUMERIC(10, 2) DEFAULT 500,
  total_students INTEGER DEFAULT 0,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 5),
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Spoken English', 'IELTS Preparation', 'Business English', 'Grammar & Vocabulary', 'Job Interview', 'Pronunciation & Accent')),
  level TEXT NOT NULL CHECK (level IN ('All Levels', 'Beginner', 'Intermediate', 'Advanced')),
  price_bdt NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  duration_hours NUMERIC(4, 1) DEFAULT 1.0,
  learning_outcomes TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'pending', 'published', 'archived')),
  total_enrolled INTEGER DEFAULT 0,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. COURSE SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.course_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. COURSE LESSONS TABLE
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.course_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 10,
  video_url TEXT,
  content_text TEXT,
  resource_url TEXT,
  is_preview BOOLEAN DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. COURSE ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  payment_id UUID,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_lessons JSONB DEFAULT '[]'::jsonb,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  certificate_id TEXT,
  enrolled_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, course_id)
);

-- 9. LIVE CLASSES TABLE (Free and Paid Live Classes)
CREATE TABLE IF NOT EXISTS public.live_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 5),
  description TEXT NOT NULL,
  topic TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('All Levels', 'Beginner', 'Intermediate', 'Advanced')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  max_capacity INTEGER NOT NULL DEFAULT 25,
  enrolled_count INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT true,
  price_bdt NUMERIC(10, 2) NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  meeting_room_id TEXT NOT NULL,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'pending', 'published', 'live', 'completed', 'cancelled')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 10. CLASS ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS public.class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id UUID,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  joined_at TIMESTAMPTZ,
  enrolled_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(class_id, user_id)
);

-- 11. CLASS ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.class_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  join_time TIMESTAMPTZ DEFAULT now() NOT NULL,
  leave_time TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 0
);

-- 12. PAYMENTS TABLE (Bangladesh Gateway Integration: bKash, Nagad, Rocket, Card)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('subscription', 'course', 'class')),
  item_id UUID NOT NULL,
  item_title TEXT NOT NULL,
  amount_bdt NUMERIC(10, 2) NOT NULL,
  gateway TEXT NOT NULL CHECK (gateway IN ('bkash', 'nagad', 'rocket', 'card')),
  transaction_id TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  status TEXT DEFAULT 'successful' CHECK (status IN ('initiated', 'pending', 'successful', 'failed', 'cancelled', 'refunded')),
  invoice_number TEXT UNIQUE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 13. MENTOR EARNINGS & FINANCIAL LEDGER
CREATE TABLE IF NOT EXISTS public.mentor_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('course', 'class')),
  item_id UUID NOT NULL,
  gross_amount_bdt NUMERIC(10, 2) NOT NULL,
  commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 20.0, -- Default 20% platform cut
  platform_fee_bdt NUMERIC(10, 2) NOT NULL,
  net_amount_bdt NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('pending', 'available', 'paid', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 14. MENTOR PAYOUTS TABLE
CREATE TABLE IF NOT EXISTS public.mentor_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_bdt NUMERIC(10, 2) NOT NULL CHECK (amount_bdt >= 500), -- Minimum 500 BDT
  payout_method TEXT NOT NULL CHECK (payout_method IN ('bkash', 'nagad', 'rocket', 'bank')),
  account_number TEXT NOT NULL,
  account_name TEXT,
  bank_name TEXT,
  branch_name TEXT,
  routing_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  transaction_ref TEXT,
  requested_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  processed_at TIMESTAMPTZ
);

-- 15. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('matching', 'call', 'subscription', 'payment', 'class', 'course', 'payout', 'system')),
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 16. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('mentor', 'course', 'class')),
  target_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, target_type, target_id)
);

-- 17. LEARNING PROGRESS & GAMIFICATION TABLE
CREATE TABLE IF NOT EXISTS public.learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_minutes_total INTEGER DEFAULT 0,
  practice_sessions_total INTEGER DEFAULT 0,
  current_streak_days INTEGER DEFAULT 1,
  longest_streak_days INTEGER DEFAULT 1,
  last_practice_date DATE DEFAULT CURRENT_DATE,
  xp_points INTEGER DEFAULT 50,
  speaking_level TEXT DEFAULT 'Intermediate' CHECK (speaking_level IN ('Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'Fluent')),
  badges JSONB DEFAULT '["First Step", "Community Welcome"]'::jsonb,
  quizzes_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 18. PLATFORM SETTINGS TABLE (Configurable Platform Commission & Limits)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Seed Default Settings
INSERT INTO public.platform_settings (key, value)
VALUES
  ('commission', '{"default_rate": 20, "min_payout_bdt": 500, "allow_auto_approval": false}'::jsonb),
  ('practice_limits', '{"free_daily_minutes": 15, "call_timeout_seconds": 15, "priority_matching": true}'::jsonb),
  ('supported_gateways', '["bkash", "nagad", "rocket", "card"]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_courses_mentor ON public.courses(mentor_id, status);
CREATE INDEX IF NOT EXISTS idx_courses_category_level ON public.courses(category, level, price_bdt);
CREATE INDEX IF NOT EXISTS idx_live_classes_schedule ON public.live_classes(scheduled_at, status);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_mentor_earnings_mentor ON public.mentor_earnings(mentor_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user ON public.course_enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_user ON public.class_enrollments(user_id, class_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- POLICIES: membership_plans
CREATE POLICY "Membership plans readable by all" ON public.membership_plans FOR SELECT USING (true);

-- POLICIES: courses & lessons
CREATE POLICY "Published courses readable by all" ON public.courses FOR SELECT USING (status = 'published' OR auth.uid() = mentor_id);
CREATE POLICY "Mentors can manage own courses" ON public.courses FOR ALL TO authenticated USING (auth.uid() = mentor_id) WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Course sections readable by all" ON public.course_sections FOR SELECT USING (true);
CREATE POLICY "Course lessons readable by enrolled or preview" ON public.course_lessons FOR SELECT USING (
  is_preview = true OR EXISTS (
    SELECT 1 FROM public.course_enrollments ce
    JOIN public.course_sections cs ON cs.course_id = ce.course_id
    WHERE cs.id = section_id AND ce.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.course_sections cs ON cs.course_id = c.id
    WHERE cs.id = section_id AND c.mentor_id = auth.uid()
  )
);

-- POLICIES: live_classes
CREATE POLICY "Live classes viewable by all" ON public.live_classes FOR SELECT USING (true);
CREATE POLICY "Mentors manage own classes" ON public.live_classes FOR ALL TO authenticated USING (auth.uid() = mentor_id) WITH CHECK (auth.uid() = mentor_id);

-- POLICIES: enrollments
CREATE POLICY "Users view own course enrollments" ON public.course_enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users enroll in courses" ON public.course_enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own course progress" ON public.course_enrollments FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users view own class enrollments" ON public.class_enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users register for classes" ON public.class_enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- POLICIES: payments
CREATE POLICY "Users view own payments" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users initiate own payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- POLICIES: mentor earnings & payouts
CREATE POLICY "Mentors view own earnings" ON public.mentor_earnings FOR SELECT TO authenticated USING (auth.uid() = mentor_id);
CREATE POLICY "Mentors manage own payouts" ON public.mentor_payouts FOR ALL TO authenticated USING (auth.uid() = mentor_id) WITH CHECK (auth.uid() = mentor_id);

-- POLICIES: notifications
CREATE POLICY "Users view and update own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id);

-- POLICIES: learning progress
CREATE POLICY "Users manage own learning progress" ON public.learning_progress FOR ALL TO authenticated USING (auth.uid() = user_id);
