"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { CheckCircle2, XCircle, ChevronRight, RefreshCw, Trophy } from 'lucide-react';

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

export default function QuizCard({ questions }: { questions: Question[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [windowDimension, setWindowDimension] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const handleOptionClick = (optionIndex: number) => {
    if (isAnswered) return;
    
    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === currentQuestion.correctOption;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      if (score === questions.length) {
        setShowConfetti(true);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setIsFinished(false);
    setShowConfetti(false);
  };

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8 text-center"
      >
        {showConfetti && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={500} />}
        
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Trophy className="text-blue-600" size={48} />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
        <p className="text-xl text-gray-600 mb-8">
          You scored <span className="font-bold text-blue-600">{score}</span> out of {questions.length}
        </p>

        <button 
          onClick={handleRestart}
          className="flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          <RefreshCw size={20} />
          Try Again
        </button>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
      {/* Progress Bar */}
      <div className="h-2 w-full bg-gray-100">
        <motion.div 
          className="h-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
            Question {currentIndex + 1} of {questions.length}
          </span>
          {streak >= 2 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700"
            >
              🔥 {streak} Streak!
            </motion.span>
          )}
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
          {currentQuestion.text}
        </h3>

        <div className="space-y-3 mb-8">
          {[1, 2, 3, 4].map((index) => {
            const optionText = currentQuestion[`option${index}` as keyof Question];
            const isSelected = selectedOption === index;
            const isCorrect = isAnswered && index === currentQuestion.correctOption;
            const isWrong = isAnswered && isSelected && !isCorrect;

            let buttonClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ";
            
            if (!isAnswered) {
              buttonClass += "border-gray-200 hover:border-blue-400 hover:bg-blue-50";
            } else if (isCorrect) {
              buttonClass += "border-green-500 bg-green-50 text-green-800";
            } else if (isWrong) {
              buttonClass += "border-red-500 bg-red-50 text-red-800";
            } else {
              buttonClass += "border-gray-200 opacity-50";
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={isAnswered}
                className={buttonClass}
              >
                <span className="font-medium text-lg">{optionText}</span>
                {isCorrect && <CheckCircle2 className="text-green-500" size={24} />}
                {isWrong && <XCircle className="text-red-500" size={24} />}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-2">Explanation</h4>
                <p className="text-gray-700">{currentQuestion.rationale}</p>
              </div>
              
              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-medium transition-colors text-lg"
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
