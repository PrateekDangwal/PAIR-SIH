'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  Brain,
  GitBranch,
  Zap,
  CheckCircle,
  Shield,
  Package,
} from 'lucide-react';

const STEPS = [
  {
    icon: Brain,
    number: '01',
    title: 'Understand',
    description: 'PAIR analyzes your goal and understands the requirements.',
  },
  {
    icon: GitBranch,
    number: '02',
    title: 'Plan',
    description: 'Breaking down into actionable tasks with dependencies.',
  },
  {
    icon: Zap,
    number: '03',
    title: 'Delegate',
    description: 'Selecting the appropriate connected AI model for each task.',
  },
  {
    icon: CheckCircle,
    number: '04',
    title: 'Execute',
    description: 'Different AI agents work in parallel on different tasks.',
  },
  {
    icon: Shield,
    number: '05',
    title: 'Verify',
    description: 'Testing and reviewing output quality automatically.',
  },
  {
    icon: Package,
    number: '06',
    title: 'Deliver',
    description: 'Packaging the completed project with documentation.',
  },
];

export function HowItWorks() {
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
          How PAIR Works
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          A sophisticated orchestration process designed to handle complex
          projects end-to-end.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors h-full">
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="text-3xl font-bold text-purple-400/30">
                      {step.number}
                    </div>
                    <Icon className="absolute top-1 left-2 text-purple-400 w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
