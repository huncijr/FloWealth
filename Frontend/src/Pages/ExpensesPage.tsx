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
} from "@heroui/react";

import { useAuth } from "../Context/AuthContext";
import {
  BadgePlus,
  BookX,
  Check,
  CheckCheck,
  CheckCircle,
  CheckLine,
  ClockCheck,
  DollarSign,
  PencilLine,
  Plus,
  Trash,
  X,
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
    estimatedTime: string | null;
    createdAt: string;
  }

  const { isDark } = useDarkMode();
  const [isnewtheme, setIsNewTheme] = useState<boolean>(false);
  const [addtheme, setAddTheme] = useState<string>("");
  const [themes, setThemes] = useState<string[] | null>([]);
  const [selectedtheme, setSelectedTheme] = useState<string | null>(null);
  const [dateerror, setDateError] = useState<string | null>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [isdeletednotes, setIsDeletedNotes] = useState<boolean>(false);
  const [draftnote, setDraftNote] = useState<Note | null>(null);
  const [editingnoteid, setEditingNoteId] = useState<number | null>(null);

  const [isnewnote, setIsNewNote] = useState<boolean>(false);

  const [selecteddate, setSelectedDate] = useState<DateValue | null>(null);
  const [producttitle, setProductTitle] = useState<string | null>(null);
  const [cost, setCost] = useState<number>(0);

  const [missingtoast, setMissingToast] = useState<boolean>(false);

  const [rows, setRows] = useState<ProductRow[]>([
    { id: Date.now(), productName: "", quantity: 1, estPrice: null },
  ]);

  const [close, setClose] = useState<boolean>(false);
  const [showtable, setShowTable] = useState<boolean>(false);
  const { user } = useAuth();

  // Calculate total cost whenever rows change
  useEffect(() => {
    const total = rows.reduce((acc, row) => {
      const price = Number(row.estPrice) || 0;
      const quantity = Number(row.quantity) || 0;
      return acc + price * quantity;
    }, 0);
    setCost(total);
  }, [rows]);

  // Fetch themes from backend when user changes
  useEffect(() => {
    const GetThemes = async () => {
      try {
        const response = await api.get("/gettheme");
        if (response.data.success) {
          let themes = response.data.allthemes;
          setThemes(themes);
        }
      } catch (error) {}
    };
    GetThemes();
  }, [user]);

  useEffect(() => {
    const GetNotes = async () => {
      try {
        const response = await api.get("/getnotes");
        if (response.data.success) {
          let allnotes = [];
          const notedata = response.data.note;
          if (notedata?.result && Array.isArray(notedata)) {
            allnotes = notedata.flat();
          } else if (Array.isArray(notedata)) {
            allnotes = notedata;
          } else if (notedata) {
            allnotes = [notedata];
          }
          setNotes(allnotes);
        }
      } catch (error) {
        console.error(error);
      }
    };
    GetNotes();
  }, [user]);

  useEffect(() => {
    if (missingtoast) {
      setTimeout(() => {
        setMissingToast(false);
      }, 2500);
    }
  }, [missingtoast]);
  useEffect(() => {
    console.log(notes);
  }, [notes]);

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

  // Collects data from rows, builds payload, validates and sends to backend
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = rows.filter((row) => row.productName.trim() !== "");

    const productnames = validRows.map((row) => row.productName);
    const quantities = validRows.map((row) => Number(row.quantity) || 0);
    const estprices = validRows.map((row) => Number(row.estPrice) || 0);

    const payload = {
      Theme: selectedtheme || null,
      ProductTitle: producttitle,
      ProductNames: productnames,
      Quantities: quantities,
      EstPrices: estprices,
      Cost: cost,
      Date: selecteddate,
    };

    if (!validatePayload(payload)) {
      setMissingToast(true);
      console.log("i am here");
      return;
    }
    try {
      const response = await api.post("/addnote", payload);
      console.log(response.data);
      if (response.data.success) {
        setNotes((prev) =>
          prev ? [...prev, response.data.note] : [response.data.note],
        );
        setClose(true);
        setSelectedTheme(null);
        setSelectedDate(null);
        setProductTitle(null);
        setRows([
          { id: Date.now(), productName: "", quantity: 1, estPrice: null },
        ]);
        setCost(0);
      }
    } catch (error) {}
  };

  // Handle adding a new theme to the backend
  const handleAddtheme = async (e: React.FormEvent, themes: string) => {
    e.preventDefault();

    if (themes?.trim()) {
      try {
        const response = await api.post("/newtheme", {
          themes: themes,
        });
        console.log(response.data.allthemes);
        if (response.data.success) {
          let newthemes = response.data.allthemes;
          console.log(newthemes);
          setThemes(newthemes);
        }
      } catch (error) {
      } finally {
        setIsNewTheme(false);
        setAddTheme("");
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await api.delete(`/deletenote/${id}`);
      if (response.data.success) {
        setIsDeletedNotes(true);
        setNotes((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
    } finally {
      setTimeout(() => {
        setIsDeletedNotes(false);
      }, 2500);
    }
  };

  const handleaddCompleted = async (id: number) => {
    try {
      const note = notes.find((n) => n.id === id);
      if (note) {
        const response = await api.post(`/completenote/${id}`);
        if (response.data.success) {
          setNotes((prev) =>
            prev.map((p) => (p.id === id ? { ...p, completed: true } : p)),
          );
        }
      }
    } catch (error) {}
  };

  return (
    <div>
      {/* ==========================================
          NOTES GRID - Main container for all notes
          ========================================== */}
      {notes && notes.length > 0 ? (
        <div
          className="grid grid-cols-[repeat(auto-fit,minmax(200px,2fr))]
                     lg:grid-cols-3 gap-4 gap-y-14 w-[80%] p-8 items-stretch auto-rows-fr"
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
                            onClick={() => handleaddCompleted(note.id)}
                          >
                            <Check size={16} />
                          </div>
                        </>
                      ) : (
                        /* EDIT MODE: "Editing..." badge */
                        <div className="flex items-center gap-1  px-2 py-1  text-xs font-medium ">
                          <div className="flex cursor-pointer rounded hover:bg-green-700/40 text-green-900 bg-green-700/20">
                            <CheckCircle size={16} />
                            <p>UPDATE</p>
                          </div>
                          <div className="flex bg-yellow-500/20 rounded text-yellow-600">
                            <PencilLine size={16} />
                            <span>Editing...</span>
                          </div>
                        </div>
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
                                    onChange={(date) => handleChangeDate(date)}
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
                                                theme,
                                              });
                                          }}
                                        >
                                          <div className="cursor-pointer flex justify-between items-center w-full">
                                            <Label>{theme}</Label>
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
                            <p className="Archivo-Black rounded-xl bg-red-700 px-5 py-1 shadow-[0_0_0_2px_#b91c1c] z-10">
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
                                      value={draftnote?.products[i].name || ""}
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
                                          draftnote?.products[i]?.quantity || ""
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
                                          draftnote?.products[i]?.estprice || ""
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
                <div className="h-full flex flex-col opacity-70">
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
                      <span
                        className={`font-bold ${isDark ? "text-green-400" : "text-green-600"}`}
                      >
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(Number(note.estcost) || 0)}
                      </span>
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
                        className={`rounded-lg p-2 ${isDark ? "bg-gray-700/50" : "bg-gray-100"}`}
                      >
                        {note.products.slice(0, 3).map((product, i) => (
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
                        {note.products.length > 3 && (
                          <p
                            className={`text-xs text-center mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                          >
                            +{note.products.length - 3} more
                          </p>
                        )}
                      </div>
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
      ) : (
        <div>No new notes added</div>
      )}
      {user ? (
        <div>
          <Button onClick={() => setIsNewTheme(true)} variant="ghost">
            <BadgePlus /> ADD NEW THEME
          </Button>
          {isnewtheme && (
            <div className="relative  max-w-sm">
              <Input
                aria-label="Name"
                className="pr-10 w-full"
                placeholder="Enter the new theme..."
                value={addtheme}
                onChange={(e) => setAddTheme(e.target.value)}
              />
              <button onClick={(e) => handleAddtheme(e, addtheme)}>
                <CheckLine className="absolute right-2 top-1/2 -translate-y-1/2 border-2  rounded-lg cursor-pointer" />
              </button>
            </div>
          )}
          {themes ? (
            themes.length > 0 &&
            themes.map((theme, index) => <div key={index}>{theme}</div>)
          ) : (
            <p>No themes</p>
          )}
          <Dropdown>
            <Button variant="secondary">Add new node</Button>
            <Dropdown.Popover className="min-w-[200px]">
              <Dropdown.Menu>
                <Dropdown.Section>
                  <Header>Themes</Header>
                  {themes &&
                    themes.length > 0 &&
                    themes.map((theme, index) => (
                      <Dropdown.Item key={index}>
                        <div
                          className="cursor-pointer flex justify-between items-center w-full"
                          onClick={() => {
                            setSelectedTheme(theme);
                            setClose(true);
                          }}
                        >
                          <Label>{theme}</Label>
                          <Kbd>
                            <Kbd.Content>Theme</Kbd.Content>
                          </Kbd>
                        </div>
                      </Dropdown.Item>
                    ))}
                </Dropdown.Section>
                <Separator />
                <Dropdown.Section>
                  <Header>Subscription</Header>
                  <Dropdown.Item>a</Dropdown.Item>
                </Dropdown.Section>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
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
                        onClick={() => (setSelectedTheme(null), setClose(true))}
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
                  {showtable && <ProductTable rows={rows} setRows={setRows} />}
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
      ) : (
        <div className="justify-center items-center w-full flex  min-h-screen">
          Login
        </div>
      )}
      {missingtoast && (
        <div className="absolute top-2 inset-x-0 mx-auto w-fit">
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
        <div className="absolute top-2 inset-x-0 mx-auto w-fit  ">
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
    </div>
  );
};

export default Expenses;
