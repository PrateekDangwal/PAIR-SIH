import { ContactForm } from '@/components/landing/contact-form';

export const metadata = {
  title: 'Contact PAIR',
  description: 'Get in touch with the PAIR team',
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
      <p className="text-gray-400 mb-12">
        Have questions? We'd love to hear from you. Send us a message and we'll
        respond as soon as possible.
      </p>
      <ContactForm />
    </div>
  );
}
