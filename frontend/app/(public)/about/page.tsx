export const metadata = {
  title: 'About PAIR',
  description: 'Learn about PAIR and our mission',
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
      <h1 className="text-5xl font-bold text-white">About PAIR</h1>
      <p className="text-xl text-gray-400 max-w-3xl">
        PAIR was created around a simple idea: users should not have to manually
        decide which AI should perform every part of a complex task.
      </p>
      <p className="text-lg text-gray-400 max-w-3xl">
        PAIR acts as the orchestration layer between the user and their AI tools,
        automating the decision-making process and coordinating multiple models
        to deliver exceptional results.
      </p>
    </div>
  );
}
