"use client";
import { api } from "@/common/api/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Input, Typography, message, Popconfirm } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { History, Plus, SendHorizontal, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { components } from "./AIReportsPage";

const { Text } = Typography;

interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatHistory {
  id: number;
  conversationLog: AIMessage[];
  createdAt: string;
  title?: string;
}

export function AIChatPage({ accountId }: { accountId: number }) {
  const t = useTranslations("AIChat");
  const [chatId, setChatId] = useState<number | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const {
    data: messages,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["aiChat", chatId],
    queryFn: async () => {
      if (!chatId) return [];
      return (await api.get<AIMessage[]>(`/ai-chat/${chatId}`)).data;
    },
    enabled: !!chatId,
  });

  const { data: chatHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ["aiChatHistory"],
    queryFn: async () => {
      return (await api.get<ChatHistory[]>("/ai-chat")).data;
    },
  });

  const handleNewChat = () => {
    setChatId(null);
  };

  const { mutate: sendMessage, isPending: sending } = useMutation({
    mutationFn: async (content: string) => {
      const url = chatId
        ? `/ai-chat/${chatId}?accountId=${accountId}`
        : `/ai-chat?accountId=${accountId}`;
      return (
        await api.post<{ chatId: number } & AIMessage>(url, {
          message: content,
        })
      ).data;
    },
    onMutate: async (content: string) => {
      setInputMessage("");
      const previousMessages = queryClient.getQueryData<AIMessage[]>([
        "aiChat",
        chatId,
      ]);

      // Add user message immediately
      queryClient.setQueryData<AIMessage[]>(["aiChat", chatId], (old) => [
        ...(old || []),
        { role: "user", content },
        // Add a temporary loading message from assistant
        { role: "assistant", content: "..." },
      ]);

      return { previousMessages };
    },
    onError: (err, content, context) => {
      queryClient.setQueryData(["aiChat", chatId], context?.previousMessages);
      message.error(t("errorSending"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["aiChat", chatId] });
    },
    onSuccess: (res) => {
      if (!chatId) {
        setChatId(res.chatId);
        // Refresh chat history when a new chat is created
        queryClient.invalidateQueries({ queryKey: ["aiChatHistory"] });
      }
      refetch();
    },
  });

  const { mutate: deleteChat } = useMutation({
    mutationFn: async (chatIdToDelete: number) => {
      return await api.delete(`/ai-chat/${chatIdToDelete}`);
    },
    onSuccess: (_, chatIdToDelete) => {
      if (chatId === chatIdToDelete) {
        setChatId(null);
      }
      queryClient.invalidateQueries({ queryKey: ["aiChatHistory"] });
      message.success(t("chatDeleted"));
    },
    onError: () => {
      message.error(t("errorDeleting"));
    },
  });

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage.trim());
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll down on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChatSelect = (selectedChatId: number) => {
    setChatId(selectedChatId);
    refetch();

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col space-y-6">
      <Card title={t("title")} className="overflow-hidden flex flex-col">
        <div className="flex-grow overflow-y-auto overflow-x-hidden px-4 pb-4 h-[60vh]">
          <AnimatePresence initial={false}>
            {/* biome-ignore lint/a11y/useValidAriaRole: <explanation> */}
            <Message
              key="system-prompt"
              role="assistant"
              content={t("welcomeMessage")}
              sending={false}
            />

            {messages?.map((msg, idx) => (
              <Message
                key={idx}
                role={msg.role}
                content={msg.content}
                sending={sending && idx === messages.length - 1}
              />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onPressEnter={handleSend}
              placeholder={t("inputPlaceholder")}
              disabled={sending}
              className="flex-grow"
            />
            <Button
              type="primary"
              onClick={handleSend}
              disabled={sending}
              icon={<SendHorizontal className="h-5 w-5" />}
              className="flex items-center justify-center"
            />
          </div>
        </div>
      </Card>

      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              <span>{t("chatHistory")}</span>
            </div>
            <Button
              type="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={handleNewChat}
              className="flex items-center gap-1"
            >
              {t("newChat")}
            </Button>
          </div>
        }
        className="overflow-hidden"
      >
        <div className="space-y-2">
          {loadingHistory ? (
            <Text className="text-gray-500">{t("loadingHistory")}</Text>
          ) : chatHistory?.length ? (
            chatHistory.map((chat) => {
              let title = chat.title;

              if (!title) {
                title = chat.conversationLog[1]?.content.slice(0, 50);
              }

              let isTruncated = false;

              if (title.length > 50) {
                isTruncated = true;
                title = title.slice(0, 50);
              }

              return (
                <div
                  key={chat.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <button
                    type="button"
                    className="flex-grow text-left"
                    onClick={() => handleChatSelect(chat.id)}
                  >
                    <div className="flex justify-between items-center">
                      <Text className="font-medium">
                        {title}
                        {isTruncated && "..."}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {new Date(chat.createdAt).toLocaleDateString()}
                      </Text>
                    </div>
                  </button>
                  <Popconfirm
                    title={t("deleteChatConfirm")}
                    onConfirm={() => deleteChat(chat.id)}
                    okText={t("yes")}
                    cancelText={t("no")}
                    placement="left"
                  >
                    <Button
                      type="text"
                      icon={<Trash2 className="h-4 w-4" />}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    />
                  </Popconfirm>
                </div>
              );
            })
          ) : (
            <Text className="text-gray-500">{t("noChatHistory")}</Text>
          )}
        </div>
      </Card>
    </div>
  );
}

function Message({
  role,
  content,
  sending,
}: {
  role: AIMessage["role"];
  content: string;
  sending: boolean;
}) {
  return (
    <motion.div
      style={{ originX: role === "user" ? 1 : 0 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ delay: role === "assistant" ? 0.4 : 0 }}
      className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[70%] rounded-xl px-3 py-2 my-1 shrink-0 ${
          role === "user"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-800"
        }`}
      >
        {role === "assistant" && sending ? (
          <span className="inline-flex opacity-70 gap-0.5">
            <span className="animate-pulse">
              <SVGCircle />
            </span>
            <span className="animate-pulse animation-delay-200">
              <SVGCircle />
            </span>
            <span className="animate-pulse animation-delay-400">
              <SVGCircle />
            </span>
          </span>
        ) : role === "user" ? (
          content
        ) : (
          <ReactMarkdown components={components}>{content}</ReactMarkdown>
        )}
      </div>
    </motion.div>
  );
}

const SVGCircle = ({ size = 8, ...props }) => (
  // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);
