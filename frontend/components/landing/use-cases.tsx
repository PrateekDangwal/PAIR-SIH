'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  Code2,
  BarChart3,
  FileText,
  Zap,
  Database,
  Workflow,
} from 'lucide-react';

const USE_CASES = [
  {
    icon: Code2,
    title: 'Software Development',
    description: 'Build full-stack applications with coordinated AI agents',
  },
  {
    icon: BarChart3,
    title: 'Data Analysis',
    description: 'Process and analyze complex datasets with reasoning models',
  },
  {
    icon: FileText,
    title: 'Content Creation',
    description:
      'Generate comprehensive reports, documentation, and articles',
  },
  {
    icon: Zap,
    title: 'Research & Learning',
    description: 'Orchestrate research tasks across multiple knowledge sources',
  },
  {
    icon: Database,
    title: 'Data Pipeline',
    description: 'Create and deploy ETL workflows automatically',
  },
  {
    icon: Workflow,
    title: 'Business Automation',
    description: 'Automate complex business processes and workflows',
  },
];

export function UseCases() {
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
          Use Cases
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          PAIR adapts to any complex task that requires coordinated AI effort.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {USE_CASES.map((useCase, idx) => {
          const Icon = useCase.icon;
          return (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors h-full">
                <Icon className="text-purple-400 w-8 h-8 mb-4" />
                <h3 className="font-bold text-white mb-2">{useCase.title}</h3>
                <p className="text-sm text-gray-400">{useCase.description}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
