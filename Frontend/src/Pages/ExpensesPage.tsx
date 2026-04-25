import {
  Button,
  Chip,
  DateField,
  DateInputGroup,
  Dropdown,
  FieldError,
  Header,
  Input,
  Kbd,
  Label,
  Separator,
  TextField,
  Alert,
  ScrollShadow,
  InputGroup,
  TextArea,
  Description,
  Card,
  Modal,
} from "@heroui/react";

import { useAuth } from "../Context/AuthContext";
import {
  BadgePlus,
  Ban,
  BookX,
  Calendar,
  Check,
  CheckCheck,
  CheckCircle,
  ChevronDown,
  Clock,
  ClockCheck,
  MessageCircleWarning,
  NotebookPen,
  PencilLine,
  Plus,
  SearchAlert,
  Sparkles,
  Trash,
  TriangleAlert,
  X,
  XCircleIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import useDarkMode from "../Components/Mode";
import ProductTable from "../Components/ProductTable";
import {
  getLocalTimeZone,
  now,
  parseAbsoluteToLocal,
  type DateValue,
} from "@internationalized/date";
import ImageUpload from "../Components/ImageUpload";
import ThemeList from "../Components/Themecards";
import CustomPagination from "../Components/Pagination";
import { useLoading } from "../Context/LoadingContext.tsx";
import { useThemes } from "../Context/ThemeContext.tsx";
import { useNotes } from "../Context/Notescontext.tsx";
import LoadingLogo from "../Components/LoadingLogo.tsx";
import AiChatSidebar from "../Components/AiChatSidebar.tsx";
import { motion } from "framer-motion";
import CreateUserCard from "../Components/CreateUserCard.tsx";
import PromptInput from "../Components/TextWriter.tsx";
import ShowTutorial from "../Components/ShowTutorial.tsx";

const Expenses = () => {
  // Interface for product rows in the table
  interface ProductRow {
    id: number;
    productName: string;
    quantity: number | string;
    estPrice: number | string | null;
  }
  interface Note {
    id: number;
    theme: string | null;
    productTitle: string;
    products: Array<{
      name: string;
      quantity: number | null;
      estprice: number | null;
    }>;
    completed: boolean;
    estcost: string;
    cost: string;
    estimatedTime: string | null;
    createdAt?: string;
    picture?: string | null;
    message?: string | null;
    color?: string;
  }

  const { isDark } = useDarkMode();
  const { user } = useAuth();
  const {
    hasInitiallyLoaded,
    setInitialLoadComplete,
    isanimationready,
    showLoading,
    hasshownlogo,
    setHasShownLogo,
  } = useLoading();

  const {
    themes,
    refreshThemes,
    updateTheme,
    refreshThemeStats,
    isloading: themesLoading,
  } = useThemes();

  const {
    isloading: notesLoading,
    notes,
    totalPages,
    page,
    setPage,
    setSortBy,
    addNote,
    updateNote,
    deleteNote,
    completeNote,
    refreshNotes,
  } = useNotes();

  const MAX_PRICE = 1000000;
  const [isnewtheme, setIsNewTheme] = useState<boolean>(false);
  const [addtheme, setAddTheme] = useState<string>("");
  const [selectedcolor, setSelectedColor] = useState<string | null>(null);
  const allcolors: string[] = [
    "#e82929",
    "#69d10e",
    "#0d25ad",
    "#dda808",
    "#c409c4",
  ];
  const [selectedtheme, setSelectedTheme] = useState<string | null>(null);
  const [dateerror, setDateError] = useState<string | null>(null);

  const [isdeletednotes, setIsDeletedNotes] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [draftnote, setDraftNote] = useState<Note | null>(null);
  const [editingnoteid, setEditingNoteId] = useState<number | null>(null);
  const [isvalidnote, setIsValidNote] = useState<string[]>([]);
  const [isimagemodalopen, setIsImageModalOpen] = useState<null | string>(null);
  const [isupdating, setIsUpdating] = useState<boolean>(false);
  const [finalcost, setFinalCost] = useState<string | null>(null);

  const [selecteddate, setSelectedDate] = useState<DateValue | null>(null);
  const [producttitle, setProductTitle] = useState<string | null>(null);
  const [cost, setCost] = useState<number>(0);
  const [sortnotes, setSortNotes] = useState<string>("Sort by");

  const [maxlimit, setMaxLimit] = useState<string | null>(null);

  const [missingtoast, setMissingToast] = useState<boolean>(false);

  const [rows, setRows] = useState<ProductRow[]>([
    { id: Date.now(), productName: "", quantity: 1, estPrice: null },
  ]);

  const [close, setClose] = useState<boolean>(false);
  const [activeview, setActiveView] = useState<"table" | "ai" | null>(null);
  const [hoveredNoteId, setHoveredNoteId] = useState<number | null>(null);

  const [aiLoading, setAiLoading] = useState<number | null>(null);
  const [isaisidebaropen, setISAiSidebarOpen] = useState<boolean>(false);
  const [activenoteforai, setActiveNoteForAi] = useState<Note | null>(null);
  const [aianalysis, setAiAnalysis] = useState<string>("");
  const [showtutorial, setShowTutorial] = useState(false);

  const [currentinput, setCurrentInput] = useState<string>("");
  const [dots, setDots] = useState(".");
  const [pricetoohigh, setPriceTooHigh] = useState<boolean>(false);

  const [aierror, setAiError] = useState<string | null>(null);
  const [isAiParsing, setIsAiParsing] = useState(false);

  const [aiProducts, setAiProducts] = useState<ProductRow[]>([]);
  const [showProductPreview, setShowProductPreview] = useState<boolean>(false);
  const [isPriceExtracting, setIsPriceExtracting] = useState<boolean>(false);
  const [priceextracdots, setPriceExtractDots] = useState(".");

  // Calculate total cost whenever rows change
  useEffect(() => {
    const total = rows.reduce((acc, row) => {
      const price = Number(row.estPrice) || 0;
      const quantity = Number(row.quantity) || 0;
      return acc + price * quantity;
    }, 0);
    setCost(total);
  }, [rows]);

  // Triggers loading animation on first app load
  // Prevents re-triggering if logo was already shown in this session
  useEffect(() => {
    if (!hasshownlogo) {
      showLoading();
    }
  }, [notesLoading, themesLoading, hasshownlogo]);

  useEffect(() => {
    if (missingtoast) {
      const timer = setTimeout(() => {
        setMissingToast(false);
      }, 2500);
      return () => clearInterval(timer);
    }
  }, [missingtoast]);

  useEffect(() => {
    if (isanimationready && !hasInitiallyLoaded) {
      const timer = setTimeout(() => {
        setInitialLoadComplete();
        setHasShownLogo(true);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [isanimationready, hasInitiallyLoaded, setInitialLoadComplete]);

  useEffect(() => {
    if (isvalidnote.length > 0) {
      const timer = setTimeout(() => {
        setIsValidNote([]);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isvalidnote]);

  useEffect(() => {
    if (!themesLoading && !notesLoading) {
      const hasSeenTutorial =
        localStorage.getItem("hasSeenTutorial") === "true";
      if (themes.length === 0 && notes.length === 0 && !hasSeenTutorial) {
        setShowTutorial(true);
      }
    }
  }, [themesLoading, notesLoading, themes, notes]);

  const handleCloseTutorial = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    setShowTutorial(false);
  };

  useEffect(() => {
    if (maxlimit) {
      const timer = setTimeout(() => {
        setMaxLimit(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [maxlimit]);

  useEffect(() => {
    if (pricetoohigh) {
      const timer = setTimeout(() => {
        setPriceTooHigh(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [pricetoohigh]);

  // Validate payload before submitting to backend
  // Checks if required fields are present and not empty
  const validatePayload = (payload: any) => {
    const missing: string[] = [];

    if (!payload.ProductTitle?.trim()) missing.push("title");
    if (!payload.ProductNames?.length) missing.push("products");
    if (!payload.Quantities?.length) missing.push("quantities");
    if (!payload.EstPrices?.length) missing.push("prices");

    if (missing.length > 0) {
      return false;
    }
    return true;
  };

  const handleAddNewProduct = () => {
    if (!draftnote) return;
    setDraftNote({
      ...draftnote,
      products: [
        ...draftnote.products,
        { name: "", quantity: null, estprice: null },
      ],
    });
  };
  const handleChangeProduct = (
    productindex: number,
    field: "name" | "quantity" | "estprice",
    value: string | number,
  ) => {
    if (!draftnote) return;
    setDraftNote({
      ...draftnote,
      products: draftnote.products.map((p, i) =>
        i === productindex ? { ...p, [field]: value } : p,
      ),
    });
  };
  const handleDeleteProduct = (productIndex: number) => {
    if (!draftnote) return;
    setDraftNote({
      ...draftnote,
      products: draftnote.products.filter((_, i) => i != productIndex),
    });
  };
  const handleChangeTitle = (newTitle: string) => {
    if (!draftnote) return;
    setDraftNote({ ...draftnote, productTitle: newTitle });
  };

  const handleChangeDate = (date: DateValue | null) => {
    if (!draftnote) return;
    if (!date) {
      setDraftNote({ ...draftnote, estimatedTime: null });
      return;
    }
    const jsDate = date.toDate(getLocalTimeZone());

    setDraftNote({
      ...draftnote,
      estimatedTime: jsDate.toISOString(),
    });
  };

  // Comprehensive validation for note updates before submitting to backend
  // Checks: title presence, future date constraint, product completeness, and non-negative values
  const validateDraftNote = (
    draft: Note | null,
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!draft) {
      return { valid: false, errors: ["No draft note"] };
    }
    if (!draft.productTitle.trim()) {
      errors.push("Title cannot be empty");
    }
    // Validate that estimated time is not in the past (notes are for future purchases)
    if (draft.estimatedTime && new Date(draft.estimatedTime) < new Date()) {
      errors.push("Date can't be less than todays time");
    }
    if (!draft.products || draft.products.length === 0) {
      errors.push("At least one product is required");
    } else {
      draft.products.forEach((product) => {
        if (!product.name?.trim()) {
          errors.push("Product Names cannot be empty");
        }
        if (product.quantity === null || product.quantity < 0) {
          errors.push("Product Quantities must be at least 0");
        }
        if (product.estprice === null || product.estprice < 0) {
          errors.push(`Product Prices must be at least 0`);
        }
      });
    }
    return { valid: errors.length === 0, errors };
  };

  // Updates an existing note with edited data from draft state
  // Recalculates total cost from products before sending to backend
  const handleUpdateNote = async () => {
    if (!draftnote) return;
    const { valid, errors } = validateDraftNote(draftnote);
    if (!valid) {
      setIsValidNote(errors);
      return;
    }
    // Recalculate estimated cost from all products (quantity × price)
    const newCost = draftnote.products.reduce((acc, p) => {
      return acc + (Number(p.estprice) || 0) * Number(p.quantity || 0);
    }, 0);
    const payload = {
      id: draftnote.id,
      theme: draftnote.theme,
      color: draftnote.color,
      productTitle: draftnote.productTitle,
      products: draftnote.products,
      estimatedTime: draftnote.estimatedTime,
      estcost: newCost.toString(),
    };
    const success = await updateNote(payload);
    if (success) {
      setIsUpdating(true);
      setDraftNote(null);
      setEditingNoteId(null);
      setTimeout(() => {
        setIsUpdating(false);
      }, 2000);
    }
  };

  // Collects data from rows, builds payload, validates and sends to backend
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = rows.filter((row) => row.productName.trim() !== "");
    const hasHighPrice = validRows.some(
      (row) => Number(row.estPrice) > MAX_PRICE,
    );
    if (hasHighPrice) {
      setPriceTooHigh(true);
      return;
    }

    const productnames = validRows.map((row) => row.productName);
    const quantities = validRows.map((row) => Number(row.quantity) || 0);
    const estprices = validRows.map((row) => Number(row.estPrice) || 0);
    const selectedthemeobj = themes.find((t) => t.name === selectedtheme);
    const themecolor = selectedthemeobj?.color || "#b7b7b7";

    const payload = {
      Theme: selectedtheme || null,
      Color: themecolor,
      ProductTitle: producttitle,
      ProductNames: productnames,
      Quantities: quantities,
      EstPrices: estprices,
      Cost: cost,
      Date: selecteddate,
    };

    if (!validatePayload(payload)) {
      setMissingToast(true);
      return;
    }
    const newNote = await addNote(payload);
    if (newNote) {
      refreshThemeStats();
      setClose(true);
      resetAiStates();
      setSelectedTheme(null);
      setSelectedDate(null);
      setProductTitle(null);
      setRows([
        { id: Date.now(), productName: "", quantity: 1, estPrice: null },
      ]);
    }
  };

  // Handle adding a new theme to the backend
  const handleAddtheme = async (e: React.FormEvent, themes: string) => {
    e.preventDefault();
    if (themes?.trim()) {
      try {
        const response = await api.post("/newtheme", {
          themes: themes,
          color: selectedcolor,
        });
        if (response.data.success) {
          let newthemes = response.data.allthemes;
          updateTheme(newthemes);
        }
      } catch (error: any) {
        if (error.response?.data?.islimitReached) {
          setMaxLimit(error.response.data.message);
        }
      } finally {
        setIsNewTheme(false);
        setAddTheme("");
        setSelectedColor(null);
      }
    }
  };

  const handleDelete = async (id: number) => {
    const success = await deleteNote(id);
    if (success) {
      setIsDeletedNotes(true);
      setTimeout(() => {
        setIsDeletedNotes(false);
      }, 2500);
    }
  };

  const handleThemeDeletedWithNotes = () => {
    refreshThemes();
    refreshNotes();
  };

  // Marks a note as completed with optional picture, message, and actual final cost
  // First updates the note details, then calls completeNote to mark it done
  const handleaddCompleted = async (id: number) => {
    if (!draftnote) return;

    await updateNote({
      id: draftnote.id,
      theme: draftnote.theme,
      productTitle: draftnote.productTitle,
      products: draftnote.products,
      estimatedTime: draftnote.estimatedTime,
      estcost: draftnote.estcost,
      picture: draftnote.picture || null,
      message: draftnote.message || null,
      cost: finalcost || null,
    });

    const success = await completeNote(id, {
      picture: draftnote.picture,
      message: draftnote.message,
      cost: finalcost,
    });

    if (success) {
      setDraftNote(null);
      setEditingNoteId(null);
      setIsCompleted(false);
      setFinalCost(null);
    }
  };
  // Changes note sorting criteria and resets to first page
  // Updates both local UI state and global notes context
  const handleSort = (sortType: string) => {
    setSortNotes(sortType);
    setSortBy(sortType);
    setPage(1);
  };

  // AI Receipt Analysis function
  const handleAIAnalyze = async (note: Note) => {
    if (!note.picture) return;

    setActiveNoteForAi(note);
    setISAiSidebarOpen(true);
    setAiLoading(note.id);
    try {
      const response = await api.post(
        "/analyze-receipt",
        {
          imageBase64: note.picture,
          noteId: note.id,
        },
        {
          timeout: 30000,
        },
      );
      if (response.data.success) {
        setAiAnalysis(response.data.analysis);
      }
    } catch (error) {
      console.error("AI Analysis Error:", error);
    } finally {
      setAiLoading(null);
    }
  };

  const handleAiParse = async () => {
    if (!currentinput.trim()) return;
    setIsAiParsing(true);
    try {
      const response = await api.post(
        "/parse-products",
        {
          text: currentinput,
        },
        { timeout: 30000 },
      );
      if (response.data.success) {
        // console.log(response.data);
        const parsedProducts = response.data.products
          .filter(
            (p: any) =>
              p.name &&
              p.name.trim() !== "" &&
              p.quantity !== null &&
              p.quantity !== undefined &&
              p.estprice !== null &&
              p.estprice !== undefined,
          )
          .map((p: any, i: number) => ({
            id: Date.now() + i,
            productName: p.name,
            quantity: p.quantity || 1,
            estPrice: p.estprice || 0,
          }));
        setAiProducts(parsedProducts);
        setShowProductPreview(true);
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        setAiError("Daily limit reached, Please try again later!");
      } else {
        setAiError("Error occurred, please try again with different prompts");
      }
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleRejectProducts = () => {
    resetAiStates();
  };
  const handleAcceptProducts = () => {
    const currentRows = rows.filter((r) => r.productName.trim() !== "");
    if (currentRows.length === 0) {
      setRows(aiProducts.map((p, i) => ({ ...p, id: Date.now() + i })));
    } else {
      setRows([
        ...aiProducts.map((p, i) => ({ ...p, id: Date.now() + i })),
        ...currentRows,
      ]);
    }
    resetAiStates();
  };
  useEffect(() => {
    if (isPriceExtracting) {
      const interval = setInterval(() => {
        setPriceExtractDots((prev) => (prev.length >= 3 ? "." : prev + "."));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setPriceExtractDots(".");
    }
  }, [isPriceExtracting]);

  useEffect(() => {
    if (isAiParsing) {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setDots(".");
    }
  }, [isAiParsing]);

  const resetAiStates = () => {
    setAiProducts([]);
    setShowProductPreview(false);
    setCurrentInput("");
    setIsAiParsing(false);
    setAiError(null);
  };

  if (!hasInitiallyLoaded) {
    return (
      <div>
        <LoadingLogo />
      </div>
    );
  }

  return (
    <div>
      {/* ==========================================
          NOTES GRID - Main container for all notes
          ========================================== */}

      {notes && notes.length > 0 ? (
        <div className="border-b-2 border-secondary">
          <div className="mt-5 ml-5 flex flex-col sm:flex-row  sm:items-center ">
            <div className="sm:mr-5 py-5 sm:py-auto">
              <Dropdown>
                <Dropdown.Trigger>
                  <button
                    className={`rounded-full border-2 p-0 overflow-hidden flex items-stretch ${isDark ? "border-white" : "border-black"}`}
                  >
                    <div className="flex items-center gap-2 bg-secondary px-3 py-1 text-white">
                      <ChevronDown />
                    </div>
                    <div
                      className={`w-[2px] self-stretch ${isDark ? "bg-white" : "bg-black"}`}
                    />

                    <div
                      className={`flex items-center px-2 py-1 font-medium ${isDark ? "bg-black text-white" : "bg-white text-black"}`}
                    >
                      {sortnotes}
                    </div>
                  </button>
                </Dropdown.Trigger>
                <Dropdown.Popover>
                  <Dropdown.Menu>
                    <Dropdown.Section>
                      <Header>SORT BY</Header>
                      <Dropdown.Item
                        onClick={() => {
                          handleSort("Created");
                        }}
                      >
                        Created date
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          handleSort("Available");
                        }}
                      >
                        Available Notes
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          handleSort("Completed");
                        }}
                      >
                        Completed Notes
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          handleSort("Upcoming");
                        }}
                      >
                        Upcoming Notes
                      </Dropdown.Item>
                    </Dropdown.Section>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>
            <div>
              <Dropdown>
                <Button variant="secondary">ADD NEW NOTE</Button>
                <Dropdown.Popover className="min-w-[200px]">
                  <Dropdown.Menu>
                    <Dropdown.Section>
                      <Header> No themes</Header>
                      <Dropdown.Item>
                        <div
                          className="cursor-pointer flex justify-between items-center w-full"
                          onClick={() => {
                            setSelectedTheme("No theme ");
                            setClose(true);
                            resetAiStates();
                          }}
                        >
                          <Label className="text-gray-400">
                            No theme Selected
                          </Label>
                        </div>
                      </Dropdown.Item>
                      <Separator />
                      <Header>Themes</Header>
                      {themes &&
                        themes.length > 0 &&
                        themes.map((theme, index) => (
                          <Dropdown.Item key={index}>
                            <div
                              className="cursor-pointer flex justify-between items-center w-full"
                              onClick={() => {
                                setSelectedTheme(theme.name);
                                setClose(true);
                                resetAiStates();
                              }}
                            >
                              <Label>{theme.name}</Label>
                              <Kbd>
                                <Kbd.Content>Theme</Kbd.Content>
                              </Kbd>
                            </div>
                          </Dropdown.Item>
                        ))}
                    </Dropdown.Section>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>
          </div>
          <div
            className=" grid grid-cols-[repeat(auto-fit,minmax(200px,2fr))]
                     lg:grid-cols-3 gap-4 gap-y-14 w-full p-8 items-stretch auto-rows-fr"
          >
            {/* ==========================================
                  ACTIVE NOTE (not completed)
                  ========================================== */}

            {notes.map((note) => (
              <div
                key={note.id}
                className="relative w-full mx-auto h-[450px] note-animate-fade"
              >
                {!note.completed ? (
                  <div className="h-full flex flex-col">
                    <div
                      className="relative w-full h-[65px] overflow-hidden rounded-2xl 
                shadow-[0_12px_30px_-18px_rgba(0,0,0,0.55)]"
                    >
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/55 via-blue-400/20 to-transparent"
                        style={{
                          clipPath: "polygon(0 0, 70% 0, 56% 100%, 0 100%)",
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/10 ..." />
                      <div
                        className="absolute inset-y-0 left-0 w-[62%] opacity-70"
                        style={{
                          clipPath: "polygon(69% 0, 71% 0, 57% 100%, 55% 100%)",
                          background:
                            "linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0.08))",
                        }}
                      />{" "}
                      <div
                        className="absolute inset-y-0 left-0 w-[72%] opacity-70"
                        style={{
                          clipPath: "polygon(69% 0, 71% 0, 57% 100%, 55% 100%)",
                          background:
                            "linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0.08))",
                        }}
                      />
                      <div className="relative z-10 flex items-center justify-between h-full px-4">
                        {editingnoteid !== note.id ? (
                          <div className="flex items-center gap-2 h-9 rounded-xl px-3 bg-blue-500 shadow-[...]">
                            <PencilLine size={16} />
                            <span className="text-sm font-semibold tracking-wide">
                              ACTIVE
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 h-9 rounded-xl px-3 bg-amber-500  shadow-[...]">
                            <PencilLine size={16} />
                            <span className="text-sm font-semibold tracking-wide">
                              EDITING
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {editingnoteid !== note.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleDelete(note.id)}
                                className="cursor-pointer inline-flex items-center justify-center h-7 w-7 rounded-lg
                                 bg-red-500/10 text-red-700 dark:text-red-300
                                 hover:bg-red-500/20 active:bg-red-500/30
                                 ring-1 ring-red-500/20 transition
                                "
                              >
                                <Trash size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNoteId(note.id);
                                  setDraftNote({ ...note });
                                  setIsCompleted(true);
                                }}
                                className="cursor-pointer inline-flex items-center justify-center h-8 w-8 rounded-lg 
                                bg-emerald-500/10 text-emerald-700 dark:text-emerald-300
                             hover:bg-emerald-500/20 active:bg-emerald-500/30
                              ring-1 ring-emerald-500/20 transition"
                                title="Mark /Start editing"
                              >
                                <Check size={16} />
                              </button>
                            </>
                          ) : (
                            hasInitiallyLoaded && (
                              <>
                                <button
                                  type="button"
                                  onClick={handleUpdateNote}
                                  className="cursor-pointer inline-flex items-center gap-1.5 h-8 rounded-lg px-2.5
                                   bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 transition
                                  "
                                  title="Update"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <span
                                  className="cursor-pointer inline-flex items-center gap-1.5 h-8 rounded-lg px-2.5
                               bg-amber-500/15 text-amber-700 dark:text-amber-300
                                ring-1 ring-amber-500/20 "
                                  title="Editing mode"
                                >
                                  <PencilLine size={16} />
                                </span>
                              </>
                            )
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (editingnoteid === note.id) {
                                setEditingNoteId(null);
                                setDraftNote(null);
                              } else {
                                setEditingNoteId(note.id);
                                setDraftNote({ ...note });
                              }
                            }}
                            className={`cursor-pointer inline-flex items-center justify-center h-8 w-8 rounded-lg ring-1 transition
                                ${editingnoteid === note.id ? "bg-red-500/10 text-red-700 dark:text-red-300 ring-red-500/20 hover:bg-red-500/20" : "bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-blue-500/20 hover:bg-blue-500/20"}`}
                            title={
                              editingnoteid === note.id
                                ? "Cancel editing"
                                : "Edit"
                            }
                          >
                            {editingnoteid === note.id ? (
                              <X size={16} />
                            ) : (
                              <PencilLine size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ==========================================
                      MAIN CONTENT - Title, Date, Theme, Cost
                      ========================================== */}
                    <div className="relative w-full mx-auto flex flex-col note-animate-fade">
                      <Card
                        className={`mt-1 relative overflow-hidden h-[387px]  border-2 shadow-soft before:absolute before:left-0 before:top-0 
                        before:bottom-0 before:w-1 before:bg-linear-to-b before:from-primary before:to-secondary`}
                      >
                        <Card.Header className="flex items-star justify-between gap-3 pb-2">
                          <div className="flex-1 min-w-0">
                            {editingnoteid !== note.id ? (
                              <Card.Title className="truncate font-semibold text-warm-dark dark:text-warm-light">
                                {note.productTitle}
                              </Card.Title>
                            ) : (
                              <Input
                                value={draftnote?.productTitle}
                                onChange={(e) =>
                                  handleChangeTitle(e.target.value)
                                }
                              />
                            )}
                            <Card.Description className="flex items-center gap-1 mt-1 text-xs text-warm-brown/70 dark:text-warm-light/50">
                              <div className="flex flex-col justify-center ">
                                <div className="flex items-center gap-2">
                                  <Calendar
                                    size={12}
                                    className="text-warm-brown/70 dark:text-warm-light/50 shrink-0"
                                  />

                                  {editingnoteid !== note.id ? (
                                    <span className="text-xs text-warm-brown/70 dark:text-warm-light/50">
                                      {note.estimatedTime
                                        ? new Date(
                                            note.estimatedTime,
                                          ).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                          })
                                        : "No date"}
                                    </span>
                                  ) : (
                                    <DateField
                                      aria-label="Estimated time"
                                      className="w-52"
                                      granularity="minute"
                                      value={
                                        draftnote?.estimatedTime
                                          ? parseAbsoluteToLocal(
                                              draftnote?.estimatedTime,
                                            )
                                          : null
                                      }
                                      onChange={(date) =>
                                        handleChangeDate(date)
                                      }
                                      minValue={now(getLocalTimeZone())}
                                    >
                                      <DateInputGroup className="text-xs">
                                        <DateInputGroup.Input>
                                          {(segment) => (
                                            <DateInputGroup.Segment
                                              segment={segment}
                                            />
                                          )}
                                        </DateInputGroup.Input>
                                      </DateInputGroup>
                                    </DateField>
                                  )}
                                </div>
                                {editingnoteid !== note.id && (
                                  <div className="flex items-center gap-2 ">
                                    <Clock
                                      size={12}
                                      className="text-warm-brown/50 dark:text-warm-light/40 shrink-0"
                                    />

                                    <span className="text-xs text-warm-brown/50 dark:text-warm-light/40">
                                      {note.estimatedTime
                                        ? new Date(
                                            note.estimatedTime,
                                          ).toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : "No time"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </Card.Description>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {editingnoteid !== note.id ? (
                              <Chip
                                size="lg"
                                variant="soft"
                                style={{
                                  backgroundColor: themes.find(
                                    (t) => t.name === note.theme,
                                  )?.color
                                    ? `${themes.find((t) => t.name === note.theme)?.color}30`
                                    : "bg-warm-brown/10",
                                }}
                              >
                                {note.theme || "No theme"}
                              </Chip>
                            ) : (
                              <Dropdown>
                                <Button size="sm">
                                  {draftnote?.theme || "Select"}
                                </Button>
                                <Dropdown.Popover>
                                  <Dropdown.Menu>
                                    {themes?.map((t, i) => (
                                      <Dropdown.Item
                                        key={i}
                                        onClick={() =>
                                          setDraftNote({
                                            ...draftnote!,
                                            theme: t.name,
                                            color: t.color,
                                          })
                                        }
                                      >
                                        <div className="flex justify-between items-center w-full">
                                          <span>{t.name}</span>
                                          <Kbd className="ml-2">Theme</Kbd>
                                        </div>
                                      </Dropdown.Item>
                                    ))}
                                  </Dropdown.Menu>
                                </Dropdown.Popover>
                              </Dropdown>
                            )}
                            <span
                              className="ml-auto w-fit justify-self-end inline-flex items-center rounded-md px-2 py-1
                             bg-emerald-500/10 text-emerald-700 dark:text-emerald-300
                                ring-1 ring-emerald-500/20 font-mono font-semibold tabular-nums"
                            >
                              ${Number(note.estcost || 0)}
                            </span>
                          </div>
                        </Card.Header>
                        <Card.Content className="px-0 pb-2">
                          <div className="mx-4 rounded-lg overflow-hidden border border-warm-tan/20 dark:border-warm-border/30">
                            <div
                              className="grid grid-cols-[1fr_72px_110px] gap-2 px-3 py-2
                                    text-[11px] font-semibold uppercase tracking-wider
                                      bg-warm-brown/10 dark:bg-warm-light/5
                                        text-warm-brown/80 dark:text-warm-light/60
                                        border-b border-warm-tan/20 sticky top-0 z-10"
                            >
                              <span className="Ubuntu">Name</span>
                              <span className="text-center Ubuntu">Qty</span>
                              <span className="text-right Ubuntu">Price</span>
                            </div>
                          </div>
                          <ScrollShadow className="max-h-[160px] overflow-y-auto">
                            {(editingnoteid === note.id
                              ? draftnote?.products
                              : note.products
                            )?.map((product, i) => (
                              <div
                                key={i}
                                className={`grid grid-cols-[1fr_72px_110px] gap-2 px-3 py-2.5 text-sm
                                border-t border-warm-tan/10
                                ${i % 2 === 0 ? "bg-transparent" : "bg-warm-brown/3 dark:bg-warm-light/3"}
                                hover:bg-warm-brown/6 dark:hover:bg-warm-light/6 transition-colors`}
                              >
                                {editingnoteid !== note.id ? (
                                  <>
                                    <span className="truncate font-medium text-warm-dark dark:text-warm-light">
                                      {product.name}
                                    </span>
                                    <span
                                      className="text-center text-warm-brown/70 dark:text-warm-light/60 
                           font-mono"
                                    >
                                      {product.quantity}
                                    </span>
                                    <span
                                      className="text-right font-bold text-emerald-600 dark:text-emerald-400 
                           font-mono tabular-nums"
                                    >
                                      ${Number(product.estprice).toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Input
                                      variant="secondary"
                                      value={draftnote?.products[i].name || ""}
                                      onChange={(e) =>
                                        handleChangeProduct(
                                          i,
                                          "name",
                                          e.target.value,
                                        )
                                      }
                                    />
                                    <Input
                                      type="number"
                                      variant="secondary"
                                      value={
                                        draftnote?.products[i].quantity || ""
                                      }
                                      onChange={(e) =>
                                        handleChangeProduct(
                                          i,
                                          "quantity",
                                          parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />

                                    <Input
                                      type="number"
                                      variant="secondary"
                                      value={
                                        draftnote?.products[i].estprice || ""
                                      }
                                      onChange={(e) =>
                                        handleChangeProduct(
                                          i,
                                          "estprice",
                                          parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />
                                  </>
                                )}
                              </div>
                            ))}
                          </ScrollShadow>
                          {editingnoteid === note.id && (
                            <div className="sticky bottom-0 p-2 border-t border-warm-tan/20 flex justify-center">
                              <Button size="sm" onClick={handleAddNewProduct}>
                                <Plus size={12} />
                                Add
                              </Button>
                            </div>
                          )}
                        </Card.Content>
                        <Card.Footer className="flex justify-end pt-2">
                          <Chip
                            size="sm"
                            className="text-warm-brown/50 dark:text-warm-light/40 text-xs"
                          >
                            {note.createdAt?.split("T")[0]}
                          </Chip>
                        </Card.Footer>
                      </Card>
                    </div>
                  </div>
                ) : (
                  /* ==========================================
                    COMPLETED NOTE (simplified view)
                    ========================================== */
                  <div
                    className="h-full flex flex-col opacity-70 relative"
                    onMouseEnter={() => setHoveredNoteId(note.id)}
                    onMouseLeave={() => setHoveredNoteId(null)}
                  >
                    {/* AI Analyze Button - Only show on hover when there's a picture */}
                    {hoveredNoteId === note.id && (
                      <button
                        onClick={() => handleAIAnalyze(note)}
                        disabled={aiLoading === note.id || isaisidebaropen}
                        className="absolute top-2 right-2 z-30 bg-gradient-to-r from-primary/80 to-secondary/80 hover:from-primary hover:to-secondary text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border-2 border-white/20"
                      >
                        {aiLoading === note.id ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Analyzing...
                          </>
                        ) : (
                          <Sparkles />
                        )}
                      </button>
                    )}
                    <div className="relative w-full h-[65px] overflow-hidden rounded-2xl shadow-[0_12px_30px_-18px_rgba(0,0,0,0.55)]">
                      <div
                        className={`absolute inset-0 ${isDark ? "bg-gray-800/60" : "bg-gray-200/70"}`}
                      >
                        <div
                          className="absolute inset-y-0 left-0 w-[100%] h-full bg-linear-to-r from-emerald-500 via-emerald-400/40 to-transparent"
                          style={{
                            clipPath: "polygon(0 0, 70% 0, 56% 92%, 0 92%)",
                          }}
                        />
                        <div
                          className="absolute inset-y-0 left-0 w-[62%] sm:w-[52%] opacity-70 z-20"
                          style={{
                            clipPath:
                              "polygon(69% 0, 71% 0, 57% 100%, 55% 100%)",
                            background:
                              "linear-gradient(to bottom, rgba(68, 59, 59,0.95), rgba(255,255,255,0.08))",
                          }}
                        />
                        <div
                          className="absolute inset-y-0 left-0 w-[72%] sm:w-[62%] opacity-70 z-20"
                          style={{
                            clipPath:
                              "polygon(69% 0, 71% 0, 57% 100%, 55% 100%)",
                            background:
                              "linear-gradient(to bottom, rgba(68, 59, 59,0.95), rgba(255,255,255,0.08))",
                          }}
                        />
                        <div className="absolute inset-0 bg-linear-to-b from-white/10 to-black/10 dark:from-white/5 dark:to-black/25" />
                        <div className="relative z-10 p-2">
                          <div
                            className="flex items-center gap-2 rounded-xl  
                             backdrop-blur-md px-2 py-1.5  bg-warm-white/70 dark:bg-warm-dark/45"
                          >
                            <div className="flex gap-2 h-9 rounded-xl px-3 bg-emerald-600  shadow-[0_10px_22px_-16px_rgba(16,185,129,0.9)]">
                              <span className="text-sm font-bold  tracking-wide flex justify-center items-center">
                                <Check size={16} /> COMPLETED
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Card
                      className={`mt-1 relative flex flex-col border-2 rounded-lg h-[407px]  p-4 grow overflow-y-auto ${isDark ? "bg-gray-800 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                    >
                      <Card.Header className="flex items-start gap-2 mb-3">
                        {" "}
                        <div className="flex gap-2">
                          <ClockCheck
                            size={14}
                            className={
                              isDark ? "text-gray-400" : "text-gray-500"
                            }
                          />
                          <span
                            className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                          >
                            {note.createdAt.split("T")[0]}
                          </span>
                        </div>
                      </Card.Header>
                      <Card.Content className="">
                        <h3
                          className={`Ubuntu text-lg font-medium line-through opacity-60 mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {note.productTitle}
                        </h3>
                        <div className="flex justify-between items-center mb-4">
                          <span
                            className={`text-xs px-2 py-1 rounded ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}
                          >
                            {note?.theme || "No theme"}
                          </span>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-baseline gap-1">
                              {note.cost ? (
                                <>
                                  <span
                                    className={`text-3xl font-bold ${isDark ? "text-green-400" : "text-green-600"}`}
                                  >
                                    {new Intl.NumberFormat("en-US", {
                                      style: "currency",
                                      currency: "USD",
                                    }).format(Number(note.cost))}
                                  </span>
                                  <span className="text-xs text-gray-500 font-medium">
                                    final cost
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm text-gray-400 italic">
                                  No cost added
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                Estimated:
                              </span>
                              <span
                                className={`text-sm font-medium line-through ${isDark ? "text-gray-400" : "text-gray-600"}`}
                              >
                                ${note.estcost}
                              </span>
                              {note.cost && (
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                                    Number(note.cost) <= Number(note.estcost)
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {Number(note.cost) <= Number(note.estcost)
                                    ? "✓ Under"
                                    : "↑ Over"}{" "}
                                  budget
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`h-px w-full mb-4 ${isDark ? "bg-gray-600" : "bg-gray-300"}`}
                        />
                        <p
                          className={`text-xs uppercase tracking-wider mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                        >
                          {note.products.length} product
                          {note.products.length !== 1 ? "s" : ""}
                        </p>
                        <div
                          className={`rounded-lg p-2 max-h-[200px] overflow-y-auto scrollbar-thin ${
                            isDark
                              ? "bg-gray-700/50 scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                              : "bg-gray-100 scrollbar-thumb-gray-300 scrollbar-track-gray-200"
                          }`}
                        >
                          {note.products.map((product, i) => (
                            <div
                              key={i}
                              className="flex justify-between text-xs py-1"
                            >
                              <span
                                className={`truncate max-w-[60%] ${isDark ? "text-gray-300" : "text-gray-600"}`}
                              >
                                {product.name}
                              </span>
                              <span
                                className={
                                  isDark ? "text-gray-400" : "text-gray-500"
                                }
                              >
                                x{product.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                        {note.message && (
                          <div className="py-3 flex flex-col gap-2">
                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Your message
                            </Label>
                            <TextArea
                              aria-label="message"
                              rows={3}
                              value={note.message}
                              readOnly
                              className="text-sm rounded-lg"
                            />
                          </div>
                        )}
                        {note.picture && (
                          <div className="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                            <img
                              onClick={() =>
                                setIsImageModalOpen(note?.picture || null)
                              }
                              src={note?.picture}
                              alt="Product Image"
                              className="w-full h-full max-h-64 object-cover"
                            />
                          </div>
                        )}
                      </Card.Content>
                      <Card.Footer
                        className={`mt-auto pt-3 flex items-center gap-2 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        <ClockCheck size={12} />
                        <span>
                          {note.estimatedTime
                            ? `Due: ${note.estimatedTime.split("T")[0]}`
                            : "No date added"}
                        </span>
                      </Card.Footer>
                    </Card>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="py-5 flex justify-center">
            <CustomPagination
              pageCount={totalPages}
              currentPage={page}
              onPageChange={setPage}
            />
          </div>
        </div>
      ) : showtutorial && user ? (
        <ShowTutorial isopen={showtutorial} onClose={handleCloseTutorial} />
      ) : (
        <>
          <div className="ml-5 mt-5">
            <Dropdown>
              <Button variant="secondary">Add new note</Button>
              <Dropdown.Popover className="min-w-[200px]">
                <Dropdown.Menu>
                  <Dropdown.Section>
                    <Header> No themes</Header>
                    <Dropdown.Item>
                      <div
                        className="cursor-pointer flex justify-between items-center w-full"
                        onClick={() => {
                          setSelectedTheme("No theme ");
                          setClose(true);
                        }}
                      >
                        <Label className="text-gray-400">
                          No theme Selected
                        </Label>
                      </div>
                    </Dropdown.Item>
                    <Separator />
                    <Header>Themes</Header>
                    {themes &&
                      themes.length > 0 &&
                      themes.map((theme, index) => (
                        <Dropdown.Item key={index}>
                          <div
                            className="cursor-pointer flex justify-between items-center w-full"
                            onClick={() => {
                              setSelectedTheme(theme.name);
                              setClose(true);
                            }}
                          >
                            <Label>{theme.name}</Label>
                            <Kbd>
                              <Kbd.Content>Theme</Kbd.Content>
                            </Kbd>
                          </div>
                        </Dropdown.Item>
                      ))}
                  </Dropdown.Section>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center min-h-[250px] border-b-2 border-secondary gap-6 px-4">
            {/* If no notes is added */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0">
              <div className="bg-secondary rounded-full w-full h-full flex items-center justify-center p-4">
                <NotebookPen className="text-primary w-full h-full" />
              </div>

              <Ban className="absolute inset-[-10%] w-[120%] h-[120%] text-red-500 drop-shadow-xl" />
            </div>

            <h3 className="Oswald tracking-wider text-xl md:text-2xl lg:text-4xl xl:text-5xl text-gray-500">
              No notes added
            </h3>
          </div>
        </>
      )}
      {/* Add new theme */}
      {user ? (
        <div>
          <div className="py-10 flex justify-center items-center">
            <h3
              className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-wider Ubuntu "
              style={{ textShadow: "0 4px 8px rgba(0,0,0,1)" }}
            >
              THEMES
            </h3>
          </div>
          <div className="relative inline-block w-full">
            <Button onClick={() => setIsNewTheme(true)} variant="ghost">
              <BadgePlus /> ADD NEW THEME
            </Button>
            {isnewtheme && (
              <>
                <div
                  className="fixed inset-0 bg-black/50 z-40"
                  onClick={() => {
                    setIsNewTheme(false);
                    setAddTheme("");
                    setSelectedColor(null);
                  }}
                />

                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[400px] max-w-[90vw]">
                  <Card variant="default" className="shadow-xl">
                    <Card.Header>
                      <div className="flex justify-between items-center">
                        <span>Add new theme</span>
                        <div
                          onClick={() => {
                            setIsNewTheme(false);
                            setAddTheme("");
                            setSelectedColor(null);
                          }}
                          className="cursor-pointer"
                        >
                          <XCircleIcon className="text-red-700" />
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Content>
                      <div className="flex flex-col">
                        <div className="relative max-w-sm">
                          <TextField
                            isRequired
                            aria-label="name"
                            validationBehavior="aria"
                            validate={(value) => {
                              if (!value.trim()) {
                                return "Theme name is required";
                              }
                              return undefined;
                            }}
                          >
                            <Input
                              aria-label="Name"
                              className="pr-10 w-full"
                              placeholder="Enter the new theme..."
                              value={addtheme}
                              onChange={(e) => setAddTheme(e.target.value)}
                            />
                            <FieldError className="text-sm text-danger" />
                          </TextField>

                          <div className="mt-4">
                            <Label>Select a Color</Label>
                            <div className="flex justify-evenly">
                              {allcolors.map((color, i) => (
                                <div
                                  key={i}
                                  className="mt-2 relative cursor-pointer rounded-full border-black w-6 h-6"
                                  style={{ backgroundColor: color }}
                                  onClick={() => setSelectedColor(color)}
                                >
                                  {selectedcolor === color && (
                                    <div
                                      className={`absolute -right-1 -top-1 w-4 h-4 bg-green-700 rounded-full ${isDark ? "text-white" : "text-black"}`}
                                    >
                                      <Check className="w-4 h-4" />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-end mt-5">
                            <Button
                              variant="secondary"
                              onClick={(e) => handleAddtheme(e, addtheme)}
                            >
                              <Plus />
                              Add theme
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>
                </div>
              </>
            )}

            {hasInitiallyLoaded && themes?.length > 0 && (
              <div className="my-5 ">
                <ThemeList onThemeDeleted={handleThemeDeletedWithNotes} />
              </div>
            )}

            {selectedtheme != null && close && (
              <form onSubmit={(e) => handleAddNote(e)}>
                <div className=" fixed flex items-center justify-center bg-black/50 inset-0 z-50 w-full border-2 ">
                  <div
                    className={`w-[80%] overflow-y-auto h-[80%] border-2 ${isDark ? "bg-black" : "bg-white"} p-6 shadow-xl`}
                  >
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:gap-10">
                      <div className="flex-1">
                        <TextField
                          isRequired
                          name="name"
                          validate={(value) => {
                            if (value.trim() === "") {
                              return "Please enter a title!";
                            }
                            if (value.length > 30) {
                              return "The title is too long!";
                            }
                            return undefined;
                          }}
                        >
                          <Label>Title</Label>
                          <Input
                            fullWidth
                            placeholder="Title"
                            value={producttitle || ""}
                            onChange={(e) => setProductTitle(e.target.value)}
                          />
                          <FieldError className="text-sm text-danger" />
                        </TextField>
                      </div>
                      <div className="justify-between  my-3 sm:my-auto flex shrink-0 gap-3">
                        <div className="flex-[.3]">
                          <Chip
                            color="accent"
                            variant="soft"
                            className="cursor-pointer"
                          >
                            {selectedtheme}
                          </Chip>
                        </div>
                        <div
                          onClick={() => (
                            setSelectedTheme(null),
                            setClose(true),
                            resetAiStates()
                          )}
                        >
                          <BookX
                            className={`${isDark ? " text-white" : "text-black"} cursor-pointer`}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 my-5">
                      <Button
                        variant={activeview ? "tertiary" : "outline"}
                        onClick={() =>
                          setActiveView(activeview === "table" ? null : "table")
                        }
                      >
                        {activeview === "table" ? "Hide Table" : "View Table"}
                      </Button>
                      <Button
                        className="text-gradient-primary"
                        onClick={() =>
                          setActiveView(activeview === "ai" ? null : "ai")
                        }
                      >
                        <Sparkles />
                        Generate with FloWealth AI
                      </Button>
                    </div>
                    {activeview === "table" && (
                      <ProductTable rows={rows} setRows={setRows} />
                    )}
                    <div className="flex flex-col ">
                      {activeview === "ai" && (
                        <Modal>
                          <div className="relative">
                            <PromptInput
                              currentinput={currentinput}
                              setCurrentinput={setCurrentInput}
                            />
                          </div>
                          <div className="flex justify-end p-4">
                            <Button
                              onClick={handleAiParse}
                              isDisabled={!currentinput.trim()}
                              className={`${
                                isAiParsing
                                  ? "bg-gradient-to-r from-secondary to-primary animate-pulse"
                                  : "bg-primary hover:bg-primary/80"
                              }text-white font-bold py-3 px-6 rounded-full shadow-lg 
              transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {isAiParsing ? (
                                `Generating${dots}`
                              ) : (
                                <>
                                  Generate
                                  <Sparkles></Sparkles>
                                </>
                              )}
                            </Button>
                          </div>
                          {aierror && !isAiParsing && (
                            <Card className="w-full md:max-w-[80%] mx-auto border border-red-600">
                              <Card.Content className="flex flex-col items-center text-center p-6">
                                <XCircleIcon className="w-12 h-12 text-red-600 " />
                                <p className="text-danger font-bold text-lg mb-2">
                                  Oops! Something went wrong
                                </p>
                                <p className="text-danger-700 text-sm">
                                  {aierror}
                                </p>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  className="mt-4"
                                  onClick={() => setAiError(null)}
                                >
                                  Close
                                </Button>
                              </Card.Content>
                            </Card>
                          )}
                          {showProductPreview && aiProducts.length > 0 && (
                            <div className="w-full md:max-w-[80%] mx-auto mt-4">
                              {/* Outer gradient border */}
                              <div className="p-[3px] rounded-2xl bg-linear-to-r from-primary via-secondary to-primary">
                                {/* Inner card background */}
                                <div
                                  className={`rounded-2xl p-6 ${isDark ? "bg-gray-900" : "bg-white"}`}
                                >
                                  {/* Header with linear text */}
                                  <div className="flex items-center justify-center gap-2 mb-6">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                      Suggested by AI
                                    </h2>
                                    <Sparkles className="w-5 h-5 text-secondary" />
                                  </div>

                                  {/* Products list with glassmorphism effect */}
                                  <div className="mb-4 rounded-xl bg-linear-to-br from-primary/10 to-secondary/10 p-4 space-y-2">
                                    {aiProducts.map((product) => (
                                      <div
                                        key={product.id}
                                        className="flex items-center gap-3 p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm"
                                      >
                                        <div className="w-7 h-7 rounded-full bg-linear-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                                          <span className="text-sm">📦</span>
                                        </div>
                                        <span className="flex-1 font-medium text-sm">
                                          {product.productName}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-xs font-bold">
                                          x{product.quantity}
                                        </span>
                                        <span className="font-bold text-green-600 text-sm">
                                          ${Number(product.estPrice).toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Summary */}
                                  <div className="flex gap-2 items-center mb-4 px-2">
                                    <span className="text-gray-500 text-sm">
                                      Total items:
                                    </span>
                                    <span className="font-bold text-sm">
                                      {aiProducts.length}
                                    </span>
                                  </div>

                                  {/* Action buttons */}
                                  <div className="flex gap-3">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1 border border-red-500 text-red-500 "
                                      onClick={handleRejectProducts}
                                    >
                                      ❌ Reject
                                    </Button>
                                    <Button
                                      size="sm"
                                      style={{
                                        background:
                                          "linear-gradient(to right, #ff7b00, #a35e04)",
                                      }}
                                      className="flex-1 text-white transition-all duration-300 hover:brightness-110 hover:scale-[1.02]"
                                      onClick={handleAcceptProducts}
                                    >
                                      ✅ Accept All
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Modal>
                      )}
                    </div>
                    <div className="flex justify-between py-5">
                      <DateField
                        isInvalid={!!dateerror}
                        className="w-[256px] "
                        granularity="minute"
                        value={selecteddate}
                        onChange={(date) => {
                          setSelectedDate(date);
                          if (date && date < now(getLocalTimeZone())) {
                            setDateError("Invalid time");
                          } else {
                            setDateError(null);
                          }
                        }}
                        minValue={now(getLocalTimeZone())}
                      >
                        <Label> Choose a date(optional) </Label>
                        <DateInputGroup>
                          <DateInputGroup.Input>
                            {(segment) => (
                              <DateInputGroup.Segment segment={segment} />
                            )}
                          </DateInputGroup.Input>
                        </DateInputGroup>
                        <FieldError>{dateerror}</FieldError>
                      </DateField>
                      <div className="flex justify-center gap-2 Oswald">
                        <h1 className="tracking tracking-wider">Totalcost: </h1>
                        <span className="font-bold tracking-wide text-green-900">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(cost)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button
                        className="w-[80%]"
                        variant="tertiary"
                        type="submit"
                      >
                        Create new note
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
      {isCompleted && (
        <div className=" fixed flex items-center justify-center bg-black/50 inset-0 z-50 w-full border-2 ">
          <div
            className={`w-[80%] relative overflow-y-auto h-[80%] border-2 ${isDark ? "bg-black" : "bg-white"} p-6 shadow-xl`}
          >
            <div
              className="absolute right-3 top-2 cursor-pointer"
              onClick={() => {
                setDraftNote(null);
                setEditingNoteId(null);
                setIsCompleted(false);
              }}
            >
              <X />
            </div>
            <div className="flex flex-col text-center justify-center items-center">
              <h2 className="Archivo-Black text-3xl">
                {draftnote?.productTitle}
              </h2>
            </div>
            <Label> Message</Label>
            <TextArea
              aria-label="message"
              fullWidth
              className="mt-2"
              placeholder="review message about the note..."
              value={draftnote?.message || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 300 && draftnote)
                  setDraftNote({ ...draftnote, message: value });
              }}
            />
            <Description>
              Characters:{draftnote?.message?.length || 0}/300
            </Description>
            <ImageUpload
              initialImage={draftnote?.picture || null}
              onImageSelect={(base64String) => {
                if (draftnote) {
                  setDraftNote({ ...draftnote, picture: base64String });
                }
              }}
              onPriceExtract={(price) => {
                setIsPriceExtracting(false);
                setFinalCost(price.toString());
              }}
              onPriceExtractStart={() => setIsPriceExtracting(true)}
            />

            <div className="flex flex-col items-stretch sm:items-end justify-end py-10 px-4 sm:px-0 w-full">
              <div className="py-3 flex flex-col w-full sm:w-72">
                <Label className="mb-1.5 text-sm font-medium">Final Cost</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder={
                    isPriceExtracting
                      ? `FloWealth AI is thinking${priceextracdots}`
                      : "0.00$"
                  }
                  value={isPriceExtracting ? "" : finalcost || ""}
                  disabled={isPriceExtracting}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      setFinalCost(val);
                    }
                  }}
                />
                <span className="text-xs text-gray-500 mt-1.5 sm:text-right">
                  What was the final cost ? (optional)
                </span>
              </div>
              <Button
                className="w-full sm:w-auto mt-2"
                onClick={() => {
                  if (draftnote) {
                    handleaddCompleted(draftnote.id);
                  }
                }}
                isDisabled={isPriceExtracting}
              >
                Submit note
              </Button>
            </div>
          </div>
        </div>
      )}

      {missingtoast && (
        <div className="fixed top-2 inset-x-0 mx-auto w-fit z-60">
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>
                The productname can't be blank and the quantity and price has to
                be min 0
              </Alert.Title>
            </Alert.Content>
          </Alert>
        </div>
      )}
      {isdeletednotes && (
        <div className="fixed top-2 inset-x-0 mx-auto w-fit z-60  ">
          <Alert status="success">
            <Alert.Indicator>
              <CheckCheck />
              <Alert.Content>
                <Alert.Title className="ml-2">
                  {" "}
                  Note is succesfully has been deleted
                </Alert.Title>
              </Alert.Content>
            </Alert.Indicator>
          </Alert>
        </div>
      )}
      {isvalidnote.length > 0 && (
        <div className="fixed top-2 inset-x-0 mx-auto w-fit z-60 ">
          <Alert status="warning">
            <Alert.Indicator>
              <TriangleAlert />
              <Alert.Content>
                <Alert.Title className="ml-2"> {isvalidnote[0]}</Alert.Title>
              </Alert.Content>
            </Alert.Indicator>
          </Alert>
        </div>
      )}
      {isupdating && (
        <div className="fixed top-2 inset-x-0 mx-auto w-fit z-60  ">
          <Alert status="success">
            <Alert.Indicator>
              <CheckCheck />
              <Alert.Content>
                <Alert.Title className="ml-2">
                  {" "}
                  Note is succesfully has been updated
                </Alert.Title>
              </Alert.Content>
            </Alert.Indicator>
          </Alert>
        </div>
      )}
      {maxlimit && (
        <div className="fixed top-2 inset-x-0 mx-auto w-fit z-60  ">
          <Alert status="warning">
            <Alert.Indicator>
              <MessageCircleWarning />
              <Alert.Content>
                <Alert.Title className="ml-2">
                  {" "}
                  Max Theme Limit reached !
                </Alert.Title>
              </Alert.Content>
            </Alert.Indicator>
          </Alert>
        </div>
      )}
      {pricetoohigh && (
        <div className="fixed top-2 inset-x-0 mx-auto w-fit z-60   ">
          <Alert status="warning">
            <Alert.Indicator>
              <SearchAlert />
              <Alert.Content>
                <Alert.Title className="ml-2">
                  {" "}
                  The Price is too High
                </Alert.Title>
              </Alert.Content>
            </Alert.Indicator>
          </Alert>
        </div>
      )}
      {isimagemodalopen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 
                 hover:bg-white/20 flex items-center justify-center 
                 transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              setIsImageModalOpen(null);
            }}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            src={isimagemodalopen}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
      <AiChatSidebar
        isopen={isaisidebaropen}
        onClose={() => setISAiSidebarOpen(false)}
        note={activenoteforai}
        initialAnalysis={aianalysis}
        isAnalyzing={aiLoading !== null}
        conversationId={0}
        conversationTitle={""}
        onConversationLoaded={() => {}}
      />
      {!user && selectedtheme === "No theme " && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center">
          <CreateUserCard />
        </div>
      )}
    </div>
  );
};

export default Expenses;
