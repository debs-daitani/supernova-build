"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Mode = "body" | "brain" | "business";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const LOADING_MESSAGES = [
  "Channeling the chaos...",
  "Engaging Daitani-drive...",
  "Summoning rock star energy...",
  "Brewing genius insights...",
  "Activating SUPERNova mode...",
];

export default function SuperNovaPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("body");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Rotate loading messages
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessage(
          LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
        );
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setLoadingMessage(LOADING_MESSAGES[0]);

    try {
      const res = await fetch("/api/supernova", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          mode,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantMessage += parsed.content;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    if (
                      newMessages[newMessages.length - 1]?.role === "assistant"
                    ) {
                      newMessages[newMessages.length - 1].content =
                        assistantMessage;
                    } else {
                      newMessages.push({
                        role: "assistant",
                        content: assistantMessage,
                      });
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-2">
            SUPERNova AI
          </h1>
          <p className="text-pink-100">Your rockstar AI companion</p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-4 mb-6 justify-center">
          <button
            type="button"
            onClick={() => {
              console.log("Body button clicked");
              setMode("body");
            }}
            className={`px-6 py-3 rounded-lg font-bold transition-all cursor-pointer ${
              mode === "body"
                ? "bg-white text-pink-600 shadow-lg scale-105"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Body {mode === "body" && "✓"}
          </button>
          <button
            type="button"
            onClick={() => {
              console.log("Brain button clicked");
              setMode("brain");
            }}
            className={`px-6 py-3 rounded-lg font-bold transition-all cursor-pointer ${
              mode === "brain"
                ? "bg-white text-purple-600 shadow-lg scale-105"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Brain {mode === "brain" && "✓"}
          </button>
          <button
            type="button"
            onClick={() => {
              console.log("Business button clicked");
              setMode("business");
            }}
            className={`px-6 py-3 rounded-lg font-bold transition-all cursor-pointer ${
              mode === "business"
                ? "bg-white text-indigo-600 shadow-lg scale-105"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Business {mode === "business" && "✓"}
          </button>
        </div>

        {/* Chat Container */}
        <div className="bg-white/95 rounded-2xl shadow-2xl overflow-hidden">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-20">
                <p className="text-xl font-bold mb-2">
                  Welcome to SUPERNova AI! 🚀
                </p>
                <p>
                  Choose a mode above and start chatting with your AI rockstar
                  coach
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[70%]">
                  <p className="text-purple-600 font-bold animate-pulse">
                    {loadingMessage}
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={2}
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-6">
          <a
            href="/dashboard"
            className="text-white hover:text-pink-200 underline"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
