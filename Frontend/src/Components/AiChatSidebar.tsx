import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Input,
  ScrollShadow,
} from "@heroui/react";
import { AnimatePresence, motion, number } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Clock,
  Forward,
  Loader2,
  MegaphoneOff,
  Menu,
  MessageCircle,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { api } from "../api/axiosInstance";
import { useNotes } from "../Context/Notescontext";
import { Link } from "react-router-dom";

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
interface ConversationData {
  id: number;
  noteId: number | null;
  title: string;
  lastMessage: string;
  messageCount: number;
  lastUpdated: Date;
  totalTokens: number;
}
interface AiChatSidebarProps {
  isopen: boolean;
  onClose: () => void;
  note: Note | null;
  initialAnalysis?: string;
  isAnalyzing: boolean;
  conversationId: number;
  conversationTitle: string;
  onConversationLoaded: (message: Message[], conversationId: number) => void;
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
  const [isfirstmessage, setIsFirstMessage] = useState(true);
  const [inputvalue, setInputValue] = useState("");
  const [isloading, setIsLoading] = useState(false);
  const [quotaexceeded, setQuotaExceeded] = useState(false);

  const [selectednotes, setSelectedNotes] = useState<Note | null>(null);
  const { notes } = useNotes();
  const completedNotes = notes.filter((n) => n.completed && n.picture);
  const [currentConversationId, setCurrentConversationId] = useState<
    number | null
  >(null);
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [recentconversations, setRecentConversations] = useState<
    ConversationData[]
  >([]);
  const [showConvList, setShowConvList] = useState(false);

