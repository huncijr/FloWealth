import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Label,
  TextField,
  FieldError,
  TextArea,
} from "@heroui/react";
import {
  ArrowDown,
  CheckCircle,
  NotebookPen,
  Plus,
  Sparkles,
  UserPlus,
  X,
  ChevronRight,
  Wand2,
  Database,
  BarChart3,
  Bot,
  Smartphone,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface TutorialProduct {
  name: string;
  quantity: number;
  estprice: number;
}

interface TutorialNote {
  title: string;
  products: TutorialProduct[];
  totalCost: number;
  savedAt: string;
}

interface AiMockProduct {
  id: number;
  productName: string;
  quantity: number;
  estPrice: number;
}

const LOCAL_STORAGE_KEY = "floWealthTutorialNote";

const parseAiInput = (text: string): AiMockProduct[] => {
  const products: AiMockProduct[] = [];
  const sentences = text
    .split(/[,.;\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  let id = Date.now();
  for (const sentence of sentences) {
    const qtyMatch = sentence.match(/^(\d+)\s+/);
    const priceMatch = sentence.match(/(?:for|at)\s+\$?(\d+(?:\.\d{1,2})?)/i);
    const eachMatch = sentence.match(
      /\$?(\d+(?:\.\d{1,2})?)\s*(?:each|per item)/i,
    );
    const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;
    const price = priceMatch
      ? parseFloat(priceMatch[1])
      : eachMatch
        ? parseFloat(eachMatch[1])
        : Math.round(Math.random() * 20 + 1);

    let name = sentence
      .replace(/^\d+\s+/, "")
      .replace(/\s*(?:for|at)\s+\$?\d+(?:\.\d{1,2})?/i, "")
      .replace(/\s*\$?\d+(?:\.\d{1,2})?\s*(?:each|per item)/i, "")
      .replace(/^(?:i need|i want|buy|get|purchase)\s+/i, "")
      .trim();

    if (!name || name.length < 2) {
      name = sentence.replace(/^\d+\s+/, "").trim();
    }

    if (name && name.length > 0) {
      name = name.charAt(0).toUpperCase() + name.slice(1);
      products.push({ id: id++, productName: name, quantity, estPrice: price });
    }
  }

  return products.length > 0
    ? products
    : [
        {
          id: Date.now(),
          productName: text.substring(0, 40),
          quantity: 1,
          estPrice: Math.round(Math.random() * 15 + 3),
        },
      ];
};

const UnauthenticatedExpenses = ({ isDark }: { isDark: boolean }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"idle" | "filling" | "saved">("idle");
  const [showDropdown, setShowDropdown] = useState(false);
  const [title, setTitle] = useState("");
  const [products, setProducts] = useState<TutorialProduct[]>([
    { name: "", quantity: 1, estprice: 0 },
  ]);
  const [savedNote, setSavedNote] = useState<TutorialNote | null>(null);

  // AI states
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiProducts, setAiProducts] = useState<AiMockProduct[]>([]);
  const [showAiProducts, setShowAiProducts] = useState(false);
  const [aiDots, setAiDots] = useState(".");

  // Analyze CTA — appears 2.5s after note is saved
  const [showAnalyzeCta, setShowAnalyzeCta] = useState(false);

  // Create account CTA — appears 4.5s after "Not now" is clicked
  const [showCreateAccountCta, setShowCreateAccountCta] = useState(false);
  const [deferredCreateAccount, setDeferredCreateAccount] = useState(false);

  // Load existing note on mount
  useEffect(() => {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (existing) {
      try {
        setSavedNote(JSON.parse(existing));
        setStep("saved");
      } catch {}
    }
  }, []);

  // Animated dots for AI thinking
  useEffect(() => {
    if (isAiThinking) {
      const interval = setInterval(() => {
        setAiDots((prev) => (prev.length >= 3 ? "." : prev + "."));
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isAiThinking]);

  // Show analyze CTA 2.5s after note is saved
  useEffect(() => {
    if (step === "saved" && savedNote) {
      const timer = setTimeout(() => setShowAnalyzeCta(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [step, savedNote]);

  // Show create account CTA 4.5s after "Not now" is clicked
  useEffect(() => {
    if (deferredCreateAccount && step === "saved" && savedNote) {
      const timer = setTimeout(() => setShowCreateAccountCta(true), 4500);
      return () => clearTimeout(timer);
    }
  }, [deferredCreateAccount, step, savedNote]);

  const totalCost = products.reduce(
    (sum, p) => sum + (p.estprice || 0) * (p.quantity || 1),
    0,
  );

  const addProduct = () => {
    setProducts([...products, { name: "", quantity: 1, estprice: 0 }]);
  };

  const removeProduct = (index: number) => {
    if (products.length <= 1) return;
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (
    index: number,
    field: keyof TutorialProduct,
    value: string | number,
  ) => {
    setProducts(
      products.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const validProducts = products.filter((p) => p.name.trim() !== "");
    if (validProducts.length === 0) return;

    const note: TutorialNote = {
      title: title.trim(),
      products: validProducts.map((p) => ({
        name: p.name.trim(),
        quantity: p.quantity || 1,
        estprice: p.estprice || 0,
      })),
      totalCost,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(note));
    setSavedNote(note);
    setShowAnalyzeCta(false);
    setShowCreateAccountCta(false);
    setDeferredCreateAccount(false);
    setStep("saved");
  };

  const handleStartOver = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setSavedNote(null);
    setTitle("");
    setProducts([{ name: "", quantity: 1, estprice: 0 }]);
    setShowAnalyzeCta(false);
    setShowCreateAccountCta(false);
    setDeferredCreateAccount(false);
    setShowAiInput(false);
    setAiInput("");
    setAiProducts([]);
    setShowAiProducts(false);
    setStep("idle");
  };

  const handleAiGenerate = () => {
    if (!aiInput.trim()) return;
    setIsAiThinking(true);
    setAiDots(".");
    setTimeout(() => {
      const parsed = parseAiInput(aiInput);
      setAiProducts(parsed);
      setShowAiProducts(true);
      setIsAiThinking(false);
    }, 1500);
  };

  const handleAcceptAiProducts = () => {
    const newProducts = aiProducts.map((p) => ({
      name: p.productName,
      quantity: p.quantity || 1,
      estprice: p.estPrice || 0,
    }));
    if (!title.trim() && aiInput.trim()) {
      setTitle(aiInput.substring(0, 30));
    }
    setProducts(newProducts);
    setShowAiProducts(false);
    setShowAiInput(false);
    setAiInput("");
    setAiProducts([]);
  };

  const handleRejectAiProducts = () => {
    setShowAiProducts(false);
    setAiInput("");
    setAiProducts([]);
  };

  // =====================
  // STEP: IDLE
  // =====================
  if (step === "idle") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-8 px-4 py-12">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl" />
          <div
            className={`relative w-28 h-28 rounded-full flex items-center justify-center ${
              isDark ? "bg-gray-700/80" : "bg-white/90"
            } border-2 border-primary/30 shadow-2xl`}
          >
            <NotebookPen className="w-12 h-12 text-primary" />
          </div>
        </motion.div>

        <div className="text-center space-y-3">
          <h2
            className={`font-reddit-condensed text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-gray-800"}`}
          >
            Try adding your first note!
          </h2>
          <p
            className={`text-base sm:text-lg max-w-md leading-relaxed ${isDark ? "text-gray-300" : "text-gray-500"}`}
          >
            See how easy it is to track your expenses. Click the button below to
            create a demo note — no account needed!
          </p>
        </div>

        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1"
        >
          <ArrowDown className="w-8 h-8 text-primary" />
          <ArrowDown className="w-6 h-6 text-primary/60" />
          <ArrowDown className="w-4 h-4 text-primary/30" />
        </motion.div>

        <div className="relative">
          <AnimatePresence>
            {showDropdown && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 rounded-xl border-2 border-primary/50 shadow-2xl overflow-hidden ${
                    isDark ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setStep("filling");
                    }}
                    className="flex items-center gap-3 px-6 py-3 w-full whitespace-nowrap hover:bg-primary/10 transition-colors"
                  >
                    <NotebookPen className="w-5 h-5 text-primary" />
                    <span
                      className={`font-reddit-condensed font-semibold text-base ${isDark ? "text-white" : "text-gray-800"}`}
                    >
                      Start Demo Note
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    />
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <Button
            variant="secondary"
            size="lg"
            className="relative z-10"
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Plus className="w-5 h-5" />
            ADD NEW NOTE
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
            />
          </Button>
        </div>
      </div>
    );
  }

  // =====================
  // STEP: SAVED
  // =====================
  if (step === "saved" && savedNote) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-6 px-4 py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl" />
          <div className="relative w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`w-full max-w-md rounded-2xl border-2 border-green-500/30 shadow-xl overflow-hidden ${
            isDark ? "bg-gray-800/90" : "bg-white/95"
          }`}
        >
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-6 py-4 border-b border-green-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span
                className={`font-reddit-condensed font-extrabold text-lg ${isDark ? "text-white" : "text-gray-800"}`}
              >
                Demo Note Saved!
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <span
                className={`font-reddit-condensed text-xs uppercase tracking-widest ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                Title
              </span>
              <p
                className={`font-semibold text-base ${isDark ? "text-white" : "text-gray-800"}`}
              >
                {savedNote.title}
              </p>
            </div>
            <div>
              <span
                className={`font-reddit-condensed text-xs uppercase tracking-widest ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                Products
              </span>
              <div className="space-y-1 mt-1">
                {savedNote.products.map((p, i) => (
                  <div
                    key={i}
                    className={`flex justify-between text-sm px-2 py-1 rounded ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}
                  >
                    <span>{p.name}</span>
                    <span className="font-medium">
                      {p.quantity}x — ${(p.estprice * p.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div
              className={`flex justify-between items-center pt-2 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}
            >
              <span
                className={`font-reddit-condensed font-semibold text-base ${isDark ? "text-gray-300" : "text-gray-600"}`}
              >
                Total
              </span>
              <span
                className={`font-reddit-condensed text-xl font-extrabold ${isDark ? "text-green-400" : "text-green-600"}`}
              >
                $
                {savedNote.totalCost.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Start over link */}
        <button
          onClick={handleStartOver}
          className={`text-xs underline underline-offset-2 hover:opacity-70 transition-opacity ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          Start Over
        </button>

        {/* =========================================== */}
        {/* FIXED CARD 1: "Now analyze it" / "Not now" */}
        {/* Appears automatically 2.5s after note saved  */}
        {/* =========================================== */}
        <AnimatePresence>
          {showAnalyzeCta && !showCreateAccountCta && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl"
              onClick={() => setShowAnalyzeCta(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 40 }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 20,
                  delay: 0.1,
                }}
                className="relative w-[92%] max-w-sm"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => setShowAnalyzeCta(false)}
                  className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-white dark:bg-gray-700 shadow-lg border-2 border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                </button>

                <div
                  className={`rounded-3xl overflow-hidden shadow-2xl ${
                    isDark
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  {/* Header */}
                  <div className="relative bg-gradient-to-br from-primary to-secondary px-6 pt-10 pb-12">
                    <div className="absolute top-4 right-6 w-20 h-20 rounded-full bg-white/10" />
                    <div className="absolute bottom-4 left-8 w-12 h-12 rounded-full bg-white/8" />
                    <div className="relative flex justify-center mb-4">
                      <motion.div
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 15,
                          delay: 0.25,
                        }}
                        className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center shadow-lg"
                      >
                        <BarChart3
                          className="w-10 h-10 text-white"
                          strokeWidth={2}
                        />
                      </motion.div>
                    </div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="font-reddit-condensed text-white font-extrabold text-2xl text-center leading-tight"
                    >
                      Want to see
                      <br />
                      your analytics?
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.45 }}
                      className="text-white/80 text-base text-center mt-2 font-medium tracking-wide"
                    >
                      View your note on a beautiful chart
                    </motion.p>
                  </div>

                  {/* Buttons */}
                  <div className="px-6 py-6 space-y-3">
                    <Button
                      size="lg"
                      className="w-full py-5 text-lg font-extrabold bg-gradient-to-r from-primary to-secondary text-white shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:brightness-110 transition-all rounded-2xl"
                      onPress={() => {
                        setShowAnalyzeCta(false);
                        navigate("/Analytics");
                      }}
                    >
                      <BarChart3 className="w-5 h-5" />
                      Now analyze it
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full py-5 text-base font-semibold rounded-2xl"
                      onPress={() => {
                        setShowAnalyzeCta(false);
                        setDeferredCreateAccount(true);
                      }}
                    >
                      Not now
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================== */}
        {/* FIXED CARD 2: "Create an account to save it!"  */}
        {/* Appears 4.5s after "Not now" is clicked        */}
        {/* ============================================== */}
        <AnimatePresence>
          {showCreateAccountCta && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl"
              onClick={() => setShowCreateAccountCta(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 40 }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 20,
                  delay: 0.1,
                }}
                className="relative w-[92%] max-w-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowCreateAccountCta(false)}
                  className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-white dark:bg-gray-700 shadow-lg border-2 border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                </button>

                <div
                  className={`rounded-3xl overflow-hidden shadow-2xl ${
                    isDark
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="relative bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 px-6 pt-10 pb-12">
                    <div className="absolute top-4 right-6 w-20 h-20 rounded-full bg-white/10" />
                    <div className="absolute bottom-4 left-8 w-12 h-12 rounded-full bg-white/8" />
                    <div className="absolute top-8 left-12 w-6 h-6 rounded-full bg-white/15" />

                    <div className="relative flex justify-center mb-4">
                      <motion.div
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 15,
                          delay: 0.25,
                        }}
                        className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center shadow-lg"
                      >
                        <UserPlus
                          className="w-10 h-10 text-white"
                          strokeWidth={2}
                        />
                      </motion.div>
                    </div>

                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="font-reddit-condensed text-white font-extrabold text-2xl text-center leading-tight"
                    >
                      Save Your Note
                      <br />
                      Permanently!
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.45 }}
                      className="text-white/80 text-base text-center mt-2 font-medium tracking-wide"
                    >
                      Create a free account in seconds
                    </motion.p>
                  </div>

                  <div className="px-6 pt-0 pb-6 space-y-5">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-3 mt-4"
                    >
                      {[
                        {
                          Icon: Database,
                          text: "Your note will be saved automatically",
                        },
                        {
                          Icon: BarChart3,
                          text: "Track all your expenses in one place",
                        },
                        { Icon: Bot, text: "Unlock AI-powered analysis tools" },
                        {
                          Icon: Smartphone,
                          text: "Access your data from any device",
                        },
                      ].map(({ Icon, text }, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Icon
                            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? "text-amber-400" : "text-amber-600"}`}
                          />
                          <span
                            className={`text-sm leading-snug ${isDark ? "text-gray-300" : "text-gray-600"}`}
                          >
                            {text}
                          </span>
                        </div>
                      ))}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Link to="/Account" className="block">
                        <Button
                          size="lg"
                          className="w-full py-7 text-lg font-extrabold bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-2xl"
                        >
                          <UserPlus className="w-5 h-5" />
                          Create Free Account
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // =====================
  // STEP: FILLING
  // =====================
  return (
    <div className="flex flex-col items-center py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`w-full max-w-xl rounded-2xl border-2 border-primary/30 shadow-2xl overflow-hidden ${
          isDark ? "bg-gray-800/90" : "bg-white/95"
        } backdrop-blur-sm`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-6 py-4 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3
                className={`font-reddit-condensed font-extrabold text-xl ${isDark ? "text-white" : "text-gray-800"}`}
              >
                Save Note
              </h3>
            </div>
            <button
              onClick={() => setStep("idle")}
              className={`p-1.5 rounded-full hover:bg-black/10 transition-colors ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <TextField
            isRequired
            validate={(value) => {
              if (value.trim() === "") return "Please enter a title!";
              if (value.length > 30) return "Title is too long!";
              return undefined;
            }}
          >
            <Label>Title</Label>
            <Input
              fullWidth
              placeholder="e.g., Grocery Shopping"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <FieldError className="text-sm text-danger" />
          </TextField>

          {/* ========== AI FEATURE ========== */}
          <div className="space-y-3">
            {!showAiInput ? (
              <button
                onClick={() => setShowAiInput(true)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed transition-all ${
                  isDark
                    ? "border-primary/40 hover:border-primary/70 bg-primary/5 hover:bg-primary/10"
                    : "border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10"
                }`}
              >
                <Wand2 className="w-4 h-4 text-primary" />
                <span
                  className={`text-sm font-medium ${isDark ? "text-primary/80" : "text-primary"}`}
                >
                  Generate with AI — tell us what you want to buy
                </span>
                <Sparkles className="w-4 h-4 text-secondary" />
              </button>
            ) : showAiProducts ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-[2px] rounded-xl bg-linear-to-r from-primary via-secondary to-primary"
              >
                <div
                  className={`rounded-xl p-4 ${isDark ? "bg-gray-800" : "bg-white"}`}
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      AI Suggested Products
                    </h4>
                    <Sparkles className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="space-y-2 mb-3">
                    {aiProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`flex items-center gap-3 p-2 rounded-lg ${isDark ? "bg-gray-700/60" : "bg-gray-50"} backdrop-blur-sm`}
                      >
                        <span className="text-sm">📦</span>
                        <span
                          className={`flex-1 font-medium text-sm ${isDark ? "text-white" : "text-gray-800"}`}
                        >
                          {product.productName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${isDark ? "bg-primary/20 text-primary/80" : "bg-primary/10 text-primary"}`}
                        >
                          x{product.quantity}
                        </span>
                        <span className="font-bold text-green-600 text-sm">
                          ${product.estPrice.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRejectAiProducts}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-colors ${
                        isDark
                          ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                          : "border-red-300 text-red-500 hover:bg-red-50"
                      }`}
                    >
                      ❌ Reject
                    </button>
                    <button
                      onClick={handleAcceptAiProducts}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-colors bg-gradient-to-r from-primary to-secondary hover:brightness-110"
                    >
                      ✅ Accept All
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <div className="flex gap-2">
                  <TextArea
                    placeholder='e.g., "3 apples, 2 loaves of bread for $3 each, milk"'
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    className="flex-1"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAiGenerate();
                      }
                    }}
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      className="shrink-0 text-white font-semibold bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
                      onPress={handleAiGenerate}
                      isDisabled={!aiInput.trim() || isAiThinking}
                    >
                      {isAiThinking ? (
                        <span className="animate-pulse">
                          AI thinking{aiDots}
                        </span>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Generate
                        </>
                      )}
                    </Button>
                    <Button
                      className="shrink-0 text-sm font-medium bg-gradient-to-r from-orange-400/80 to-amber-500/80 hover:from-orange-400 hover:to-amber-500 text-white transition-all"
                      size="sm"
                      onPress={() => setShowAiInput(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* ========== PRODUCTS WITH QTY & PRICE LABELS ========== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-reddit-condensed text-sm font-bold tracking-wide">
                Products
              </Label>
              <button
                onClick={addProduct}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add product
              </button>
            </div>

            {/* Column headers */}
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1">
              <span className="font-reddit-condensed flex-1">Name</span>
              <span className="font-reddit-condensed w-16 text-center">
                Qty
              </span>
              <span className="font-reddit-condensed w-24 text-center">
                Price
              </span>
              {products.length > 1 && <span className="w-8" />}
            </div>

            <AnimatePresence>
              {products.map((product, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2"
                >
                  <Input
                    placeholder="Product name"
                    className="flex-1 max-h-10"
                    value={product.name}
                    onChange={(e) =>
                      updateProduct(index, "name", e.target.value)
                    }
                  />
                  <Input
                    inputMode="numeric"
                    placeholder="1"
                    className="w-16 max-h-10"
                    value={product.quantity.toString()}
                    onChange={(e) =>
                      updateProduct(
                        index,
                        "quantity",
                        parseInt(e.target.value) || 1,
                      )
                    }
                  />
                  <Input
                    inputMode="decimal"
                    placeholder="0.00"
                    className="w-24 max-h-10"
                    value={product.estprice.toString()}
                    onChange={(e) =>
                      updateProduct(
                        index,
                        "estprice",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                  {products.length > 1 && (
                    <button
                      onClick={() => removeProduct(index)}
                      className={`p-1.5 rounded-full hover:bg-red-100 transition-colors ${isDark ? "text-gray-400 hover:text-red-400" : "text-gray-400 hover:text-red-500"}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Total */}
          <div
            className={`flex justify-between items-center px-4 py-3 rounded-lg ${isDark ? "bg-gray-700/50" : "bg-gray-100"}`}
          >
            <span
              className={`font-reddit-condensed font-semibold text-base ${isDark ? "text-gray-300" : "text-gray-600"}`}
            >
              Total Cost:
            </span>
            <span
              className={`font-reddit-condensed text-2xl font-extrabold ${isDark ? "text-green-400" : "text-green-600"}`}
            >
              $
              {totalCost.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Save button */}
          <Button
            className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-bold shadow-lg shadow-emerald-700/30 hover:shadow-emerald-600/40 transition-all"
            onPress={handleSave}
            isDisabled={!title.trim()}
          >
            <CheckCircle className="w-4 h-4" />
            Save Note
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default UnauthenticatedExpenses;
