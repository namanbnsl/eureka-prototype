"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, MessageAvatar, MessageContent } from "@/components/message";
import {
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/prompt-input";
import { useChat } from "@ai-sdk/react";
import { Response } from "@/components/response";
import { Conversation, ConversationContent } from "@/components/conversation";
import { GlobeIcon, MicIcon } from "lucide-react";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [input, setInput] = useState("");
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage(
      { text: input },
      {
        body: {
          model: "gemini-2.5-flash",
        },
      }
    );
    setInput("");
  };

  const { messages, status, sendMessage } = useChat();

  return (
    <div className="relative flex flex-col h-svh">
      {/* Background wash */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(120,120,255,0.05),transparent_50%)]" />
      {/* Top bar */}
      <header className="flex items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-zinc-200/70 dark:border-zinc-800/70">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="font-mono text-xs text-zinc-500 hover:text-foreground transition-colors"
          >
            brain.open()
          </Link>
          <span className="hidden md:inline text-zinc-400">/</span>
          <span className="hidden md:inline text-xs text-zinc-500">Chat</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            New chat
          </Button>
          <Button variant="ghost" size="sm" className="text-zinc-500">
            Settings
          </Button>
        </div>
      </header>
      {/* Chat area */}
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 md:px-6 flex flex-col">
        <Conversation>
          <ConversationContent>
            {messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <Response key={`${message.id}-${i}`}>
                            {part.text}
                          </Response>
                        );
                      default:
                        return null;
                    }
                  })}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
        </Conversation>

        <Separator />

        {/* Composer */}
        <div className="w-full py-4">
          <PromptInput onSubmit={handleSubmit} className="mt-4">
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputButton>
                  <MicIcon size={16} />
                </PromptInputButton>
                <PromptInputButton>
                  <GlobeIcon size={16} />
                  <span>Search</span>
                </PromptInputButton>
              </PromptInputTools>
              <PromptInputSubmit disabled={!input} status={status} />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
