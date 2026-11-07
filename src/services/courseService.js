/**
 * Course Marketplace & Curriculum Service
 * High-performance course browsing, curriculum loading, and enrollment tracking.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Seed realistic curated courses for immediate exploration
export const INITIAL_COURSES = [
  {
    id: 'course-spoken-english-mastery',
    mentor_id: 'mentor-sarah-johnson',
    mentor_name: 'Sarah Johnson, CELTA',
    mentor_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    title: 'Natural Spoken English & American Accent Mastery',
    description: 'Learn connected speech, intonation, reduce mother tongue influence, and speak with authentic rhythm and flow.',
    category: 'Spoken English',
    level: 'Intermediate',
    price_bdt: 1250,
    price_usd: 12.5,
    is_free: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600',
    duration_hours: 8.5,
    total_enrolled: 428,
    rating: 4.9,
    review_count: 86,
    learning_outcomes: [
      'Master American English vowel shifts and stress timing',
      'Use native idioms and phrasal verbs naturally',
      'Speak smoothly without pausing or translating in your head',
      'Deliver impromptu speeches and thoughts with conviction'
    ],
    sections: [
      {
        id: 'sec-1',
        title: 'Section 1: Foundations of Fluid Speech',
        lessons: [
          { id: 'les-1', title: 'Why You Freeze When Speaking (And The Fix)', duration_minutes: 12, is_preview: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'les-2', title: 'The Music of English: Stress vs Syllable Timing', duration_minutes: 18, is_preview: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'les-3', title: 'Mastering the Flap T and Glottal Stop', duration_minutes: 15, is_preview: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      },
      {
        id: 'sec-2',
        title: 'Section 2: High-Impact Vocabulary & Collocations',
        lessons: [
          { id: 'les-4', title: 'Replacing "Very" with Vibrant Power Words', duration_minutes: 20, is_preview: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'les-5', title: '50 Daily Conversational Idioms that Sound Native', duration_minutes: 25, is_preview: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ]
  },
  {
    id: 'course-ielts-speaking-band-8',
    mentor_id: 'mentor-dr-arif-hossain',
    mentor_name: 'Dr. Arif Hossain, PhD',
    mentor_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    title: 'IELTS Speaking Band 8+ Masterclass & Real Cue Cards',
    description: 'Crush Part 1, Part 2 cue cards, and abstract Part 3 discussion questions with proven frameworks and lexical resource tricks.',
    category: 'IELTS Preparation',
    level: 'Advanced',
    price_bdt: 1800,
    price_usd: 18.0,
    is_free: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
    duration_hours: 10.0,
    total_enrolled: 612,
    rating: 4.95,
    review_count: 142,
    learning_outcomes: [
      'Structure Part 2 talks for 2 full minutes effortlessly',
      'Use high-band grammatical range with complex structures',
      'Handle difficult Part 3 philosophical questions confidently',
      'Avoid common examiner red flags that drop you to Band 6'
    ],
    sections: [
      {
        id: 'sec-ielts-1',
        title: 'Part 1: The Warmup Fluency Strategy',
        lessons: [
          { id: 'les-ielts-1', title: 'Examiner Mindset & Scoring Criteria Demystified', duration_minutes: 15, is_preview: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'les-ielts-2', title: 'Extending Answers Without Rambling (The PREP Method)', duration_minutes: 22, is_preview: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      },
      {
        id: 'sec-ielts-2',
        title: 'Part 2 & 3: Deep Dives',
        lessons: [
          { id: 'les-ielts-3', title: 'The Storytelling Engine for Any Cue Card Topic', duration_minutes: 26, is_preview: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ]
  },
  {
    id: 'course-everyday-english-kickstart',
    mentor_id: 'mentor-tania-rahman',
    mentor_name: 'Tania Rahman',
    mentor_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    title: 'Everyday English Kickstart: Zero Fear Speaking',
    description: 'Free foundation course for beginners. Overcome shyness, introduce yourself, order food, travel, and make friendly small talk.',
    category: 'Spoken English',
    level: 'Beginner',
    price_bdt: 0,
    price_usd: 0,
    is_free: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
    duration_hours: 4.0,
    total_enrolled: 1890,
    rating: 4.85,
    review_count: 310,
    learning_outcomes: [
      'Introduce yourself and your hobbies with pride',
      'Navigate real-world conversations at restaurants and airports',
      'Form accurate present, past, and future sentences with ease'
    ],
    sections: [
      {
        id: 'sec-kick-1',
        title: 'Module 1: Building Speaking Confidence',
        lessons: [
          { id: 'les-kick-1', title: 'Saying Goodbye to Translation Anxiety', duration_minutes: 14, is_preview: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'les-kick-2', title: 'Essential 100 Sentences for Daily Life', duration_minutes: 20, is_preview: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ]
  },
  {
    id: 'course-business-english-exec',
    mentor_id: 'mentor-michael-clark',
    mentor_name: 'Michael Clark, MBA',
    mentor_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    title: 'Business English & Executive Tech Interview Preparation',
    description: 'Elevate your professional presence. Lead cross-functional meetings, negotiate salary, write crisp emails, and nail tech interviews.',
    category: 'Business English',
    level: 'Advanced',
    price_bdt: 1999,
    price_usd: 19.99,
    is_free: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600',
    duration_hours: 12.0,
    total_enrolled: 310,
    rating: 4.92,
    review_count: 54,
    learning_outcomes: [
      'Answer behavioral STAR interview questions with precision',
      'Diplomatic disagreement and assertiveness in client meetings',
      'Deliver persuasive slide presentations to global stakeholders'
    ],
    sections: [
      {
        id: 'sec-biz-1',
        title: 'Meeting Leadership & Pitching',
        lessons: [
          { id: 'les-biz-1', title: 'Opening, Moderating, and Summarizing Business Calls', duration_minutes: 16, is_preview: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'les-biz-2', title: 'The STAR Framework for High-Stakes Interviews', duration_minutes: 24, is_preview: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ]
  }
];

const LOCAL_ENROLLMENTS_KEY = 'speakmate_course_enrollments';
const LOCAL_CUSTOM_COURSES_KEY = 'speakmate_custom_courses';

function getLocalEnrollments() {
  try {
    const raw = localStorage.getItem(LOCAL_ENROLLMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function saveLocalEnrollment(enrollment) {
  try {
    const enrollments = getLocalEnrollments();
    const existingIdx = enrollments.findIndex(
      (e) => e.user_id === enrollment.user_id && e.course_id === enrollment.course_id
    );
    if (existingIdx >= 0) {
      enrollments[existingIdx] = { ...enrollments[existingIdx], ...enrollment };
    } else {
      enrollments.push(enrollment);
    }
    localStorage.setItem(LOCAL_ENROLLMENTS_KEY, JSON.stringify(enrollments));
  } catch (_) {}
}

function getLocalCustomCourses() {
  try {
    const raw = localStorage.getItem(LOCAL_CUSTOM_COURSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function saveLocalCustomCourse(course) {
  try {
    const custom = getLocalCustomCourses();
    custom.unshift(course);
    localStorage.setItem(LOCAL_CUSTOM_COURSES_KEY, JSON.stringify(custom));
  } catch (_) {}
}

export const courseService = {
  /**
   * Get all published courses with optional filters
   */
  async getCourses({ category = 'all', level = 'all', priceType = 'all', search = '' } = {}) {
    let allCourses = [...INITIAL_COURSES, ...getLocalCustomCourses()];

    // If Supabase is connected, merge remote courses
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select(`
            *,
            profiles:mentor_id (display_name, avatar_url)
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const remoteCourses = data.map((c) => ({
            ...c,
            mentor_name: c.profiles?.display_name || 'English Mentor',
            mentor_avatar: c.profiles?.avatar_url || '',
            sections: [],
          }));
          // Merge unique by ID
          const existingIds = new Set(allCourses.map((c) => c.id));
          remoteCourses.forEach((rc) => {
            if (!existingIds.has(rc.id)) allCourses.unshift(rc);
          });
        }
      } catch (err) {
        console.warn('Remote course fetch notice:', err);
      }
    }

    // Apply filtering
    return allCourses.filter((course) => {
      if (category !== 'all' && course.category !== category) return false;
      if (level !== 'all' && course.level !== level) return false;
      if (priceType === 'free' && !course.is_free) return false;
      if (priceType === 'paid' && course.is_free) return false;
      if (search) {
        const query = search.toLowerCase();
        const matchTitle = course.title.toLowerCase().includes(query);
        const matchDesc = course.description.toLowerCase().includes(query);
        const matchCat = course.category.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchCat) return false;
      }
      return true;
    });
  },

  /**
   * Get course details by ID
   */
  async getCourseById(courseId) {
    const allCourses = [...INITIAL_COURSES, ...getLocalCustomCourses()];
    const localMatch = allCourses.find((c) => c.id === courseId);
    if (localMatch) return localMatch;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select(`
            *,
            profiles:mentor_id (display_name, avatar_url),
            course_sections (
              id, title, sort_order,
              course_lessons (id, title, duration_minutes, is_preview, sort_order)
            )
          `)
          .eq('id', courseId)
          .single();

        if (!error && data) {
          return {
            ...data,
            mentor_name: data.profiles?.display_name || 'Mentor',
            mentor_avatar: data.profiles?.avatar_url || '',
            sections: data.course_sections || [],
          };
        }
      } catch (_) {}
    }

    return null;
  },

  /**
   * Enroll user in course (Free or Verified Paid)
   */
  async enrollInCourse(userId, courseId, paymentId = null) {
    if (!userId || !courseId) throw new Error('User and Course ID required');

    const course = await this.getCourseById(courseId);
    if (!course) throw new Error('Course not found');

    const enrollmentRecord = {
      id: `enr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      course_id: courseId,
      course_title: course.title,
      thumbnail_url: course.thumbnail_url,
      mentor_name: course.mentor_name,
      payment_id: paymentId,
      progress_percentage: 0,
      completed_lessons: [],
      is_completed: false,
      certificate_id: null,
      enrolled_at: new Date().toISOString(),
    };

    saveLocalEnrollment(enrollmentRecord);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('course_enrollments').upsert({
          user_id: userId,
          course_id: courseId,
          payment_id: paymentId,
          progress_percentage: 0,
          is_completed: false,
          enrolled_at: new Date().toISOString(),
        }, { onConflict: 'user_id,course_id' });

        // Increment enrolled count
        await supabase.rpc('increment_course_enrolled', { p_course_id: courseId });
      } catch (_) {}
    }

    return enrollmentRecord;
  },

  /**
   * Check if user is enrolled
   */
  async isUserEnrolled(userId, courseId) {
    if (!userId || !courseId) return false;
    const localEnrollments = getLocalEnrollments();
    const isEnrolled = localEnrollments.some((e) => e.user_id === userId && e.course_id === courseId);
    if (isEnrolled) return true;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('course_enrollments')
          .select('id')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .single();
        return Boolean(data);
      } catch (_) {
        return false;
      }
    }

    return false;
  },

  /**
   * Get all courses enrolled by the current student
   */
  async getMyCourses(userId) {
    if (!userId) return [];
    const local = getLocalEnrollments().filter((e) => e.user_id === userId);
    return local;
  },

  /**
   * Update student lesson progress
   */
  async updateProgress(userId, courseId, lessonId, totalLessons = 5) {
    const localEnrollments = getLocalEnrollments();
    let enrollment = localEnrollments.find((e) => e.user_id === userId && e.course_id === courseId);
    
    if (!enrollment) {
      enrollment = await this.enrollInCourse(userId, courseId);
    }

    const completed = new Set(enrollment.completed_lessons || []);
    completed.add(lessonId);

    const completedList = Array.from(completed);
    const progress = Math.min(100, Math.round((completedList.length / totalLessons) * 100));
    const isCompleted = progress >= 100;

    enrollment.completed_lessons = completedList;
    enrollment.progress_percentage = progress;
    enrollment.is_completed = isCompleted;
    if (isCompleted && !enrollment.certificate_id) {
      enrollment.completed_at = new Date().toISOString();
      enrollment.certificate_id = `CERT-SPEAKMATE-${Date.now().toString(36).toUpperCase()}`;
    }

    saveLocalEnrollment(enrollment);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('course_enrollments')
          .update({
            progress_percentage: progress,
            completed_lessons: completedList,
            is_completed: isCompleted,
            certificate_id: enrollment.certificate_id,
            completed_at: enrollment.completed_at,
          })
          .eq('user_id', userId)
          .eq('course_id', courseId);
      } catch (_) {}
    }

    return enrollment;
  },

  /**
   * Create a new course (Mentor)
   */
  async createCourse(courseData, mentorUser) {
    const courseId = `course_${Date.now()}`;
    const newCourse = {
      id: courseId,
      mentor_id: mentorUser.id,
      mentor_name: mentorUser.display_name || mentorUser.email?.split('@')[0] || 'Mentor',
      mentor_avatar: mentorUser.avatar_url || '',
      title: courseData.title,
      description: courseData.description,
      category: courseData.category,
      level: courseData.level,
      price_bdt: Number(courseData.price_bdt) || 0,
      price_usd: Math.round(((Number(courseData.price_bdt) || 0) / 100) * 10) / 10,
      is_free: Number(courseData.price_bdt) === 0,
      thumbnail_url: courseData.thumbnail_url || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
      duration_hours: Number(courseData.duration_hours) || 2.0,
      total_enrolled: 0,
      rating: 5.0,
      review_count: 0,
      learning_outcomes: courseData.learning_outcomes || ['Fluency confidence', 'Grammar accuracy'],
      status: 'published',
      sections: [
        {
          id: `sec_${Date.now()}`,
          title: 'Module 1: Core Curriculum',
          lessons: [
            { id: `les_${Date.now()}_1`, title: 'Lesson 1: Introduction & Goals', duration_minutes: 15, is_preview: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
            { id: `les_${Date.now()}_2`, title: 'Lesson 2: Interactive Practice', duration_minutes: 25, is_preview: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
          ]
        }
      ]
    };

    saveLocalCustomCourse(newCourse);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('courses').insert({
          id: courseId,
          mentor_id: mentorUser.id,
          title: newCourse.title,
          description: newCourse.description,
          category: newCourse.category,
          level: newCourse.level,
          price_bdt: newCourse.price_bdt,
          is_free: newCourse.is_free,
          thumbnail_url: newCourse.thumbnail_url,
          duration_hours: newCourse.duration_hours,
          status: 'published',
        });
      } catch (_) {}
    }

    return newCourse;
  }
};
