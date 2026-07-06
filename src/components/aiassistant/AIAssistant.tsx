import {
  ArrowLeft,
  Bot,
  LockKeyhole,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  DEFAULT_BRAND_NAME,
  DEFAULT_USAGE,
  GUIDE_LIMIT_MESSAGE,
  GUIDE_QUESTIONS,
  GUIDE_SELECTIONS,
  LOGIN_REQUIRED_MESSAGE,
  MAX_GUIDE_USES,
  NO_MATCHING_PRODUCTS_MESSAGE,
} from "./constants";
import type {
  AIAssistantProps,
  AIProduct,
  AssistantUsage,
  ChatMessage,
  GuideSelection,
  RecommendationAnswers,
} from "./types";
import { buildAssistantRequest, isProductAvailable } from "./utils";

const PRODUCT_SELECTION_PROMPT = "What do you want help choosing?";

const messageId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createMessage = (
  role: ChatMessage["role"],
  text: string,
): ChatMessage => ({ id: messageId(), role, text });

export const AIAssistant = ({
  searchProducts,
  userId,
  brandName = DEFAULT_BRAND_NAME,
  responder,
  usageStore,
}: AIAssistantProps) => {
  const titleId = useId();
  const userKey = userId ?? "";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<GuideSelection | null>(
    null,
  );
  const [answers, setAnswers] = useState<RecommendationAnswers>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [input, setInput] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [flowComplete, setFlowComplete] = useState(false);
  const [usage, setUsage] = useState<AssistantUsage>({ ...DEFAULT_USAGE });
  const [loadedUsageKey, setLoadedUsageKey] = useState<string | null>(null);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const flowIdRef = useRef(0);

  const usageLoaded = !userId || loadedUsageKey === userKey;
  const guideLimitReached = usage.guideCount >= MAX_GUIDE_USES;
  const guidesRemaining = Math.max(0, MAX_GUIDE_USES - usage.guideCount);
  const questions = selectedGuide ? GUIDE_QUESTIONS[selectedGuide.id] : [];
  const currentQuestion = questions[questionIndex];
  const isBusy = isResponding || Boolean(typingMessageId);

  useEffect(() => {
    let active = true;

    if (!userId || !usageStore) {
      Promise.resolve().then(() => {
        if (!active) return;
        setUsage({ ...DEFAULT_USAGE });
        setLoadedUsageKey(userKey);
      });
      return () => {
        active = false;
      };
    }

    Promise.resolve()
      .then(() => usageStore.get(userKey))
      .then((storedUsage) => {
        if (!active) return;
        setUsage({ ...DEFAULT_USAGE, ...storedUsage });
        setLoadedUsageKey(userKey);
      })
      .catch(() => {
        if (!active) return;
        setUsage({ ...DEFAULT_USAGE });
        setLoadedUsageKey(userKey);
      });

    return () => {
      active = false;
    };
  }, [usageStore, userId, userKey]);

  useEffect(() => {
    if (!isOpen || !usageLoaded || !userId || messages.length) return;

    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      const message = createMessage(
        "assistant",
        guideLimitReached ? GUIDE_LIMIT_MESSAGE : PRODUCT_SELECTION_PROMPT,
      );
      setMessages([message]);
      setTypingMessageId(message.id);
    });

    return () => {
      active = false;
    };
  }, [guideLimitReached, isOpen, messages.length, usageLoaded, userId]);

  useEffect(() => {
    if (
      isOpen &&
      selectedGuide &&
      currentQuestion &&
      !currentQuestion.options &&
      !isBusy
    ) {
      window.setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [currentQuestion, isBusy, isOpen, selectedGuide]);

  const scrollToLatestMessage = useCallback(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const finishTyping = useCallback((id: string) => {
    setTypingMessageId((current) => current === id ? null : current);
  }, []);

  const addAssistantMessage = (text: string) => {
    const message = createMessage("assistant", text);
    setMessages((current) => [...current, message]);
    setTypingMessageId(message.id);
  };

  const addUserMessage = (text: string) => {
    setMessages((current) => [...current, createMessage("user", text)]);
  };

  const resetFlow = () => {
    flowIdRef.current += 1;
    const message = createMessage(
      "assistant",
      guideLimitReached ? GUIDE_LIMIT_MESSAGE : PRODUCT_SELECTION_PROMPT,
    );
    setMessages([message]);
    setTypingMessageId(message.id);
    setSelectedGuide(null);
    setAnswers({});
    setQuestionIndex(0);
    setInput("");
    setSelectedOptions([]);
    setIsResponding(false);
    setFlowComplete(false);
  };

  const selectGuide = (selection: GuideSelection) => {
    if (isBusy || guideLimitReached || !responder) return;

    addUserMessage(selection.label);
    setSelectedGuide(selection);
    setAnswers({});
    setQuestionIndex(0);
    setSelectedOptions([]);
    setFlowComplete(false);
    addAssistantMessage(GUIDE_QUESTIONS[selection.id][0].prompt);
  };

  const findProducts = async (selection: GuideSelection) => {
    const results = await Promise.all(
      selection.searchQueries.map((query) => searchProducts(query, "catalog")),
    );
    const uniqueProducts = new Map<string, AIProduct>();

    for (const product of results.flat()) {
      uniqueProducts.set(product.id, product);
    }

    return [...uniqueProducts.values()];
  };

  const responseUsesValidProducts = (
    selection: GuideSelection,
    responseProductId: string | undefined,
    responseProductIds: readonly string[] | undefined,
    products: readonly AIProduct[],
  ) => {
    const expectedCount = selection.searchQueries.length;
    const selectedIds = selection.isStack
      ? responseProductIds ?? []
      : responseProductId
      ? [responseProductId]
      : [];

    if (selectedIds.length !== expectedCount) return false;
    if (new Set(selectedIds).size !== selectedIds.length) return false;

    return selectedIds.every((id) =>
      products.some(
        (product) => product.id === id && isProductAvailable(product),
      )
    );
  };

  const requestRecommendation = async (
    finalAnswers: RecommendationAnswers,
    selection: GuideSelection,
  ) => {
    if (!userId || !responder || guideLimitReached) return;

    const flowId = flowIdRef.current;
    setIsResponding(true);

    try {
      const products = await findProducts(selection);
      if (flowId !== flowIdRef.current) return;

      if (!products.length) {
        addAssistantMessage(NO_MATCHING_PRODUCTS_MESSAGE);
        setFlowComplete(true);
        return;
      }

      const request = buildAssistantRequest(
        products,
        brandName,
        selection,
        finalAnswers,
      );
      const response = await responder(request);
      if (flowId !== flowIdRef.current) return;

      if (response.usage) setUsage(response.usage);

      if (!response.relevant) {
        addAssistantMessage(response.text || NO_MATCHING_PRODUCTS_MESSAGE);
        setFlowComplete(true);
        return;
      }

      if (
        !responseUsesValidProducts(
          selection,
          response.productId,
          response.productIds,
          products,
        )
      ) {
        addAssistantMessage(NO_MATCHING_PRODUCTS_MESSAGE);
        setFlowComplete(true);
        return;
      }

      addAssistantMessage(response.text);
      setFlowComplete(true);
    } catch {
      if (flowId !== flowIdRef.current) return;
      addAssistantMessage(
        "I couldn’t complete the product search right now. Please try again shortly.",
      );
      setFlowComplete(true);
    } finally {
      if (flowId === flowIdRef.current) setIsResponding(false);
    }
  };

  const submitAnswer = (rawValue: string) => {
    const value = rawValue.trim();
    if (
      !value ||
      isBusy ||
      !selectedGuide ||
      !currentQuestion ||
      guideLimitReached
    ) {
      return;
    }

    setInput("");
    setSelectedOptions([]);
    addUserMessage(value);

    const nextAnswers = { ...answers, [currentQuestion.id]: value };
    const nextIndex = questionIndex + 1;
    setAnswers(nextAnswers);
    setQuestionIndex(nextIndex);

    const nextQuestion = questions[nextIndex];
    if (nextQuestion) {
      addAssistantMessage(nextQuestion.prompt);
    } else {
      void requestRecommendation(nextAnswers, selectedGuide);
    }
  };

  const toggleOption = (option: string) => {
    if (isBusy) return;

    const isExclusive = /^(none|no|not sure)$/i.test(option);
    setSelectedOptions((current) => {
      if (current.includes(option)) {
        return current.filter((item) => item !== option);
      }
      if (isExclusive) return [option];

      return [
        ...current.filter((item) => !/^(none|no|not sure)$/i.test(item)),
        option,
      ];
    });
  };

  return (
    <aside
      className="fixed bottom-0 right-0 z-[60]"
      aria-label={`${brandName} AI assistant`}
    >
      <section
        className={`fixed inset-x-3 bottom-24 flex h-[min(72vh,650px)] flex-col overflow-hidden rounded-3xl border border-zinc-700/80 bg-zinc-950/95 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all duration-300 sm:inset-x-auto sm:right-6 sm:w-[400px] ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-5 scale-95 opacity-0"
        }`}
        role="dialog"
        aria-labelledby={titleId}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <header className="flex items-center justify-between border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-950 px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            {selectedGuide || flowComplete
              ? (
                <button
                  type="button"
                  onClick={resetFlow}
                  disabled={isBusy}
                  className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:opacity-40"
                  aria-label="Start a new guide"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )
              : (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime-400 text-zinc-950 shadow-lg shadow-lime-400/20">
                  <Bot className="h-5 w-5" />
                </span>
              )}
            <div className="min-w-0">
              <h2
                id={titleId}
                className="truncate text-base font-bold text-white"
              >
                {brandName} AI
              </h2>

              <p className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
                {guidesRemaining}/{MAX_GUIDE_USES} personalized guides left
              </p>

              <p className="mt-0.5 text-[10px] leading-4 text-red-400">
                AI can make mistakes. Please verify before buying.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            aria-label="Close AI assistant"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 [scrollbar-color:#3f3f46_transparent] [scrollbar-width:thin]">
          {!usageLoaded
            ? (
              <div className="flex h-full items-center justify-center">
                <Sparkles className="h-6 w-6 animate-pulse text-lime-400" />
              </div>
            )
            : !userId
            ? (
              <div className="flex h-full flex-col items-center justify-center px-5 text-center">
                <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-lime-400/20 bg-lime-400/10 text-lime-400">
                  <LockKeyhole className="h-6 w-6" />
                </span>
                <h3 className="mb-2 text-lg font-bold text-white">
                  Login required
                </h3>
                <p className="text-sm leading-6 text-zinc-400">
                  {LOGIN_REQUIRED_MESSAGE}
                </p>
              </div>
            )
            : (
              <div
                className="space-y-4"
                role="log"
                aria-live="polite"
                aria-busy={isBusy}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${
                        message.role === "user"
                          ? "rounded-br-md bg-lime-400 font-medium text-zinc-950"
                          : "rounded-bl-md border border-zinc-800 bg-zinc-900 text-zinc-300"
                      }`}
                    >
                      {message.role === "assistant"
                        ? (
                          <TypewriterText
                            id={message.id}
                            text={message.text}
                            active={typingMessageId === message.id}
                            onComplete={finishTyping}
                            onProgress={scrollToLatestMessage}
                          />
                        )
                        : (
                          message.text
                        )}
                    </div>
                  </div>
                ))}

                {isResponding && (
                  <div className="flex justify-start">
                    <div className="flex gap-1 rounded-2xl rounded-bl-md border border-zinc-800 bg-zinc-900 px-4 py-3">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:240ms]" />
                    </div>
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>
            )}
        </div>

        {usageLoaded &&
          userId &&
          !selectedGuide &&
          !guideLimitReached && (
          <footer className="border-t border-zinc-800 bg-zinc-950 px-3 py-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {GUIDE_SELECTIONS.map((selection) => (
                <button
                  key={selection.id}
                  type="button"
                  disabled={isBusy || !responder}
                  onClick={() => selectGuide(selection)}
                  className={`rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-left text-xs font-medium text-zinc-300 transition hover:border-lime-400/60 hover:text-lime-300 disabled:cursor-not-allowed disabled:opacity-40 ${
                    selection.id === "whey-creatine" ? "sm:col-span-2" : ""
                  }`}
                >
                  {selection.label}
                </button>
              ))}
            </div>
          </footer>
        )}

        {usageLoaded &&
          userId &&
          selectedGuide &&
          currentQuestion &&
          !flowComplete &&
          !guideLimitReached && (
          <footer className="border-t border-zinc-800 bg-zinc-950 px-3 py-3">
            {currentQuestion.options && (
              <div className="mb-3">
                <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  Select all that apply
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.options.map((option) => {
                    const selected = selectedOptions.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={isBusy}
                        aria-pressed={selected}
                        onClick={() => toggleOption(option)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition disabled:opacity-40 ${
                          selected
                            ? "border-lime-400 bg-lime-400 text-zinc-950"
                            : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-lime-400/60 hover:text-lime-300"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  disabled={!selectedOptions.length || isBusy}
                  onClick={() => submitAnswer(selectedOptions.join(", "))}
                  className="mt-3 w-full rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Continue
                </button>
              </div>
            )}
            {!currentQuestion.options && (
              <form
                className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 p-1.5 focus-within:border-lime-400/70"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitAnswer(input);
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={isBusy}
                  maxLength={300}
                  placeholder={currentQuestion.placeholder}
                  className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-sm text-white outline-none placeholder:text-zinc-600 disabled:opacity-50"
                  aria-label="Answer recommendation question"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isBusy}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-lime-400 text-zinc-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Send answer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
            <p className="mt-2 text-center text-[10px] text-zinc-600">
              Question {questionIndex + 1} of {questions.length}
            </p>
          </footer>
        )}

        {usageLoaded &&
          userId &&
          flowComplete &&
          !guideLimitReached && (
          <footer className="border-t border-zinc-800 bg-zinc-950 px-3 py-3">
            <button
              type="button"
              disabled={isBusy}
              onClick={resetFlow}
              className="w-full rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-lime-300 disabled:opacity-40"
            >
              Start another personalized guide
            </button>
          </footer>
        )}
      </section>

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="fixed bottom-5 right-5 grid h-14 w-14 place-items-center rounded-full bg-lime-400 text-zinc-950 shadow-xl shadow-lime-400/25 ring-4 ring-zinc-950 transition duration-300 hover:scale-105 hover:bg-lime-300 active:scale-95 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
        aria-label={isOpen
          ? "Close AI assistant"
          : `Open ${brandName} AI assistant`}
        aria-expanded={isOpen}
      >
        <span
          className={`absolute inset-0 rounded-full bg-lime-400 transition ${
            isOpen ? "scale-100 opacity-0" : "animate-ping opacity-20"
          }`}
        />
        <span
          className={`relative transition-transform duration-300 ${
            isOpen ? "rotate-90" : "rotate-0"
          }`}
        >
          {isOpen
            ? <X className="h-6 w-6" />
            : <MessageCircle className="h-7 w-7" />}
        </span>
      </button>
    </aside>
  );
};

interface TypewriterTextProps {
  id: string;
  text: string;
  active: boolean;
  onComplete: (id: string) => void;
  onProgress: () => void;
}

const TypewriterText = ({
  id,
  text,
  active,
  onComplete,
  onProgress,
}: TypewriterTextProps) => {
  const words = text.match(/\S+\s*/g) ?? [text];
  const [visibleWords, setVisibleWords] = useState(
    active ? 0 : words.length,
  );

  useEffect(() => {
    if (!active) return;

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisibleWords(index);
      onProgress();

      if (index >= words.length) {
        window.clearInterval(timer);
        onComplete(id);
      }
    }, 38);

    return () => window.clearInterval(timer);
  }, [active, id, onComplete, onProgress, text, words.length]);

  return <>{words.slice(0, visibleWords).join("")}</>;
};
