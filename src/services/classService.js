/**
 * Live Classes and Interactive Classroom Service
 * Manages Free and Paid Live Classes, Admission, Attendance, and WebRTC Room IDs
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const INITIAL_CLASSES = [
  {
    id: 'class-fluency-speed-jam',
    mentor_id: 'mentor-sarah-johnson',
    mentor_name: 'Sarah Johnson',
    mentor_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    title: 'Live Fluency Speed Jam: Thinking in English Under Pressure',
    description: 'An interactive high-energy speaking workout. We practice rapid-fire Q&A, spontaneous storytelling, and debate drills.',
    topic: 'Conversational Fluency',
    level: 'Intermediate',
    scheduled_at: new Date(Date.now() + 2 * 3600 * 1000).toISOString(), // in 2 hours
    duration_minutes: 45,
    max_capacity: 20,
    enrolled_count: 14,
    is_free: true,
    price_bdt: 0,
    thumbnail_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600',
    status: 'published',
    meeting_room_id: 'room-fluency-speed-jam'
  },
  {
    id: 'class-ielts-speaking-live-critique',
    mentor_id: 'mentor-dr-arif-hossain',
    mentor_name: 'Dr. Arif Hossain',
    mentor_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    title: 'IELTS Speaking Live Mock Test & Instant Band 8 Scoring',
    description: 'Live one-on-one mock test rounds with Dr. Arif. Get real-time feedback on lexical resource, fluency, and grammar slips.',
    topic: 'IELTS Speaking',
    level: 'Advanced',
    scheduled_at: new Date(Date.now() + 6 * 3600 * 1000).toISOString(), // in 6 hours
    duration_minutes: 60,
    max_capacity: 12,
    enrolled_count: 9,
    is_free: false,
    price_bdt: 450,
    thumbnail_url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=600',
    status: 'published',
    meeting_room_id: 'room-ielts-mock'
  },
  {
    id: 'class-tech-interview-prep',
    mentor_id: 'mentor-michael-clark',
    mentor_name: 'Michael Clark',
    mentor_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    title: 'Executive Tech Interview: Answering "Tell Me About Yourself"',
    description: 'Break down the #1 interview question with executive hiring standards. Learn to position your accomplishments effectively.',
    topic: 'Interview Skills',
    level: 'All Levels',
    scheduled_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // tomorrow
    duration_minutes: 60,
    max_capacity: 25,
    enrolled_count: 18,
    is_free: false,
    price_bdt: 600,
    thumbnail_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600',
    status: 'published',
    meeting_room_id: 'room-tech-interview'
  },
  {
    id: 'class-daily-pronunciation-circle',
    mentor_id: 'mentor-tania-rahman',
    mentor_name: 'Tania Rahman',
    mentor_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    title: 'Daily Pronunciation Circle: Silent Letters & Tricky Sounds',
    description: 'Practice mouth positioning for "th", "w" vs "v", "p" vs "f", and common silent letters that confuse non-native speakers.',
    topic: 'Pronunciation',
    level: 'Beginner',
    scheduled_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    duration_minutes: 40,
    max_capacity: 30,
    enrolled_count: 22,
    is_free: true,
    price_bdt: 0,
    thumbnail_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600',
    status: 'published',
    meeting_room_id: 'room-pronunciation-circle'
  }
];

const LOCAL_CLASS_ENROLLMENTS_KEY = 'speakmate_class_enrollments';
const LOCAL_CUSTOM_CLASSES_KEY = 'speakmate_custom_classes';

function getLocalClassEnrollments() {
  try {
    const raw = localStorage.getItem(LOCAL_CLASS_ENROLLMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function saveLocalClassEnrollment(enrollment) {
  try {
    const enrollments = getLocalClassEnrollments();
    const existingIdx = enrollments.findIndex(
      (e) => e.user_id === enrollment.user_id && e.class_id === enrollment.class_id
    );
    if (existingIdx >= 0) {
      enrollments[existingIdx] = { ...enrollments[existingIdx], ...enrollment };
    } else {
      enrollments.push(enrollment);
    }
    localStorage.setItem(LOCAL_CLASS_ENROLLMENTS_KEY, JSON.stringify(enrollments));
  } catch (_) {}
}

function getLocalCustomClasses() {
  try {
    const raw = localStorage.getItem(LOCAL_CUSTOM_CLASSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function saveLocalCustomClass(cls) {
  try {
    const custom = getLocalCustomClasses();
    custom.unshift(cls);
    localStorage.setItem(LOCAL_CUSTOM_CLASSES_KEY, JSON.stringify(custom));
  } catch (_) {}
}

export const classService = {
  /**
   * Get all live classes with filters
   */
  async getLiveClasses({ type = 'all', level = 'all', search = '' } = {}) {
    let classes = [...INITIAL_CLASSES, ...getLocalCustomClasses()];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('live_classes')
          .select(`
            *,
            profiles:mentor_id (display_name, avatar_url)
          `)
          .in('status', ['published', 'live'])
          .order('scheduled_at', { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          const remote = data.map((c) => ({
            ...c,
            mentor_name: c.profiles?.display_name || 'English Mentor',
            mentor_avatar: c.profiles?.avatar_url || '',
          }));
          const existingIds = new Set(classes.map((c) => c.id));
          remote.forEach((rc) => {
            if (!existingIds.has(rc.id)) classes.unshift(rc);
          });
        }
      } catch (_) {}
    }

    return classes.filter((c) => {
      if (type === 'free' && !c.is_free) return false;
      if (type === 'paid' && c.is_free) return false;
      if (level !== 'all' && c.level !== level) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!c.title.toLowerCase().includes(q) && !c.topic.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  },

  /**
   * Get class by ID
   */
  async getClassById(classId) {
    const classes = [...INITIAL_CLASSES, ...getLocalCustomClasses()];
    const match = classes.find((c) => c.id === classId);
    if (match) return match;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('live_classes')
          .select('*, profiles:mentor_id (display_name, avatar_url)')
          .eq('id', classId)
          .single();
        if (data) {
          return {
            ...data,
            mentor_name: data.profiles?.display_name || 'Mentor',
            mentor_avatar: data.profiles?.avatar_url || '',
          };
        }
      } catch (_) {}
    }
    return null;
  },

  /**
   * Check if user is registered for a class
   */
  isUserRegistered(userId, classId) {
    if (!userId || !classId) return false;
    const enrollments = getLocalClassEnrollments();
    return enrollments.some((e) => e.user_id === userId && e.class_id === classId && e.status !== 'cancelled');
  },

  /**
   * Register for class (Free or Verified Paid admission)
   */
  async registerForClass(userId, classId, paymentId = null) {
    if (!userId || !classId) throw new Error('User and Class ID required');

    const cls = await this.getClassById(classId);
    if (!cls) throw new Error('Live class not found');

    // Capacity verification
    if (cls.enrolled_count >= cls.max_capacity) {
      throw new Error('This live class has reached maximum capacity.');
    }

    const enrollmentRecord = {
      id: `cenr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      class_id: classId,
      class_title: cls.title,
      scheduled_at: cls.scheduled_at,
      duration_minutes: cls.duration_minutes,
      mentor_name: cls.mentor_name,
      meeting_room_id: cls.meeting_room_id,
      payment_id: paymentId,
      status: 'registered',
      enrolled_at: new Date().toISOString(),
    };

    saveLocalClassEnrollment(enrollmentRecord);
    cls.enrolled_count = (cls.enrolled_count || 0) + 1;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('class_enrollments').upsert({
          class_id: classId,
          user_id: userId,
          payment_id: paymentId,
          status: 'registered',
          enrolled_at: new Date().toISOString(),
        }, { onConflict: 'class_id,user_id' });

        await supabase
          .from('live_classes')
          .update({ enrolled_count: cls.enrolled_count })
          .eq('id', classId);
      } catch (_) {}
    }

    return enrollmentRecord;
  },

  /**
   * Cancel registration
   */
  async cancelRegistration(userId, classId) {
    const enrollments = getLocalClassEnrollments();
    const target = enrollments.find((e) => e.user_id === userId && e.class_id === classId);
    if (target) {
      target.status = 'cancelled';
      localStorage.setItem(LOCAL_CLASS_ENROLLMENTS_KEY, JSON.stringify(enrollments));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('class_enrollments')
          .update({ status: 'cancelled' })
          .eq('class_id', classId)
          .eq('user_id', userId);
      } catch (_) {}
    }
    return true;
  },

  /**
   * Get user enrolled classes
   */
  async getMyClasses(userId) {
    if (!userId) return [];
    const enrollments = getLocalClassEnrollments().filter(
      (e) => e.user_id === userId && e.status !== 'cancelled'
    );
    return enrollments;
  },

  /**
   * Create live class (Mentor)
   */
  async createLiveClass(classData, mentorUser) {
    const classId = `class_${Date.now()}`;
    const newClass = {
      id: classId,
      mentor_id: mentorUser.id,
      mentor_name: mentorUser.display_name || mentorUser.email?.split('@')[0] || 'Mentor',
      mentor_avatar: mentorUser.avatar_url || '',
      title: classData.title,
      description: classData.description,
      topic: classData.topic,
      level: classData.level || 'Intermediate',
      scheduled_at: classData.scheduled_at,
      duration_minutes: Number(classData.duration_minutes) || 45,
      max_capacity: Number(classData.max_capacity) || 20,
      enrolled_count: 0,
      is_free: Number(classData.price_bdt) === 0,
      price_bdt: Number(classData.price_bdt) || 0,
      thumbnail_url: classData.thumbnail_url || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600',
      meeting_room_id: `room_${classId}`,
      status: 'published',
    };

    saveLocalCustomClass(newClass);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('live_classes').insert({
          id: classId,
          mentor_id: mentorUser.id,
          title: newClass.title,
          description: newClass.description,
          topic: newClass.topic,
          level: newClass.level,
          scheduled_at: newClass.scheduled_at,
          duration_minutes: newClass.duration_minutes,
          max_capacity: newClass.max_capacity,
          is_free: newClass.is_free,
          price_bdt: newClass.price_bdt,
          meeting_room_id: newClass.meeting_room_id,
          status: 'published',
        });
      } catch (_) {}
    }

    return newClass;
  }
};
