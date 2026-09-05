'use client';

import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Paperclip,
  Send,
  ShieldCheck,
  User,
  X,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  fileName?: string;
};

type ChatResponse = {
  message: string;
  model_used: string;
  provider: string;
};

function MessageContent({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);

  return (
    <div className="space-y-2.5 text-[14px] leading-6">
      {lines.map((line, index) => {
        const clean = line.replace(/\*\*/g, '').trimEnd();

        if (!clean.trim()) {
          return <div key={index} className="h-1" />;
        }

        if (/^#{1,3}\s/.test(clean)) {
          return (
            <p
              key={index}
              className="pt-2 font-semibold text-white"
            >
              {clean.replace(/^#{1,3}\s/, '')}
            </p>
          );
        }

        if (/^[-•]\s/.test(clean)) {
          return (
            <p
              key={index}
              className="pl-4 text-gray-300 before:mr-2 before:text-violet-300 before:content-['•']"
            >
              {clean.replace(/^[-•]\s/, '')}
            </p>
          );
        }

        if (/^\d+[.)]\s/.test(clean)) {
          return (
            <p key={index} className="pl-1 text-gray-300">
              {clean}
            </p>
          );
        }

        return (
          <p key={index} className="text-gray-300">
            {clean}
          </p>
        );
      })}
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello. I can help you review GeM tender requirements, bidder evidence, compliance findings and procurement risk.\n\nUpload a PDF or ask a question to begin.',
    },
  ]);

  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();

    const message =
      input.trim() ||
      (file
        ? 'Analyze the uploaded procurement document and summarize the important compliance points.'
        : '');

    if (!message || loading) {
      return;
    }

    const selectedFile = file;

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: message,
        fileName: selectedFile?.name,
      },
    ]);

    setInput('');
    setFile(null);

    if (fileRef.current) {
      fileRef.current.value = '';
    }

    setLoading(true);

    try {
      let response: ChatResponse;

      if (selectedFile) {
        const body = new FormData();

        body.append('file', selectedFile);
        body.append('message', message);

        response = await apiFetch<ChatResponse>(
          '/api/v1/ai/chat-with-pdf',
          {
            method: 'POST',
            body,
          }
        );
      } else {
        response = await apiFetch<ChatResponse>(
          '/api/v1/ai/chat',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message,
            }),
          }
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.message,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            error instanceof Error
              ? error.message
              : 'PAIR could not complete the request.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] || null;

    if (!next) {
      return;
    }

    if (
      next.type !== 'application/pdf' &&
      !next.name.toLowerCase().endsWith('.pdf')
    ) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Please upload a PDF document.',
        },
      ]);

      event.target.value = '';
      return;
    }

    setFile(next);
  }

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mx-auto flex min-h-screen max-w-[1150px] flex-col px-4 md:px-8">

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto pb-4 pt-10 md:pt-14">
          <div className="mx-auto max-w-3xl space-y-9">

            {/* Empty / welcome state */}
            {messages.length === 1 && messages[0].role === 'assistant' && (
              <div className="mb-10">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035]">
                    <Sparkles
                      size={16}
                      className="text-violet-300"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
                      PAIR
                    </p>

                    <p className="text-xs text-gray-500">
                      Procurement intelligence assistant
                    </p>
                  </div>
                </div>

                <h1 className="mb-3 text-2xl font-medium tracking-tight text-white md:text-3xl">
                  How can I help?
                </h1>

                <p className="max-w-xl text-sm leading-6 text-gray-500">
                  Ask about GeM tender requirements, bidder evidence,
                  compliance findings, or procurement risk.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`group flex gap-4 ${
                  message.role === 'user'
                    ? 'justify-end'
                    : ''
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035]">
                    <Sparkles
                      size={14}
                      className="text-violet-300"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[85%] ${
                    message.role === 'user'
                      ? 'text-right'
                      : ''
                  }`}
                >
                  <div
                    className={`mb-1.5 text-[9px] uppercase tracking-[0.15em] ${
                      message.role === 'user'
                        ? 'text-gray-700'
                        : 'text-gray-600'
                    }`}
                  >
                    {message.role === 'user'
                      ? 'You'
                      : 'PAIR'}
                  </div>

                  {message.fileName && (
                    <div className="mb-2 inline-flex max-w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-left text-xs text-gray-400">
                      <FileText
                        size={13}
                        className="text-violet-300"
                      />

                      <span className="truncate">
                        {message.fileName}
                      </span>
                    </div>
                  )}

                  {message.role === 'assistant' ? (
                    <MessageContent
                      content={message.content}
                    />
                  ) : (
                    <p className="inline-block rounded-2xl bg-white/[0.065] px-4 py-2.5 text-left text-sm leading-6 text-gray-200">
                      {message.content}
                    </p>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="mt-0.5 hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] sm:flex">
                    <User
                      size={13}
                      className="text-gray-500"
                    />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 pl-11 text-xs text-gray-600">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-500" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-600 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-700 [animation-delay:240ms]" />
                </span>

                Reviewing the request…
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="sticky bottom-0 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d] to-transparent pb-5 pt-4">
          <div className="mx-auto max-w-3xl">

            {file && (
              <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#141416] px-3 py-2 text-xs text-gray-400">
                <FileText
                  size={13}
                  className="text-violet-300"
                />

                <span className="max-w-xs truncate">
                  {file.name}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setFile(null);

                    if (fileRef.current) {
                      fileRef.current.value = '';
                    }
                  }}
                  aria-label="Remove PDF"
                >
                  <X
                    size={13}
                    className="text-gray-600 hover:text-white"
                  />
                </button>
              </div>
            )}

            <form
              onSubmit={sendMessage}
              className="rounded-2xl border border-white/[0.1] bg-[#141416] shadow-2xl shadow-black/30"
            >
              <textarea
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Ask about a tender, requirement, evidence or risk…"
                rows={2}
                className="max-h-40 min-h-14 w-full resize-none bg-transparent px-4 pt-4 text-sm text-white outline-none placeholder:text-gray-700"
                aria-label="Message PAIR"
              />

              <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex items-center gap-1">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={chooseFile}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      fileRef.current?.click()
                    }
                    disabled={loading}
                    className="rounded-lg p-2.5 text-gray-600 hover:bg-white/[0.05] hover:text-gray-300"
                    aria-label="Attach PDF"
                  >
                    <Paperclip size={17} />
                  </button>

                  <span className="hidden items-center gap-1 text-[10px] text-gray-700 sm:flex">
                    <ShieldCheck size={12} />
                    Evidence-aware assistance
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    (!input.trim() && !file)
                  }
                  className="rounded-xl bg-white p-2.5 text-black transition hover:bg-gray-200 disabled:opacity-25"
                  aria-label="Send"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>

            <p className="mt-2 text-center text-[10px] text-gray-700">
              PAIR provides AI-assisted analysis. Verify critical
              conclusions against the underlying evidence.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}