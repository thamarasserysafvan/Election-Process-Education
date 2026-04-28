"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { CheckCircle2, XCircle, ChevronRight, RefreshCw, Trophy } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Question {
  id: number;
  text: string;
  difficulty: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctOption: number;
  rationale: string;
}

interface WindowDimension {
  width: number;
  height: number;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function QuizCard({ questions }: { questions: Question[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [windowDimension, setWindowDimension] = useState<WindowDimension>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () =>
      setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOptionClick = useCallback(
    (optionIndex: number) => {
      if (isAnswered) return;
      setSelectedOption(optionIndex);
      setIsAnswered(true);

      const isCorrect = optionIndex === questions[currentIndex].correctOption;
      if (isCorrect) {
        setScore((prev) => prev + 1);
        setStreak((prev) => prev + 1);
      } else {
        setStreak(0);
      }
    },
    [isAnswered, currentIndex, questions]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      if (score + (selectedOption === questions[currentIndex].correctOption ? 1 : 0) === questions.length) {
        setShowConfetti(true);
      }
    }
  }, [currentIndex, questions, score, selectedOption]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setIsFinished(false);
    setShowConfetti(false);
  }, []);

  // ---- Finished screen ----
  if (isFinished) {
    return (
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        aria-label="Quiz results"
        className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8 text-center"
      >
        {showConfetti && (
          <Confetti
            width={windowDimension.width}
            height={windowDimension.height}
            recycle={false}
            numberOfPieces={500}
          />
        )}

        <div className="flex justify-center mb-6" aria-hidden="true">
          <div className="bg-blue-100 p-4 rounded-full">
            <Trophy className="text-blue-600" size={48} />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
        <p className="text-xl text-gray-600 mb-8">
          You scored{' '}
          <span className="font-bold text-blue-600" aria-label={`${score} out of ${questions.length}`}>
            {score}
          </span>{' '}
          out of {questions.length}
        </p>

        <button
          onClick={handleRestart}
          className="flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <RefreshCw size={20} aria-hidden="true" />
          Try Again
        </button>
      </motion.section>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex / questions.length) * 100;

  return (
    <section
      aria-label={`Quiz: question ${currentIndex + 1} of ${questions.length}`}
      className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden"
    >
      {/* Progress Bar */}
      <div
        className="h-2 w-full bg-gray-100"
        role="progressbar"
        aria-valuenow={currentIndex}
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-label={`Question ${currentIndex + 1} of ${questions.length}`}
      >
        <motion.div
          className="h-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="p-6 sm:p-8">
        {/* Header row */}
        <div className="flex justify-between items-center mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
            Question {currentIndex + 1} of {questions.length}
          </span>
          {streak >= 2 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              role="status"
              aria-live="polite"
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700"
            >
              🔥 {streak} Streak!
            </motion.span>
          )}
        </div>

        {/* Question */}
        <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
          {currentQuestion.text}
        </h2>

        {/* Options */}
        <fieldset className="space-y-3 mb-8" aria-label="Answer options">
          <legend className="sr-only">Choose an answer for: {currentQuestion.text}</legend>
          {([1, 2, 3, 4] as const).map((index) => {
            const optionText = currentQuestion[`option${index}` as keyof Question] as string;
            const isSelected = selectedOption === index;
            const isCorrect = isAnswered && index === currentQuestion.correctOption;
            const isWrong = isAnswered && isSelected && !isCorrect;

            let buttonClass =
              'w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ';

            if (!isAnswered) {
              buttonClass += 'border-gray-200 hover:border-blue-400 hover:bg-blue-50';
            } else if (isCorrect) {
              buttonClass += 'border-green-500 bg-green-50';
            } else if (isWrong) {
              buttonClass += 'border-red-500 bg-red-50';
            } else {
              buttonClass += 'border-gray-200 opacity-50';
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={isAnswered}
                aria-pressed={isSelected}
                aria-label={`Option ${OPTION_LABELS[index - 1]}: ${optionText}${isCorrect ? ' — Correct' : ''}${isWrong ? ' — Incorrect' : ''}`}
                className={buttonClass}
              >
                <span className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-sm font-bold flex-shrink-0" aria-hidden="true">
                    {OPTION_LABELS[index - 1]}
                  </span>
                  <span className="font-medium text-base text-black">{optionText}</span>
                </span>
                {isCorrect && <CheckCircle2 className="text-green-500 flex-shrink-0" size={24} aria-hidden="true" />}
                {isWrong && <XCircle className="text-red-500 flex-shrink-0" size={24} aria-hidden="true" />}
              </button>
            );
          })}
        </fieldset>

        {/* Explanation & next */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-100">
                <h3 className="font-semibold text-black mb-2">Explanation</h3>
                <p className="text-black">{currentQuestion.rationale}</p>
              </div>

              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-medium transition-colors text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
