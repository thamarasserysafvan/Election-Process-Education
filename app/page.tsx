import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
          Understanding the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Election Process</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500">
          Your interactive guide to voter registration, polling logistics, and understanding the machinery of democracy in India.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <div className="md:col-span-12 lg:col-span-8 lg:col-start-3">
          <ChatInterface />
        </div>
      </div>
      
      <div className="mt-16 text-center text-sm text-gray-400">
        <p>This is an educational assistant built for the PromptWars Virtual Challenge.</p>
        <p>Always refer to the official <a href="https://eci.gov.in" className="text-blue-500 hover:underline">Election Commission of India</a> for definitive legal rulings.</p>
      </div>
    </div>
  );
}
