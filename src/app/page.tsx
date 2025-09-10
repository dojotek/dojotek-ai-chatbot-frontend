import Link from 'next/link';

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <p className="text-center">Dojotek AI Chatbot is a software system to help enterprise/company/corporate to build, configure, run, monitor multiple Chatbot AI LLM RAG.</p>
        <Link 
          href="/sign-in"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg border-2 border-blue-600 hover:border-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Try Now
        </Link>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p>Dojotek AI Chatbot source code is available on GitHub.</p>
      </footer>
    </div>
  );
}
