import { Button, Card, CardHeader, Input, ScrollShadow } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Forward, Loader2, Sparkles, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { api } from "../api/axiosInstance";

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface Note {
  id: number;
  productTitle: string;
  estcost: string;
  cost?: string | null;
  picture?: string | null;
  products: Array<{
    name: string;
    quantity: number | null;
    estprice: number | null;
  }>;
}
interface AiChatSidebarProps {
  isopen: boolean;
  onClose: () => void;
  note: Note | null;
  initialAnalysis?: string;
  isAnalyzing: boolean;
}

const formatMessageContent = (content: string): string => {
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/'/g, "&#039;");
  };

  let formatted = escapeHtml(content);

  formatted = formatted.replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="font-bold text-white">$1</strong>',
  );

  return formatted;
};
const AiChatSidebar: React.FC<AiChatSidebarProps> = ({
  isopen,
  onClose,
  note,
  initialAnalysis,
  isAnalyzing = false,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputvalue, setInputValue] = useState("");
  const [isloading, setIsLoading] = useState(false);

  const [showimagepreview, setShowImagePreview] = useState<boolean>(true);
  const [isimagemodalopen, setIsImageModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoadingState = isloading || isAnalyzing;

  const { user } = useAuth();

  useEffect(() => {
    if (initialAnalysis) {
      setMessages((prev) => {
        const alreadyExists = prev.some(
          (m) => m.role === "ai" && m.content === initialAnalysis,
        );
        if (alreadyExists) return prev;

        return [
          ...prev,
          { role: "ai", content: initialAnalysis, timestamp: new Date() },
        ];
      });
    }
  }, [initialAnalysis]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputvalue.trim() || !note) return;
    const userMessage: Message = {
      role: "user",
      content: inputvalue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    try {
      const response = await api.post("analyze-receipt", {
        noteId: note.id,
        message: inputvalue,
        previousMessages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });
      if (response.data.success) {
        const aiMessage: Message = {
          role: "ai",
          content: response.data.analysis,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "ai",
        content: "Sorry, I couldn't process your message. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key == "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  return (
    isopen && (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-full sm:w-[450px] z-50 shadow-2xl"
          style={{
            background:
              "radial-gradient(circle at 50% 90%, #e58612 0%, #c97e0e 15%, #8b5a3c 30%,#32303d 50%, #282730 65%, #17161e 100%)",
          }}
        >
          <Card className="h-full justify-between border-0 bg-transparent">
            <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-linear-to-br from-primary to-secondary rounded-xl">
                  <Sparkles className="w-5 h-5 text-white"></Sparkles>
                </div>
                <div>
                  <h3 className="Alfa-slab-one tracking-wide text-white">
                    FloWealth Assistant
                  </h3>
                </div>
              </div>
              <Button
                isIconOnly
                variant="ghost"
                onPress={onClose}
                className="text-white hover:bg-white/10"
              >
                <X size={6} />
              </Button>
              <div className="flex w-full justify-start items-start">
                <p className="Ubuntu text-white">{note?.productTitle}</p>
              </div>
            </CardHeader>
            <div className="flex flex-col flex-1 overflow-hidden">
              <ScrollShadow
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
                hideScrollBar
              >
                {messages.length === 0 && !initialAnalysis && isAnalyzing && (
                  <motion.div
                    key="analyzing-loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/10 text-white p-4 rounded-2xl rounded-tl-sm border border-white/10">
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin w-4 h-4" />
                        <span className="text-sm">
                          Analyzing your receipt...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === "user"
                          ? user?.picture
                            ? null
                            : "bg-linear-to-br from-gray-800 to-gray-600 "
                          : "bg-linear-to-br from-primary to-secondary"
                      }`}
                    >
                      {message.role === "user" ? (
                        user?.picture ? (
                          <img
                            src={user?.picture}
                            className="h-7 w-7 object-cover rounded-full"
                          />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.role === "user"
                          ? "bg-linear-to-br from-green-600 to-emerald-700 text-white rounded-tr-sm"
                          : "bg-white/20 text-white rounded-tl-sm border border-white/10"
                      }`}
                    >
                      <div
                        className="whitespace-pre-wrap text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: formatMessageContent(message.content),
                        }}
                      ></div>
                      <div
                        className={`text-xs mt-2 ${message.role === "user" ? "text-green-200" : "text-gray-700"}`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isloading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/10 text-white p-4 rounded-2xl rounded-tl-sm border border-white/10">
                      <div className="flex gap-1">
                        <motion.div
                          key="dot1"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.5 }}
                          className="w-2 h-2 bg-gray-200 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          key="dot2"
                          transition={{
                            repeat: Infinity,
                            duration: 0.5,
                            delay: 0.1,
                          }}
                          className="w-2 h-2 bg-gray-200 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          key="dot3"
                          transition={{
                            repeat: Infinity,
                            duration: 0.5,
                            delay: 0.2,
                          }}
                          className="w-2 h-2 bg-gray-200  rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </ScrollShadow>
              <div className="p-4 bg-black/20 rounded-xl">
                {showimagepreview && note?.picture && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-3 flex items-center gap-3 bg-white/10 backdrop-blur-sm 
               border border-white/20 rounded-xl p-3 pr-4 group"
                  >
                    <div
                      onClick={() => setIsImageModalOpen(true)}
                      className="w-10 h-10 rounded-lg bg-gradient-to-br from-white to-black
                      border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden
                    "
                    >
                      <img
                        src={note.picture}
                        className="w-full h-full object-cover "
                      />
                    </div>
                    <div className="text-white flex-1 min-w-0">
                      <p className="font-bold">Image.png</p>
                      <p className="text-xs text-white/60">
                        Attached to this note
                      </p>
                    </div>
                    <button
                      onClick={() => setShowImagePreview(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center
                    bg-white/5 hover:bg-white/20 border border-white/10 
                    hover:border-white/30 transition-all duration-200
                    opacity-60 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </motion.div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={inputvalue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={
                      isAnalyzing
                        ? "AI is analyzing your receipt..."
                        : "Ask about your spending..."
                    }
                    className="flex-1"
                    disabled={isLoadingState}
                  />
                  <Button
                    isIconOnly
                    onPress={handleSendMessage}
                    isDisabled={!inputvalue.trim() || isloading}
                    className="bg-linear-to-r from-secondary to-primary "
                  >
                    {isLoadingState ? (
                      <Loader2 className="animate-spin w-6 h-6" />
                    ) : (
                      <Forward className="w-6 h-6" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
        {isimagemodalopen && note?.picture && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsImageModalOpen(false)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 
                 hover:bg-white/20 flex items-center justify-center 
                 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                setIsImageModalOpen(false);
              }}
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={note.picture}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    )
  );
};

export default AiChatSidebar;
