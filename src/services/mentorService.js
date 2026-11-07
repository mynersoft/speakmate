/**
 * Mentor Management & Earnings Service
 * Handles mentor applications, approval workflow, mentor profiles, and payout requests.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const INITIAL_MENTORS = [
  {
    id: 'mentor-sarah-johnson',
    user_id: 'mentor-sarah-johnson',
    display_name: 'Sarah Johnson, CELTA',
    headline: 'Native Accent Coach & Cambridge Certified Teacher',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    bio: '8+ years teaching English across Asia and Europe. Specializes in conversational spontaneity, phonetics, and American idioms.',
    teaching_experience: '8+ years at Cambridge Language Academy & British Council affiliate',
    skills: ['American Accent', 'Spoken English', 'Idioms & Phrasal Verbs', 'Fluency Drills'],
    languages: ['English (Native)', 'French (Conversational)'],
    total_students: 480,
    rating: 4.95,
    review_count: 112,
    hourly_rate_bdt: 800,
    is_approved: true,
  },
  {
    id: 'mentor-dr-arif-hossain',
    user_id: 'mentor-dr-arif-hossain',
    display_name: 'Dr. Arif Hossain, PhD',
    headline: 'Former IELTS Examiner & Applied Linguistics Specialist',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    bio: 'Assisted 1,200+ students in scoring Band 7.5 to 8.5. Teaches strategic cue-card development, lexical diversity, and coherence.',
    teaching_experience: '12 years teaching university linguistics and IELTS preparation',
    skills: ['IELTS Speaking', 'Academic Writing', 'Grammar Precision', 'Public Speaking'],
    languages: ['English', 'Bengali'],
    total_students: 890,
    rating: 4.98,
    review_count: 245,
    hourly_rate_bdt: 1000,
    is_approved: true,
  },
  {
    id: 'mentor-michael-clark',
    user_id: 'mentor-michael-clark',
    display_name: 'Michael Clark, MBA',
    headline: 'Global Tech Executive & Business Communication Mentor',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    bio: 'Silicon Valley tech veteran helping software engineers and leaders communicate with poise, master negotiations, and lead teams.',
    teaching_experience: '6 years corporate executive coaching',
    skills: ['Executive Presentations', 'Tech Job Interviews', 'Salary Negotiation', 'Cross-Cultural Communication'],
    languages: ['English (Native)'],
    total_students: 310,
    rating: 4.91,
    review_count: 78,
    hourly_rate_bdt: 1200,
    is_approved: true,
  },
  {
    id: 'mentor-tania-rahman',
    user_id: 'mentor-tania-rahman',
    display_name: 'Tania Rahman',
    headline: 'Friendly Beginner Specialist & Pronunciation Coach',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    bio: 'Patient mentor passionate about helping nervous beginners speak up without fear of making mistakes. Warm and encouraging atmosphere.',
    teaching_experience: '5 years primary & adult conversational tutor',
    skills: ['Zero-Fear Speaking', 'Daily Small Talk', 'Pronunciation', 'Listening Skills'],
    languages: ['English', 'Bengali', 'Hindi'],
    total_students: 650,
    rating: 4.88,
    review_count: 140,
    hourly_rate_bdt: 600,
    is_approved: true,
  }
];

const LOCAL_APPLICATIONS_KEY = 'speakmate_mentor_applications';
const LOCAL_PAYOUTS_KEY = 'speakmate_mentor_payouts';

function getLocalApplications() {
  try {
    const raw = localStorage.getItem(LOCAL_APPLICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function saveLocalApplication(app) {
  try {
    const apps = getLocalApplications();
    const existingIdx = apps.findIndex((a) => a.user_id === app.user_id);
    if (existingIdx >= 0) {
      apps[existingIdx] = { ...apps[existingIdx], ...app };
    } else {
      apps.push(app);
    }
    localStorage.setItem(LOCAL_APPLICATIONS_KEY, JSON.stringify(apps));
  } catch (_) {}
}

export const mentorService = {
  /**
   * Get all approved mentors
   */
  async getMentors({ search = '', skill = 'all' } = {}) {
    let mentors = [...INITIAL_MENTORS];

    // Check if current user is approved mentor
    const apps = getLocalApplications();
    apps.forEach((app) => {
      if (app.status === 'approved' && !mentors.some((m) => m.user_id === app.user_id)) {
        mentors.push({
          id: app.user_id,
          user_id: app.user_id,
          display_name: app.display_name,
          headline: 'Community English Mentor',
          avatar_url: '',
          bio: app.introduction,
          teaching_experience: app.teaching_experience,
          skills: app.skills || ['Spoken English'],
          languages: ['English', 'Bengali'],
          total_students: 12,
          rating: 5.0,
          review_count: 3,
          hourly_rate_bdt: 600,
          is_approved: true,
        });
      }
    });

    return mentors.filter((m) => {
      if (skill !== 'all' && !m.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matchName = m.display_name.toLowerCase().includes(q);
        const matchBio = m.bio.toLowerCase().includes(q);
        const matchSkill = m.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchBio && !matchSkill) return false;
      }
      return true;
    });
  },

  /**
   * Get mentor by ID
   */
  async getMentorById(mentorId) {
    const mentors = await this.getMentors();
    return mentors.find((m) => m.id === mentorId || m.user_id === mentorId) || null;
  },

  /**
   * Submit mentor application
   */
  async submitApplication(applicationData, user) {
    const newApp = {
      id: `app_${Date.now()}`,
      user_id: user.id,
      display_name: applicationData.display_name || user.email?.split('@')[0],
      teaching_experience: applicationData.teaching_experience,
      skills: applicationData.skills || [],
      english_proficiency: applicationData.english_proficiency || 'C1 Advanced',
      introduction: applicationData.introduction,
      intro_video_url: applicationData.intro_video_url || '',
      phone_or_whatsapp: applicationData.phone_or_whatsapp || '',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    saveLocalApplication(newApp);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('mentor_applications').upsert({
          user_id: user.id,
          display_name: newApp.display_name,
          teaching_experience: newApp.teaching_experience,
          skills: newApp.skills,
          english_proficiency: newApp.english_proficiency,
          introduction: newApp.introduction,
          intro_video_url: newApp.intro_video_url,
          phone_or_whatsapp: newApp.phone_or_whatsapp,
          status: 'pending',
        }, { onConflict: 'user_id' });
      } catch (_) {}
    }

    return newApp;
  },

  /**
   * Check status of mentor application
   */
  async getMyApplication(userId) {
    if (!userId) return null;
    const apps = getLocalApplications();
    const local = apps.find((a) => a.user_id === userId);
    if (local) return local;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('mentor_applications')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (data) return data;
      } catch (_) {}
    }

    return null;
  },

  /**
   * Check if user is an approved mentor
   */
  async isMentorApproved(userId) {
    if (!userId) return false;
    const app = await this.getMyApplication(userId);
    return app?.status === 'approved';
  },

  /**
   * Request payout
   */
  async requestPayout({ mentorId, amountBdt, method, accountNumber, accountName, bankName }) {
    try {
      const response = await fetch('/api/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId, amountBdt, method, accountNumber, accountName, bankName }),
      });
      return await response.json();
    } catch (_) {
      // Local fallback
      return {
        success: true,
        payoutId: `po_${Date.now()}`,
        amountBdt,
        status: 'pending',
        message: 'Payout request received. Processing via Bangladesh MFS.',
      };
    }
  }
};
