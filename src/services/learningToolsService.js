/**
 * English Learning Tools & Gamification Service
 * Curated speaking topics, daily vocabulary, grammar rules, quizzes, and streaks.
 */

export const SPEAKING_TOPICS = [
  {
    id: 'topic-1',
    title: 'Artificial Intelligence & The Future of Work',
    category: 'Technology & Career',
    level: 'Intermediate - Advanced',
    prompt: 'How will AI tools change the skills young professionals need in the next 5 years? Will certain jobs disappear or transform?',
    questions: [
      'Do you use AI in your daily study or work? In what ways?',
      'What human skills (creativity, empathy, communication) can never be replaced by algorithms?',
      'If you could automate one mundane task in your life, what would it be and why?'
    ],
    vocabularyHelp: [
      { word: 'Automation', definition: 'The creation and application of technologies to produce and deliver goods with minimal human intervention' },
      { word: 'Adaptability', definition: 'The quality of being able to adjust to new conditions' },
      { word: 'Reskilling', definition: 'The process of learning new skills for a different job' }
    ]
  },
  {
    id: 'topic-2',
    title: 'Travel, Cultural Shocks & Global Traditions',
    category: 'Lifestyle & Culture',
    level: 'All Levels',
    prompt: 'Share an experience where you encountered a different culture or tradition. What surprised you the most?',
    questions: [
      'What is one cultural custom from your country that foreigners find fascinating?',
      'If you could travel anywhere tomorrow with all expenses paid, where would you go?',
      'How does traveling to a new city broaden your perspective on life?'
    ],
    vocabularyHelp: [
      { word: 'Culture shock', definition: 'The feeling of disorientation experienced by someone suddenly subjected to an unfamiliar culture' },
      { word: 'Hospitality', definition: 'The friendly and generous reception and entertainment of guests' },
      { word: 'Perspective', definition: 'A particular attitude toward or way of regarding something' }
    ]
  },
  {
    id: 'topic-3',
    title: 'Overcoming Speaking Anxiety & Imposter Syndrome',
    category: 'Personal Development',
    level: 'Beginner - Intermediate',
    prompt: 'Everyone feels nervous when speaking a second language in front of others. How do you handle fear of making grammatical errors?',
    questions: [
      'When was the last time you felt shy speaking English? What happened?',
      'Do you prefer someone correcting your mistake immediately, or after you finish your sentence?',
      'What advice would you give to a friend who wants to start speaking today?'
    ],
    vocabularyHelp: [
      { word: 'Vulnerability', definition: 'The quality or state of being exposed to the possibility of being attacked or harmed, either physically or emotionally' },
      { word: 'Fluency', definition: 'The ability to speak or write a foreign language easily and accurately' },
      { word: 'Resilience', definition: 'The capacity to recover quickly from difficulties; toughness' }
    ]
  }
];

export const DAILY_VOCABULARY = [
  {
    word: 'Articulate',
    phonetic: '/ɑːrˈtɪk.jə.lət/',
    partOfSpeech: 'adjective / verb',
    meaning: 'Able to express thoughts and ideas clearly and effectively in speech.',
    example: 'She gave an articulate defense of her project during the executive interview.',
    synonyms: ['eloquent', 'fluent', 'expressive'],
  },
  {
    word: 'Compelling',
    phonetic: '/kəmˈpel.ɪŋ/',
    partOfSpeech: 'adjective',
    meaning: 'Evoking interest, attention, or admiration in a powerfully irresistible way.',
    example: 'His cue card presentation had a compelling narrative that captured the examiner.',
    synonyms: ['captivating', 'persuasive', 'engrossing'],
  },
  {
    word: 'Spontaneous',
    phonetic: '/spɑːnˈteɪ.ni.əs/',
    partOfSpeech: 'adjective',
    meaning: 'Performed or occurring as a result of a sudden inner impulse, without premeditation.',
    example: 'Practicing on SpeakMate helped her give natural, spontaneous answers without pause.',
    synonyms: ['unrehearsed', 'impromptu', 'unplanned'],
  },
  {
    word: 'Nuance',
    phonetic: '/ˈnuː.ɑːns/',
    partOfSpeech: 'noun',
    meaning: 'A subtle difference in or shade of meaning, expression, or sound.',
    example: 'Understanding subtle cultural nuances makes business meetings far smoother.',
    synonyms: ['subtlety', 'shade', 'refinement'],
  }
];

export const COMMON_SENTENCES = [
  { situation: 'Polite Interruption', phrase: 'Could I jump in here for just a moment to clarify that point?' },
  { situation: 'Asking for Elaboration', phrase: 'That is intriguing—could you expand a bit more on what you mean by that?' },
  { situation: 'Diplomatic Disagreement', phrase: 'I see where you are coming from, though from my experience...' },
  { situation: 'Buying Thinking Time', phrase: 'That is a thought-provoking question. Let me reflect on that for a second.' },
  { situation: 'Summarizing Thoughts', phrase: 'To wrap up my key takeaway in a nutshell...' }
];

export const DAILY_QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'Which word best fits: "She delivered an ________ speech that inspired the entire team."',
    options: ['Articulate', 'Hesitant', 'Awkward', 'Tedious'],
    answerIndex: 0,
    explanation: '"Articulate" means expressing thoughts fluently and coherently.'
  },
  {
    id: 'q2',
    question: 'What is the most natural way to buy thinking time in an IELTS speaking interview?',
    options: [
      'Stay completely silent for 10 seconds',
      '"That is an interesting question, let me consider that for a moment..."',
      '"I do not know the answer, ask another question"',
      'Repeat the question 5 times'
    ],
    answerIndex: 1,
    explanation: 'Using filler phrases like "That is an interesting question..." demonstrates fluency and cohesion.'
  },
  {
    id: 'q3',
    question: 'Choose the correct preposition: "I am really looking forward ________ practicing English tonight."',
    options: ['for', 'to', 'at', 'with'],
    answerIndex: 1,
    explanation: 'The phrase is always "look forward to" followed by a gerund (-ing) or noun.'
  }
];

const LOCAL_PROGRESS_KEY = 'speakmate_learning_progress';

export const learningToolsService = {
  getSpeakingTopics() {
    return SPEAKING_TOPICS;
  },

  getDailyVocabulary() {
    return DAILY_VOCABULARY;
  },

  getCommonSentences() {
    return COMMON_SENTENCES;
  },

  getDailyQuiz() {
    return DAILY_QUIZ_QUESTIONS;
  },

  getProgress(userId) {
    try {
      const raw = localStorage.getItem(`${LOCAL_PROGRESS_KEY}_${userId}`);
      if (raw) return JSON.parse(raw);
    } catch (_) {}

    return {
      practiceMinutesTotal: 45,
      sessionsCount: 3,
      currentStreakDays: 4,
      xpPoints: 320,
      speakingLevel: 'Intermediate',
      badges: ['First Conversation', 'Fluency Explorer', '3-Day Streak'],
      quizzesPassed: 2,
    };
  },

  addQuizXP(userId, score) {
    const progress = this.getProgress(userId);
    progress.xpPoints = (progress.xpPoints || 0) + score * 50;
    progress.quizzesPassed = (progress.quizzesPassed || 0) + 1;
    if (progress.xpPoints > 500 && !progress.badges.includes('Quiz Champion')) {
      progress.badges.push('Quiz Champion');
    }
    try {
      localStorage.setItem(`${LOCAL_PROGRESS_KEY}_${userId}`, JSON.stringify(progress));
    } catch (_) {}
    return progress;
  }
};