  const [showimagepreview, setShowImagePreview] = useState<boolean>(true);
  const [isimagemodalopen, setIsImageModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoadingState = isloading || isAnalyzing;

  const { user } = useAuth();

  useEffect(() => {
    if (isopen && user) {
      loadRecentConversations();
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
    } else {
      setQuotaExceeded(false);
    }
  }, [isopen, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadRecentConversations = async () => {
    const res = await api.get("/getconversation/recent?limit=10");
    // console.log("API RESPONSES", res.data.data);
    if (res.data.success) {
      // console.log(res.data.data);
      setRecentConversations(res.data.data);
    }
  };

  const selectConversation = async (conv: ConversationData) => {
    setIsLoading(true);
    try {
      const res = await api.get(
        `/getconversation/id?conversationId=${conv.id}`,
      );
      if (res.data.success && res.data.data) {
        setCurrentConversationId(conv.id);
        setCurrentTitle(conv.title);
        const loadedMessages = res.data.data.message.map((m: any) => ({
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp),
        }));
        // console.log(loadedMessages);
        setMessages(loadedMessages);
        setShowConvList(false);
        const relatedNote = notes.find((n) => n.id === conv.noteId);
        if (relatedNote) {
          setSelectedNotes(relatedNote);
          if (relatedNote.picture) {
            setShowImagePreview(true);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoteSelect = async (note: Note) => {
    setSelectedNotes(note);
    setCurrentConversationId(null);
    setCurrentTitle(note.productTitle);
    setMessages([]);
    setIsFirstMessage(true);
    setShowImagePreview(true);
  };

  const deleteCurrentConversation = async (convId: number) => {
    if (!convId) return;
    try {
      await api.delete(`/conversation/${convId}`);
      setRecentConversations((prev) => prev.filter((c) => c.id !== convId));
      setCurrentConversationId(null);
      setCurrentTitle("");
      setMessages([]);
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  useEffect(() => {
    if (!selectednotes && note) {
      setSelectedNotes(note);
    }
  }, [note, selectednotes]);

  const handleSendMessage = async () => {
    if (!inputvalue.trim() || !selectednotes) return;
    const userMessage: Message = {
      role: "user",
      content: inputvalue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    try {
      const response = await api.post(
        "/analyze-receipt",
        {
          noteId: selectednotes?.id,
          imageBase64: isfirstmessage ? selectednotes?.picture : undefined,
          message: inputvalue,
          previousMessages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
        {
          timeout: 30000,
        },
      );
      if (response.data.success) {
        const aiMessage: Message = {
          role: "ai",
          content: response.data.analysis,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsFirstMessage(false);
        loadRecentConversations();
        if (response.data.conversationId) {
          setCurrentConversationId(response.data.conversationId);
        }
        if (response.data.title) {
          setCurrentTitle(response.data.title);
        }
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        setQuotaExceeded(true);
        return;
      }
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

  const getInitial = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toLocaleUpperCase();
    }
    return name.slice(0, 2).toLocaleUpperCase();
  };
  return (
    isopen && (
      <AnimatePresence>
        <motion.div
          initial={{ x: "150%" }}
          animate={{ x: 0 }}
          exit={{ x: "150%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`fixed right-[450px] top-0 h-screen w-[300px]  ${showConvList ? "visible" : "hidden"} z-40 bg-gray-200 dark:bg-gray-800 invisible sm:visible  sm:block`}
        >
          <div className="flex flex-col h-full p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-linear-to-br  rounded-xl">
                <MessageCircle className="w-5 h-5 " />
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              {recentconversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 px-4  rounded-xl border border-gray-400 dark:border-gray-800 ">
                  <MegaphoneOff className="w-8 h-8  mb-2" />
                  <p className="font-medium text-lg text-center">
                    No recent conversation found
                  </p>
                  <p className=" text-[10px] text-center mt-1">
                    Start a new chat to see it here
                  </p>
                </div>
              ) : (
                recentconversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center gap-2 dark:bg-white/10 rounded-lg bg-gray-300 hover:bg-gray-400 dark:hover:bg-white/20 transition-all"
                  >
                    <button
                      onClick={() => selectConversation(conv)}
                      className={`flex-1 px-3 py-2 text-sm text-left Ubuntu ${
                        currentConversationId === conv.id
                          ? "text-black dark:bg-white"
                          : "text-black/80 dart:bg-white/80"
                      }`}
                    >
                      {conv.title.substring(0, 30)}
                    </button>

                    <Button
                      isIconOnly
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCurrentConversation(conv.id);
                      }}
                      className="text-black dark:text-white  mr-1"
                      size="sm"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* OVERLAY */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />

        {/* CONVERSATION LIST OVERLAY - MOBIL */}
        {showConvList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-gray-200 dark:bg-gray-700 backdrop-blur-sm flex flex-col"
          >
            {/* Overlay Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
              <h3 className="Alfa-slab-one tracking-wide  text-lg">
                Recent Chats
              </h3>
              <Button
                isIconOnly
                variant="ghost"
                onPress={() => setShowConvList(false)}
                className=" "
              >
                <X size={20} />
              </Button>
            </div>

            {/* Conv Lista */}
            <div className="flex-1 overflow-y-auto p-4">
              {recentconversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <MegaphoneOff className="w-12 h-12  mb-4" />
                  <p className=" text-sm text-center">
                    No recent conversation found
                  </p>
                  <p className="0 text-xs text-center mt-1">
                    Start a new chat to see it here
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 ">
                  {recentconversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="flex items-center gap-2 cursor-pointer bg-gray-400 dark:bg-gray-900  rounded-xl p-3 hover:bg-gray-300 dark:hover:bg-gray-800 transition-all"
                    >
                      <button
                        onClick={() => selectConversation(conv)}
                        className={`flex-1 text-left ${
                          currentConversationId === conv.id ? "" : ""
                        }`}
                      >
                        <p className="font-medium truncate">{conv.title}</p>
                      </button>
                      <Button
                        isIconOnly
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCurrentConversation(conv.id);
                        }}
                        className=""
                        size="sm"
                      >
                        <Trash2
                          size={16}
                          className="text-bg-black dark:text-bg-white"
                        />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SIDEBAR */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-full sm:w-[450px] z-50 shadow-2xl ml-[200px]"
          style={{
            background:
              "radial-gradient(circle at 50% 90%, #e58612 0%, #c97e0e 15%, #8b5a3c 30%,#32303d 50%, #282730 65%, #17161e 100%)",
          }}
        >
          <Card className="h-full border-0 bg-transparent">
            <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-white/10">
              <div className="absolute left-2 top-2">
                <Button
                  isIconOnly
                  variant="ghost"
                  onPress={() => setShowConvList(!showConvList)}
                  className="text-white hover:bg-white/10 sm:hidden" // ← Csak mobil
                >
                  <Menu size={20} />
                </Button>
              </div>

              <h3 className="Alfa-slab-one tracking-wide text-white">
                {currentTitle || "New Chat"}
              </h3>
              <Button
                isIconOnly
                variant="ghost"
                onPress={onClose}
                className="text-white hover:bg-white/10"
              >
                <X size={6} />
              </Button>
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
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
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
                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === "user"
                          ? user?.picture
                            ? null
                            : "bg-linear-to-br from-gray-800 to-gray-600"
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
                          <Avatar className="mt-5 md-hidden">
                            <Avatar.Fallback className="bg-secondary text-white font-bold">
                              {getInitial(user?.name || "U")}
                            </Avatar.Fallback>
                          </Avatar>
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

                {!selectednotes && completedNotes.length > 0 && (
                  <div className="bg-white/10 rounded-xl p-4 mb-4">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Select a completed note to analyze
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {completedNotes.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleNoteSelect(n)}
                          className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all flex items-center gap-3"
                        >
                          {n.picture && (
                            <img
                              src={n.picture}
                              className="w-10 h-10 rounded object-cover"
                              alt=""
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">
                              {n.productTitle}
                            </p>
                            <p className="text-white/50 text-sm">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                              }).format(Number(n.cost) || 0)}{" "}
                              • {n.products.length} items
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {user ? (
                  !note &&
                  completedNotes.length === 0 && (
                    <div className="text-center py-8 text-white/50">
                      <p>No completed notes with pictures found.</p>
                      <p className="text-sm mt-2">
                        Complete a note with a receipt image first!
                      </p>
                    </div>
                  )
                ) : (
                  <div className="bg-white/10 border border-white/20 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-br from-secondary/30 to-primary/30 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-secondary" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">
                      Unlock AI Insights
                    </h4>
                    <p className="text-white/60 text-sm mb-4">
                      Create your account to access smart receipt analysis and
                      personalized spending tips
                    </p>
                    <Link to="/Account">
                      <Button className="bg-linear-to-r from-primary to-secondary text-white font-semibold px-6">
                        Create Account <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}

                {isloading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
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
                          className="w-2 h-2 bg-gray-200 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {quotaexceeded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-linear-to-r from-primary/20 to-secondary/20 border border-orange-500/30 rounded-xl p-4 mb-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold text-white Alfa-slab-one">
                          Daily Limit Reached
                        </h2>
                        <p className="text-white/80 text-sm leading-relaxed">
                          You've reached your daily AI quota. New tokens will be
                          available tomorrow at midnight.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </ScrollShadow>

              <div className="p-4 bg-black/20 rounded-xl">
                {showimagepreview && selectednotes?.picture && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-3 flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 pr-4 group"
                  >
                    <div
                      onClick={() => setIsImageModalOpen(true)}
                      className="w-10 h-10 rounded-lg bg-gradient-to-br from-white to-black border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden"
                    >
                      <img
                        src={selectednotes.picture}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-white flex-1 min-w-0">
                      <p className="font-bold">{selectednotes.productTitle}</p>
                      <p className="text-xs text-white/60">
                        Attached to this note
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowImagePreview(false);
                        setSelectedNotes(null);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/20 border border-white/10 hover:border-white/30 transition-all duration-200 opacity-60 group-hover:opacity-100"
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
                    disabled={isLoadingState || quotaexceeded || !selectednotes}
                  />
                  <Button
                    isIconOnly
                    onPress={handleSendMessage}
                    isDisabled={!inputvalue.trim() || isloading}
                    className="bg-linear-to-r from-secondary to-primary"
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

        {isimagemodalopen && selectednotes?.picture && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsImageModalOpen(false)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
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
              src={selectednotes.picture}
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
