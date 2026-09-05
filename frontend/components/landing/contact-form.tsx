'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send } from 'lucide-react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.subject && formData.message) {
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Name</label>
            <Input
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-white/5 border-white/10 text-white placeholder-gray-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Email</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="bg-white/5 border-white/10 text-white placeholder-gray-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Subject</label>
          <Input
            type="text"
            placeholder="Subject"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            className="bg-white/5 border-white/10 text-white placeholder-gray-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Message</label>
          <textarea
            placeholder="Your message..."
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
        >
          <span>Send Message</span>
          <Send size={18} className="ml-2" />
        </Button>

        {submitted && (
          <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-200 text-sm text-center">
            Message sent successfully!
          </div>
        )}
      </form>
    </Card>
  );
}
