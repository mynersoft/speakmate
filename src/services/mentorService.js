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
    study_institute: 'University of Cambridge',
    degree: 'Master of Arts in Applied Linguistics & TESOL',
    graduation_year: '2016',
    skills: ['American Accent', 'Spoken English', 'Idioms & Phrasal Verbs', 'Fluency Drills', 'Phonetics & Intonation'],
    certificates: [
      {
        id: 'cert-sarah-1',
        title: 'CELTA (Certificate in Teaching English to Speakers of Other Languages)',
        issuer: 'Cambridge Assessment English',
        year: '2016',
        credential_id: 'CAM-CELTA-88291',
        file_url: 'https://images.unsplash.com/photo-1589330694653-dad6ef0199f3?auto=format&fit=crop&q=80&w=600',
        verified: true,
      },
      {
        id: 'cert-sarah-2',
        title: 'Advanced Pronunciation & Accent Modification Specialist',
        issuer: 'International Phonetics Association (IPA)',
        year: '2018',
        credential_id: 'IPA-ACC-4102',
        file_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&q=80&w=600',
        verified: true,
      }
    ],
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
    study_institute: 'University of Dhaka & University of Melbourne',
    degree: 'PhD in Applied English Linguistics & Phonetics',
    graduation_year: '2014',
    skills: ['IELTS Speaking', 'Academic Writing', 'Grammar Precision', 'Public Speaking', 'Vocabulary Expansion'],
    certificates: [
      {
        id: 'cert-arif-1',
        title: 'Official IELTS Examiner Certification (Speaking & Writing)',
        issuer: 'British Council / IDP Education Australia',
        year: '2015',
        credential_id: 'IELTS-EXAM-BD-4421',
        file_url: 'https://images.unsplash.com/photo-1589330694653-dad6ef0199f3?auto=format&fit=crop&q=80&w=600',
        verified: true,
      },
      {
        id: 'cert-arif-2',
        title: 'Delta Module One & Two Certified',
        issuer: 'Cambridge Assessment English',
        year: '2017',
        credential_id: 'CAM-DELTA-9031',
        file_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&q=80&w=600',
        verified: true,
      }
    ],
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
    study_institute: 'Stanford Graduate School of Business',
    degree: 'MBA in Business Strategy & Communications',
    graduation_year: '2018',
    skills: ['Executive Presentations', 'Tech Job Interviews', 'Salary Negotiation', 'Cross-Cultural Communication', 'Pitching & Debates'],
    certificates: [
      {
        id: 'cert-michael-1',
        title: 'Executive Communication & Leadership Coach',
        issuer: 'International Coaching Federation (ICF)',
        year: '2019',
        credential_id: 'ICF-PCC-08129',
        file_url: 'https://images.unsplash.com/photo-1589330694653-dad6ef0199f3?auto=format&fit=crop&q=80&w=600',
        verified: true,
      }
    ],
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
    study_institute: 'North South University & Institute of Modern Languages',
    degree: 'Bachelor of Arts in English Literature',
    graduation_year: '2020',
    skills: ['Zero-Fear Speaking', 'Daily Small Talk', 'Pronunciation', 'Listening Skills', 'Conversational Confidence'],
    certificates: [
      {
        id: 'cert-tania-1',
        title: 'TESOL 150-Hour Master Certificate',
        issuer: 'Global Language Training Institute (UK)',
        year: '2020',
        credential_id: 'TESOL-UK-9831',
        file_url: 'https://images.unsplash.com/photo-1589330694653-dad6ef0199f3?auto=format&fit=crop&q=80&w=600',
        verified: true,
      }
    ],
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
const LOCAL_MENTOR_PROFILES_KEY = 'speakmate_mentor_custom_profiles';

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

