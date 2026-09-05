'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

const TASKS = [
  { category: 'Research', model: 'Gemini', color: 'from-blue-500 to-cyan-500' },
  {
    category: 'Architecture',
    model: 'Claude',
    color: 'from-red-500 to-orange-500',
  },
  { category: 'Coding', model: 'Codex', color: 'from-green-500 to-emerald-500' },
  {
    category: 'Reasoning',
    model: 'DeepSeek',
    color: 'from-purple-500 to-pink-500',
  },
  { category: 'Review', model: 'GPT', color: 'from-yellow-500 to-orange-500' },
];

export function Orchestration() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white">
          Intelligent Model Routing
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          PAIR automatically selects the best AI model for each task component.
        </p>
      </motion.div>

      <motion.div
        className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-lg p-8 space-y-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="text-center space-y-4">
          <div className="inline-block px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-sm text-purple-300">
            User Goal
          </div>
          <h3 className="text-2xl font-bold text-white">
            Build an expense management SaaS
          </h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {TASKS.map((task, idx) => (
            <motion.div
              key={task.category}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-4 border-white/10 bg-white/5 text-center h-full flex flex-col items-center justify-center">
                <div
                  className={`inline-block px-3 py-1 rounded-full mb-3 text-white text-sm font-semibold bg-gradient-to-r ${task.color}`}
                >
                  {task.model}
                </div>
                <p className="text-white font-medium text-sm">{task.category}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="text-gray-400">↓</div>
          <div className="inline-block px-6 py-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-sm">
            Complete SaaS Application Ready for Deployment
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
