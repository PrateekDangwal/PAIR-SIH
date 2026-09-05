'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Shield, Lock, Key, Eye } from 'lucide-react';

const SECURITY_FEATURES = [
  {
    icon: Lock,
    title: 'Encrypted Credentials',
    description:
      'Your API keys are encrypted and never exposed to the frontend.',
  },
  {
    icon: Key,
    title: 'Provider Control',
    description:
      'You control which AI providers have access to your projects.',
  },
  {
    icon: Eye,
    title: 'Isolated Execution',
    description:
      'Each project runs in an isolated sandbox environment with full audit logs.',
  },
  {
    icon: Shield,
    title: 'Secure Artifacts',
    description:
      'Generated artifacts are stored securely and encrypted at rest.',
  },
];

export function Security() {
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
          Your Models. Your Control.
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Security and privacy are built into PAIR's architecture.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {SECURITY_FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 border border-white/10 bg-white/5 h-full">
                <div className="flex items-start gap-4">
                  <Icon className="text-green-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {feature.description}
                    </p>
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