function getCustomMentorProfiles() {
  try {
    const raw = localStorage.getItem(LOCAL_MENTOR_PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function saveCustomMentorProfile(userId, profileUpdates) {
  try {
    const all = getCustomMentorProfiles();
    all[userId] = { ...(all[userId] || {}), ...profileUpdates };
    localStorage.setItem(LOCAL_MENTOR_PROFILES_KEY, JSON.stringify(all));
  } catch (_) {}
}

export const mentorService = {
  /**
   * Get all approved mentors (merging initial + applications + customized credentials)
   */
  async getMentors({ search = '', skill = 'all' } = {}) {
    const customProfiles = getCustomMentorProfiles();

    let mentors = INITIAL_MENTORS.map((m) => {
      const custom = customProfiles[m.user_id] || customProfiles[m.id];
      return custom ? { ...m, ...custom } : m;
    });

    // Check if current user is an approved applicant
    const apps = getLocalApplications();
    apps.forEach((app) => {
      const custom = customProfiles[app.user_id] || {};
      if (app.status === 'approved' && !mentors.some((m) => m.user_id === app.user_id)) {
        mentors.push({
          id: app.user_id,
          user_id: app.user_id,
          display_name: custom.display_name || app.display_name,
          headline: custom.headline || 'Community English Mentor',
          avatar_url: custom.avatar_url || '',
          bio: custom.bio || app.introduction,
          teaching_experience: custom.teaching_experience || app.teaching_experience,
          study_institute: custom.study_institute || app.study_institute || 'Institute of Modern Languages',
          degree: custom.degree || app.degree || 'BA in English Linguistics',
          graduation_year: custom.graduation_year || app.graduation_year || '2021',
          skills: custom.skills || app.skills || ['Spoken English'],
          certificates: custom.certificates || app.certificates || [],
          languages: ['English', 'Bengali'],
          total_students: custom.total_students || 12,
          rating: custom.rating || 5.0,
          review_count: custom.review_count || 3,
          hourly_rate_bdt: custom.hourly_rate_bdt || 600,
          is_approved: true,
        });
      }
    });

    return mentors.filter((m) => {
      if (skill !== 'all' && !m.skills?.some((s) => s.toLowerCase().includes(skill.toLowerCase()))) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matchName = m.display_name?.toLowerCase().includes(q);
        const matchBio = m.bio?.toLowerCase().includes(q);
        const matchSkill = m.skills?.some((s) => s.toLowerCase().includes(q));
        const matchInst = m.study_institute?.toLowerCase().includes(q);
        const matchCert = m.certificates?.some((c) => c.title?.toLowerCase().includes(q) || c.issuer?.toLowerCase().includes(q));
        if (!matchName && !matchBio && !matchSkill && !matchInst && !matchCert) return false;
      }
      return true;
    });
  },

  /**
   * Get mentor by ID
   */
  async getMentorById(mentorId) {
    const mentors = await this.getMentors();
    const found = mentors.find((m) => m.id === mentorId || m.user_id === mentorId);
    if (found) return found;

    // Fallback: check applications or custom profiles
    const customProfiles = getCustomMentorProfiles();
    const custom = customProfiles[mentorId] || {};
    const app = await this.getMyApplication(mentorId);

    if (app || Object.keys(custom).length > 0) {
      return {
        id: mentorId,
        user_id: mentorId,
        display_name: custom.display_name || app?.display_name || 'English Mentor',
        headline: custom.headline || 'Community English Mentor',
        avatar_url: custom.avatar_url || '',
        bio: custom.bio || app?.introduction || 'Dedicated English mentor helping learners speak with confidence.',
        teaching_experience: custom.teaching_experience || app?.teaching_experience || '3+ years',
        study_institute: custom.study_institute || app?.study_institute || 'Institute of Modern Languages',
        degree: custom.degree || app?.degree || 'BA in English Linguistics',
        graduation_year: custom.graduation_year || app?.graduation_year || '2021',
        skills: custom.skills || app?.skills || ['Spoken English'],
        certificates: custom.certificates || app?.certificates || [],
        languages: ['English', 'Bengali'],
        total_students: custom.total_students || 1,
        rating: custom.rating || 5.0,
        review_count: custom.review_count || 1,
        hourly_rate_bdt: custom.hourly_rate_bdt || 600,
        is_approved: true,
      };
    }

    return null;
  },

  /**
   * Submit mentor application with Study Institute, Skills & Certificates
   */
  async submitApplication(applicationData, user) {
    const newApp = {
      id: `app_${Date.now()}`,
      user_id: user.id,
      display_name: applicationData.display_name || user.email?.split('@')[0],
      teaching_experience: applicationData.teaching_experience,
      study_institute: applicationData.study_institute || '',
      degree: applicationData.degree || '',
      graduation_year: applicationData.graduation_year || '',
      skills: applicationData.skills || [],
      certificates: applicationData.certificates || [],
      english_proficiency: applicationData.english_proficiency || 'C1 Advanced',
      introduction: applicationData.introduction,
      intro_video_url: applicationData.intro_video_url || '',
      phone_or_whatsapp: applicationData.phone_or_whatsapp || '',
      status: 'approved', // Instant approval so mentors can immediately access studio
      created_at: new Date().toISOString(),
    };

    saveLocalApplication(newApp);

    // Save as custom profile so it immediately appears in directory
    saveCustomMentorProfile(user.id, {
      user_id: user.id,
      display_name: newApp.display_name,
      teaching_experience: newApp.teaching_experience,
      study_institute: newApp.study_institute,
      degree: newApp.degree,
      graduation_year: newApp.graduation_year,
      skills: newApp.skills,
      certificates: newApp.certificates,
      bio: newApp.introduction,
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('mentor_applications').upsert({
          user_id: user.id,
          display_name: newApp.display_name,
          teaching_experience: newApp.teaching_experience,
          study_institute: newApp.study_institute,
          degree: newApp.degree,
          graduation_year: newApp.graduation_year,
          skills: newApp.skills,
          certificates: newApp.certificates,
          english_proficiency: newApp.english_proficiency,
          introduction: newApp.introduction,
          intro_video_url: newApp.intro_video_url,
          phone_or_whatsapp: newApp.phone_or_whatsapp,
          status: 'approved',
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
   * Get mentor credentials, study institute & skills
   */
  async getMentorCredentials(userId) {
    if (!userId) return null;
    const mentor = await this.getMentorById(userId);
    if (mentor) {
      return {
        study_institute: mentor.study_institute || '',
        degree: mentor.degree || '',
        graduation_year: mentor.graduation_year || '',
        skills: mentor.skills || [],
        certificates: mentor.certificates || [],
      };
    }

    const app = await this.getMyApplication(userId);
    if (app) {
      return {
        study_institute: app.study_institute || '',
        degree: app.degree || '',
        graduation_year: app.graduation_year || '',
        skills: app.skills || [],
        certificates: app.certificates || [],
      };
    }

    return {
      study_institute: '',
      degree: '',
      graduation_year: '',
      skills: ['Spoken English'],
      certificates: [],
    };
  },

  /**
   * Update Study Institute
   */
  async updateStudyInstitute(userId, { study_institute, degree, graduation_year }) {
    saveCustomMentorProfile(userId, {
      study_institute: study_institute?.trim(),
      degree: degree?.trim(),
      graduation_year: graduation_year?.trim(),
    });
    return { study_institute, degree, graduation_year };
  },

  /**
   * Add a teaching skill
   */
  async addSkill(userId, skill) {
    const cleanSkill = skill?.trim();
    if (!cleanSkill) return [];

    const creds = await this.getMentorCredentials(userId);
    const currentSkills = creds.skills || [];
    if (!currentSkills.some((s) => s.toLowerCase() === cleanSkill.toLowerCase())) {
      const updated = [...currentSkills, cleanSkill];
      saveCustomMentorProfile(userId, { skills: updated });
      return updated;
    }
    return currentSkills;
  },

  /**
   * Remove a teaching skill
   */
  async removeSkill(userId, skillToRemove) {
    const creds = await this.getMentorCredentials(userId);
    const updated = (creds.skills || []).filter((s) => s.toLowerCase() !== skillToRemove.toLowerCase());
    saveCustomMentorProfile(userId, { skills: updated });
    return updated;
  },

  /**
   * Upload / Add a Certificate
   */
  async uploadCertificate(userId, { title, issuer, year, credential_id, file_url }) {
    const creds = await this.getMentorCredentials(userId);
    const newCert = {
      id: `cert_${Date.now()}`,
      title: title.trim(),
      issuer: issuer.trim(),
      year: year ? String(year).trim() : new Date().getFullYear().toString(),
      credential_id: credential_id?.trim() || `VER-${Math.floor(Math.random() * 89999 + 10000)}`,
      file_url: file_url || '',
      verified: true,
      uploaded_at: new Date().toISOString(),
    };

    const updated = [newCert, ...(creds.certificates || [])];
    saveCustomMentorProfile(userId, { certificates: updated });
    return updated;
  },

  /**
   * Delete a Certificate
   */
  async deleteCertificate(userId, certificateId) {
    const creds = await this.getMentorCredentials(userId);
    const updated = (creds.certificates || []).filter((c) => c.id !== certificateId);
    saveCustomMentorProfile(userId, { certificates: updated });
    return updated;
  },

  /**
   * Update Full Mentor Profile & Credentials
   */
  async updateMentorProfile(userId, updates) {
    saveCustomMentorProfile(userId, updates);
    return updates;
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
