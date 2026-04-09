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
} from "@heroui/react";

import { useAuth } from "../Context/AuthContext";
import {
  BadgePlus,
  Ban,
  BookX,
  Check,
  CheckCheck,
  CheckCircle,
  ChevronDown,
  ClockCheck,
  DollarSign,
  NotebookPen,
  PencilLine,
  Plus,
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

  const [missingtoast, setMissingToast] = useState<boolean>(false);

  const [rows, setRows] = useState<ProductRow[]>([
    { id: Date.now(), productName: "", quantity: 1, estPrice: null },
  ]);

  const [close, setClose] = useState<boolean>(false);
  const [showtable, setShowTable] = useState<boolean>(false);
  const [hoveredNoteId, setHoveredNoteId] = useState<number | null>(null);

  const [aiLoading, setAiLoading] = useState<number | null>(null);
  const [isaisidebaropen, setISAiSidebarOpen] = useState<boolean>(false);
  const [activenoteforai, setActiveNoteForAi] = useState<Note | null>(null);
  const [aianalysis, setAiAnalysis] = useState<string>("");

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
      setTimeout(() => {
        setMissingToast(false);
      }, 2500);
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
      setTimeout(() => {
        setIsValidNote([]);
      }, 2000);
    }
  }, [isvalidnote]);

  // Validate payload before submitting to backend
  // Checks if required fields are present and not empty
  const validatePayload = (payload: any) => {
    const missing: string[] = [];

    if (!payload.ProductTitle?.trim()) missing.push("title");
    if (!payload.ProductNames?.length) missing.push("products");
    if (!payload.Quantities?.length) missing.push("quantities");
    if (!payload.EstPrices?.length) missing.push("prices");

    console.log(missing);
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
      console.log(new Date(draft.estimatedTime));
      console.log(new Date());
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
    console.log(errors);
    return { valid: errors.length === 0, errors };
  };

  // Updates an existing note with edited data from draft state
  // Recalculates total cost from products before sending to backend
  const handleUpdateNote = async () => {
    if (!draftnote) return;
    console.log(draftnote);
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
      setClose(true);
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
        console.log(response.data.allthemes);
        if (response.data.success) {
          let newthemes = response.data.allthemes;
          console.log(newthemes);
          updateTheme(newthemes);
        }
      } catch (error) {
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
          </div>
          <div
            className=" grid grid-cols-[repeat(auto-fit,minmax(200px,2fr))]
                     lg:grid-cols-3 gap-4 gap-y-14 w-full p-8 items-stretch auto-rows-fr"
          >
            {/* ==========================================
                  ACTIVE NOTE (not completed)
                  ========================================== */}

            {notes.map((note) => (
              <div key={note.id} className="relative w-full mx-auto h-[450px]">
                {!note.completed ? (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center gap-3 bg-gray-300 transform -skew-x-9 shadow-lg overflow-hidden ">
                      <div className="flex gap-2 relative z-10 overflow-hidden w-full skew-x-9 m-1 ">
                        {editingnoteid !== note.id ? (
                          <>
                            <div
                              className="cursor-pointer bg-red-600 text-white px-1 hover:bg-red-500 py-1 rounded text-xs"
                              onClick={() => handleDelete(note.id)}
                            >
                              <Trash size={16} />
                            </div>
                            <div
                              className="cursor-pointer bg-green-600 hover:bg-green-500 text-white px-1 py-1 rounded text-xs"
                              onClick={() => {
                                if (editingnoteid === note.id) {
                                  (setEditingNoteId(null), setDraftNote(null));
                                } else {
                                  setEditingNoteId(note.id);
                                  setDraftNote({ ...note });
                                  setIsCompleted(true);
                                }
                              }}
                            >
                              <Check size={16} />
                            </div>
                          </>
                        ) : (
                          hasInitiallyLoaded && (
                            /* EDIT MODE: "Editing..." badge */
                            <div className="flex items-center gap-1  px-2 py-1  text-xs font-medium ">
                              <div
                                className="flex cursor-pointer rounded hover:bg-green-700/40 text-green-900 bg-green-700/20"
                                onClick={handleUpdateNote}
                              >
                                <CheckCircle size={16} />
                                <p>UPDATE</p>
                              </div>
                              <div className="flex bg-yellow-500/20 rounded text-yellow-600">
                                <PencilLine size={16} />
                                <span>Editing...</span>
                              </div>
                            </div>
                          )
                        )}
                        <div
                          className="cursor-pointer flex items-end ml-auto  px-1 py-1 rounded text-xs"
                          onClick={() => {
                            if (editingnoteid === note.id) {
                              (setEditingNoteId(null), setDraftNote(null));
                            } else {
                              setEditingNoteId(note.id);
                              setDraftNote({ ...note });
                            }
                          }}
                        >
                          {/* Toggle Edit Mode Button (Pencil/X) */}
                          {editingnoteid === note.id ? (
                            <X
                              size={16}
                              className="text-red-900 hover:text-red-800"
                            />
                          ) : (
                            <PencilLine
                              size={16}
                              className="text-blue-900 hover:text-blue-800"
                            />
                          )}
                        </div>
                      </div>
                      <div
                        className={`absolute -left-1 top-0 w-[65%]  h-full ${editingnoteid === note.id ? "bg-gray-400/70" : "bg-blue-400/70"}
                                   transform -skew-x-9 origin-left`}
                      />{" "}
                    </div>
                    {/* ==========================================
                      MAIN CONTENT - Title, Date, Theme, Cost
                      ========================================== */}
                    <div
                      className={`mt-1 relative flex flex-col border-2  ${editingnoteid !== note.id ? (isDark ? "border-gray-800" : "border-white") : "border-red-700"}
                     p-3 ${editingnoteid === note.id ? "bg-secondary/90" : "bg-secondary"} h-full overflow-y-auto`}
                    >
                      <div className="flex flex-col ">
                        <div className="flex justify-between items-start z-10">
                          <div className="flex flex-col">
                            {editingnoteid !== note.id ? (
                              <p className="Ubuntu line-clamp-2 min-h-[40px]">
                                {note.productTitle}
                              </p>
                            ) : (
                              <div className="w-[50%] min-h-[40px]">
                                <Input
                                  aria-label="Name"
                                  className="w-full"
                                  placeholder="Enter a new title"
                                  value={draftnote?.productTitle}
                                  onChange={(e) =>
                                    handleChangeTitle(e.target.value)
                                  }
                                />
                              </div>
                            )}
                            <div className="shrink-0 text-sm text-muted capitalize w-[50%]">
                              <Chip
                                variant="secondary"
                                color="default"
                                className="py-1 min-h-[40px]"
                              >
                                <ClockCheck className="shrink-0" />

                                {editingnoteid === note.id ? (
                                  <div className="w-32">
                                    <DateField
                                      aria-label="Estimated time"
                                      className="w-full"
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
                                  </div>
                                ) : (
                                  <p className="truncate">
                                    {note.estimatedTime?.split("T")[0] ||
                                      "no time selected"}
                                  </p>
                                )}
                              </Chip>
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            {editingnoteid === note.id ? (
                              <Dropdown>
                                <Button
                                  variant="secondary"
                                  className="relative z-10 border-2 px-5 py-1 shadow-[0_0_0_2px_#a6a6a8]  "
                                >
                                  {draftnote?.theme || ""}
                                </Button>
                                <Dropdown.Popover className="min-w-[200px]">
                                  <Dropdown.Menu>
                                    <Dropdown.Section>
                                      <Header>Themes</Header>
                                      {themes &&
                                        themes.length > 0 &&
                                        themes.map((theme, index) => (
                                          <Dropdown.Item
                                            key={index}
                                            onClick={() => {
                                              if (draftnote)
                                                setDraftNote({
                                                  ...draftnote,
                                                  theme: theme.name,
                                                  color: theme.color,
                                                });
                                            }}
                                          >
                                            <div className="cursor-pointer flex justify-between items-center w-full">
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
                            ) : (
                              <p
                                className="Archivo-Black rounded-xl  px-5 py-1 z-10"
                                style={{
                                  backgroundColor: note.color,
                                  boxShadow: `0 0 0 2px ${note.color}`,
                                }}
                              >
                                {note?.theme || "No theme added"}
                              </p>
                            )}
                            <div className="bg-gradient-to-b  from-gray-700 to-gray-800 text-white pb-1 px-2 mx-1 pt-2 -mt-2 rounded-b-xl font-bold shadow-md transform translate-y-0 ">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                              }).format(Number(note.estcost) || 0)}
                              <div
                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3
                        bg-gray-800 rotate-45 border-gray-600"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="h-1 relative mt-4 w-full bg-gray-600" />
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                            Products
                          </h4>
                          <div className="bg-gray-800/30 rounded-lg overflow-hidden">
                            <div className="grid grid-cols-3 gap-2 bg-gray-700/50 px-3 py-2 text-xs font-medium text-gray-400 uppercase">
                              <span>Name</span>
                              <span className="text-center">Qty</span>
                              <span className="text-right">Price</span>
                            </div>

                            {/* VIEW MODE: Display products | EDIT MODE: Editable inputs */}
                            <ScrollShadow className="max-h-[100px] sm:max-h-[125px] md:max-h-[150px] lg:max-h-[200px] w-full">
                              {(editingnoteid === note.id
                                ? draftnote?.products
                                : note.products
                              )?.map((product, i) => (
                                <div key={i} className="h-full w-full">
                                  {editingnoteid !== note.id ? (
                                    <div className="grid grid-cols-3 text-sm border-t border-gray-700/50 hover:bg-gray-700/30 transition-colors gap-2 px-3 py-2 ">
                                      <span className="truncate font-medium">
                                        {product.name}
                                      </span>
                                      <span className="text-center text-gray-400">
                                        {product.quantity}
                                      </span>
                                      <span className="text-right font-bold text-emerald-400">
                                        ${Number(product.estprice).toFixed(2)}
                                      </span>{" "}
                                    </div>
                                  ) : (
                                    /* EDIT MODE: Editable product row with inputs */
                                    <div className="grid grid-cols-3 text-sm border-t border-gray-700/50 hover:bg-gray-700/30 transition-colors gap-2 px-3 py-2">
                                      <Input
                                        fullWidth
                                        placeholder="Enter a new Product title"
                                        variant="secondary"
                                        value={
                                          draftnote?.products[i].name || ""
                                        }
                                        onChange={(e) =>
                                          handleChangeProduct(
                                            i,
                                            "name",
                                            e.target.value || "",
                                          )
                                        }
                                      />
                                      <InputGroup className="min-w-[60px]">
                                        <InputGroup.Prefix>
                                          <PencilLine size={20} />
                                        </InputGroup.Prefix>
                                        <InputGroup.Input
                                          placeholder="0"
                                          type="Number"
                                          value={
                                            draftnote?.products[i]?.quantity ||
                                            ""
                                          }
                                          className="min-w-13 w-full"
                                          onChange={(e) =>
                                            handleChangeProduct(
                                              i,
                                              "quantity",
                                              parseFloat(e.target.value) || 0,
                                            )
                                          }
                                          min={0}
                                        />
                                      </InputGroup>
                                      <InputGroup className="min-w-[60px]">
                                        <InputGroup.Prefix>
                                          <DollarSign className="w-3 sm:w-4 md:w-5 lg:w-6" />
                                        </InputGroup.Prefix>
                                        <InputGroup.Input
                                          placeholder="0"
                                          type="Number"
                                          value={
                                            draftnote?.products[i]?.estprice ||
                                            ""
                                          }
                                          className="min-w-13 w-full"
                                          onChange={(e) =>
                                            handleChangeProduct(
                                              i,
                                              "estprice",
                                              parseFloat(e.target.value) || 0,
                                            )
                                          }
                                          min={0}
                                        />
                                      </InputGroup>
                                      <Button
                                        variant="danger-soft"
                                        onClick={() => handleDeleteProduct(i)}
                                        size="sm"
                                      >
                                        <Trash size={14} />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </ScrollShadow>
                            {editingnoteid === note.id && (
                              <div className="flex justify-center py-2 border-t border-gray-700/50">
                                <Button
                                  variant="tertiary"
                                  onClick={() => handleAddNewProduct()}
                                  size="sm"
                                >
                                  <Plus size={16} /> Add Product
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* ==========================================
                        FOOTER - Created date chip
                        ========================================== */}
                      <div className="mt-auto flex justify-end pt-4">
                        <Chip
                          variant="secondary"
                          color="accent"
                          className="px-1 "
                        >
                          <p>created: {note.createdAt.split("T")[0]}</p>
                        </Chip>
                      </div>
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
                    <div
                      className={`flex items-center gap-3 transform -skew-x-9 shadow-lg overflow-hidden ${isDark ? "bg-gray-700" : "bg-gray-300"}`}
                    >
                      <div className="flex gap-2 relative z-10 overflow-hidden w-full skew-x-9 m-1 items-center">
                        <div className="bg-green-600 italic font-semibold text-sm lg:text-base text-white px-3  rounded shadow-lg">
                          ✓ COMPLETED
                        </div>
                        <div className="flex items-end ml-auto text-blue-600 px-1 py-1">
                          <PencilLine
                            className="cursor-pointer transition-colors"
                            size={16}
                          />
                        </div>
                      </div>
                      <div className="absolute -left-1 top-0 w-[65%] h-full bg-green-500/30 transform -skew-x-9 origin-left" />
                    </div>
                    <div
                      className={`mt-1 relative flex flex-col border-2 p-4 grow overflow-y-auto ${isDark ? "bg-gray-800 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <ClockCheck
                          size={14}
                          className={isDark ? "text-gray-400" : "text-gray-500"}
                        />
                        <span
                          className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {note.createdAt.split("T")[0]}
                        </span>
                      </div>
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
                          {/* Fő cost - nagyban */}
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
                      <div className="grow">
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
                      </div>
                      <div
                        className={`mt-auto pt-3 flex items-center gap-2 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        <ClockCheck size={12} />
                        <span>
                          {note.estimatedTime
                            ? `Due: ${note.estimatedTime.split("T")[0]}`
                            : "No date added"}
                        </span>
                      </div>
                    </div>
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
              <div className="my-5">
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
                            setClose(true)
                          )}
                        >
                          <BookX
                            className={`${isDark ? " text-white" : "text-black"} cursor-pointer`}
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      className="my-5"
                      variant={showtable ? "tertiary" : "outline"}
                      onClick={() => setShowTable(!showtable)}
                    >
                      {showtable ? "Hide Table" : "View Table"}
                    </Button>
                    {showtable && (
                      <ProductTable rows={rows} setRows={setRows} />
                    )}
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
                        Create new node
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
            />

            <div className="flex flex-col items-stretch sm:items-end justify-end py-10 px-4 sm:px-0 w-full">
              <div className="py-3 flex flex-col w-full sm:w-72">
                <Label className="mb-1.5 text-sm font-medium">Final Cost</Label>
                <Input
                  type="number"
                  placeholder="0.00$"
                  className="w-full"
                  onChange={(e) => setFinalCost(e.target.value)}
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
              >
                Submit note
              </Button>
            </div>
          </div>
        </div>
      )}

      {missingtoast && (
        <div className="fixed top-2 inset-x-0 mx-auto w-fit">
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
        <div className="fixed top-2 inset-x-0 mx-auto w-fit  ">
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
        <div className="fixed top-2 inset-x-0 mx-auto w-fit  ">
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
        <div className="fixed top-2 inset-x-0 mx-auto w-fit  ">
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
      {isimagemodalopen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
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
      />
    </div>
  );
};

export default Expenses;
