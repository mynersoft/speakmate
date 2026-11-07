import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  HelpCircle, 
  MessageSquare, 
  Award,
  Zap,
  ArrowRight
} from 'lucide-react';
import { 
  learningToolsService, 
  SPEAKING_TOPICS, 
  DAILY_VOCABULARY, 
  COMMON_SENTENCES, 
  DAILY_QUIZ_QUESTIONS 
} from '../services/learningToolsService';
import { useAuth } from '../context/AuthContext';

export default function LearningTools() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('topics'); // 'topics' | 'vocab' | 'sentences' | 'quiz'
  const [selectedTopic, setSelectedTopic] = useState(SPEAKING_TOPICS[0]);
  
  // Quiz State
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);

  const handleSelectAnswer = (questionId, optionIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleFinishQuiz = () => {
    let score = 0;
    DAILY_QUIZ_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.answerIndex) {
        score++;
      }
    });
    setQuizScore(score);
    if (user) {
      learningToolsService.addQuizXP(user.id, score);
    }
  };

  const handlePronounce = (word) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Daily Speaking Vault
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          English Learning & Practice Tools
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          Prepare for your conversation calls with today's speaking prompts, power vocabulary, and pronunciation guides.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {[
          { id: 'topics', label: 'Daily Speaking Topics', icon: MessageSquare },
          { id: 'vocab', label: 'Vocabulary Bank', icon: BookOpen },
          { id: 'sentences', label: 'Power Phrases & Idioms', icon: Sparkles },
          { id: 'quiz', label: 'Daily Fluency Quiz', icon: HelpCircle },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`pb-3 px-3 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
                activeTab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DAILY SPEAKING TOPICS */}
      {activeTab === 'topics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Select Conversation Topic</h3>
            <div className="space-y-2">
              {SPEAKING_TOPICS.map((top) => (
                <button
                  key={top.id}
                  onClick={() => setSelectedTopic(top)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all ${
                    selectedTopic.id === top.id
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
                    {top.category}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 leading-snug">{top.title}</h4>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                {selectedTopic.category} • {selectedTopic.level}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3">
                {selectedTopic.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed italic">
                "{selectedTopic.prompt}"
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Discussion Questions for Your Next Practice Call:
              </h4>
              <div className="space-y-2">
                {selectedTopic.questions.map((q, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium">
                    {idx + 1}. {q}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Key Vocabulary to Use:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedTopic.vocabularyHelp.map((v, idx) => (
                  <div key={idx} className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
                    <span className="font-bold text-xs text-blue-900">{v.word}</span>
                    <p className="text-[11px] text-slate-600 leading-snug">{v.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VOCABULARY BANK */}
      {activeTab === 'vocab' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DAILY_VOCABULARY.map((voc, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{voc.word}</h3>
                  <span className="font-mono text-xs text-blue-600 font-medium">{voc.phonetic}</span>
                </div>
                <button
                  onClick={() => handlePronounce(voc.word)}
                  className="p-2.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  title="Listen to native pronunciation"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {voc.meaning}
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs italic text-slate-600">
                "{voc.example}"
              </div>

              <div className="pt-2 flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-slate-400">Synonyms:</span>
                {voc.synonyms.map((syn, sIdx) => (
                  <span key={sIdx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold">
                    {syn}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: POWER PHRASES */}
      {activeTab === 'sentences' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COMMON_SENTENCES.map((s, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {s.situation}
                </span>
                <p className="text-sm font-bold text-slate-900">
                  "{s.phrase}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DAILY QUIZ */}
      {activeTab === 'quiz' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Today's Fluency Challenge</h3>
              <p className="text-xs text-slate-500">Test your vocabulary and preposition mastery.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
              <Zap className="w-4 h-4 fill-amber-400" />
              <span>+150 XP</span>
            </div>
          </div>

          <div className="space-y-6">
            {DAILY_QUIZ_QUESTIONS.map((q, idx) => (
              <div key={q.id} className="space-y-3">
                <h4 className="font-bold text-xs text-slate-900">
                  Question {idx + 1}: {q.question}
                </h4>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectAnswer(q.id, optIdx)}
                      className={`w-full p-3 rounded-xl text-left text-xs font-medium border transition-all ${
                        selectedAnswers[q.id] === optIdx
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {quizScore !== null && (
                  <div className={`p-3 rounded-xl text-xs ${
                    selectedAnswers[q.id] === q.answerIndex
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {selectedAnswers[q.id] === q.answerIndex ? '✓ Correct! ' : '✗ Incorrect. '}
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {quizScore === null ? (
            <button
              onClick={handleFinishQuiz}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Submit Quiz Answers
            </button>
          ) : (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center space-y-2">
              <h4 className="font-bold text-sm text-blue-900">
                You scored {quizScore} / {DAILY_QUIZ_QUESTIONS.length}!
              </h4>
              <p className="text-xs text-blue-700">
                +{quizScore * 50} Fluency XP added to your learning streak.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
