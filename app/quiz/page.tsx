import { prisma } from '@/lib/prisma';
import QuizCard from '@/components/QuizCard';

export const revalidate = 0; // Disable caching for the quiz

export default async function QuizPage() {
  const questions = await prisma.question.findMany();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
          Civic Knowledge <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Quiz</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500">
          Test your understanding of the Indian electoral process, from registration to polling day logistics.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {questions.length > 0 ? (
          <QuizCard questions={questions} />
        ) : (
          <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500">No questions available. Please seed the database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
