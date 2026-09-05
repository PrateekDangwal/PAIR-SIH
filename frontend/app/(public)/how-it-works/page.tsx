export const metadata = {
  title: 'How PAIR Works',
  description: 'Understand PAIR orchestration process',
};

export default function HowItWorksPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-5xl font-bold text-white mb-12">How PAIR Works</h1>
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Understanding Goals</h2>
          <p className="text-gray-400">
            PAIR analyzes user goals and breaks them into actionable tasks.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Planning Tasks</h2>
          <p className="text-gray-400">
            Tasks are organized with dependencies and assigned to appropriate models.
          </p>
        </div>
      </div>
    </div>
  );
}
