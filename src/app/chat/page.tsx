"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "m1",
      role: "assistant",
      content: "Welcome to brain.open(). What would you like to learn today?",
    },
    {
      id: "m2",
      role: "user",
      content: "Help me grok calculus intuitively.",
    },
    {
      id: "m3",
      role: "assistant",
      content:
        "Beautiful. Let's start with change—rates and accumulation. When you think of a curve, what might its slope tell you about motion?",
    },
  ]);
  const [input, setInput] = useState("");
  const viewportRef = useRef<HTMLDivElement | null>(null);

  function onSend() {
    if (!input.trim()) return;
    const next: Msg = {
      id: Math.random().toString(36).slice(2),
      role: "user",
      content: input.trim(),
    };
    setMessages((m) => [...m, next]);
    setInput("");
    // Placeholder: in real app, call your API and stream the assistant reply.
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: Math.random().toString(36).slice(2),
          role: "assistant",
          content: "Noted. I'll ask guiding questions to build intuition step by step.",
        },
      ]);
      viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: "smooth" });
    }, 400);
  }

  return (
    <div className="relative flex h-svh flex-col">
      {/* Background wash */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(120,120,255,0.05),transparent_50%)]" />

      {/* Top bar */}
      <header className="flex items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-zinc-200/70 dark:border-zinc-800/70">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-foreground transition-colors">
            brain.open()
          </Link>
          <span className="hidden md:inline text-zinc-400">/</span>
          <span className="hidden md:inline text-xs text-zinc-500">Chat</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">New chat</Button>
          <Button variant="ghost" size="sm" className="text-zinc-500">Settings</Button>
        </div>
      </header>

      {/* Chat area */}
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 md:px-6">
        <ScrollArea className="h-[calc(100svh-8rem)]">
          <div ref={viewportRef} className="min-h-[calc(100svh-8rem)] w-full py-8 flex flex-col gap-6">
            {messages.map((m) => (
              <ChatMessage key={m.id} role={m.role} content={m.content} />
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Composer */}
      <div className="mx-auto w-full max-w-3xl px-4 md:px-6 py-4">
        <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything. Press Enter to send, Shift+Enter for new line."
            className="resize-none h-24 border-0 focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <div className="flex justify-between items-center px-2 pb-1">
            <p className="text-[11px] text-zinc-500">AI may make mistakes. Verify critical information.</p>
            <Button onClick={onSend} size="sm">Send ↩</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>      
      {!isUser && <Avatar alt="AI" fallback="AI" className="mt-1" />}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
            : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
        )}
      >
        {content}
      </div>
      {isUser && <Avatar alt="You" fallback="You" className="mt-1" />}
    </div>
  );
}

