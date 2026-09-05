'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { CheckCircle, Circle, Zap } from 'lucide-react';

const EXECUTION_TASKS = [
  { id: 1, name: 'Understanding request', status: 'completed' },
  { id: 2, name: 'Creating architecture', status: 'completed' },
  { id: 3, name: 'Researching requirements', status: 'completed' },
  { id: 4, name: 'Building backend', status: 'running', agent: 'Claude' },
  { id: 5, name: 'Building frontend', status: 'running', agent: 'GPT' },
  { id: 6, name: 'Database integration', status: 'waiting' },
  { id: 7, name: 'Testing', status: 'waiting' },
  { id: 8, name: 'Security review', status: 'waiting' },
];

export function ExampleExecution() {
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
          Live Execution
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Watch as PAIR coordinates multiple AI models working in parallel.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-6 border border-white/10 bg-white/5">
            <h3 className="font-bold text-white mb-6">Project Execution</h3>
            <div className="space-y-4">
              {EXECUTION_TASKS.map((task) => (
                <motion.div
                  key={task.id}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: task.id * 0.05 }}
                  viewport={{ once: true }}
                >
                  {task.status === 'completed' && (
                    <CheckCircle
                      size={20}
                      className="text-green-500 flex-shrink-0"
                    />
                  )}
                  {task.status === 'running' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Zap size={20} className="text-blue-400 flex-shrink-0" />
                    </motion.div>
                  )}
                  {task.status === 'waiting' && (
                    <Circle size={20} className="text-gray-500 flex-shrink-0" />
                  )}

                  <div className="flex-1">
                    <p className="text-white text-sm">{task.name}</p>
                    {task.agent && (
                      <p className="text-xs text-gray-400">{task.agent}</p>
                    )}
                  </div>

                  <div className="text-xs font-mono text-gray-500">
                    {task.status}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6 border border-white/10 bg-white/5 h-full">
            <h3 className="font-bold text-white mb-6">Model Activity</h3>
            <div className="space-y-4">
              {[
                { name: 'Claude', usage: 75 },
                { name: 'GPT', usage: 65 },
                { name: 'Gemini', usage: 35 },
                { name: 'DeepSeek', usage: 20 },
              ].map((model) => (
                <div key={model.name} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white font-medium">{model.name}</span>
                    <span className="text-gray-400">{model.usage}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${model.usage}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      viewport={{ once: true }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
