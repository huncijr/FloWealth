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
} from "@heroui/react";

import { useAuth } from "../Context/AuthContext";
import { BadgePlus, BookX, CheckLine } from "lucide-react";
import React, { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import useDarkMode from "../Components/Mode";
import ProductTable from "../Components/ProductTable";
import { getLocalTimeZone, now, type DateValue } from "@internationalized/date";
const Expenses = () => {
  // Interface for product rows in the table
  interface ProductRow {
    id: number;
    productName: string;
    quantity: number | string;
    estPrice: number | string | null;
  }
  interface Note {
    theme: string | null;
    productTitle: string;
    products: Array<{
      name: string;
      quantity: number | null;
      estprice: number | null;
    }>;
    estcost: string;
    estimatedTime: string | null;
    createdAt: string;
  }

  const { isDark } = useDarkMode();
  const [isnewtheme, setIsNewTheme] = useState<boolean>(false);
  const [addtheme, setAddTheme] = useState<string>("");
  const [themes, setThemes] = useState<string[] | null>([]);
  const [selectedtheme, setSelectedTheme] = useState<string | null>(null);

  const [notes, setNotes] = useState<Note[]>([]);

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

  return (
    <div>
      {notes && notes.length > 0 ? (
        <div className="flex gap-4 p-10">
          {notes.map((note, i) => (
            <div key={i} className="border-2 p-3">
              <p>title: {note.productTitle}</p>
              <p>theme: {note?.theme}</p>
              <p>estcost: {note.estcost}</p>
              <p>time: {note.estimatedTime || "no time"}</p>
              <p>created: {note.createdAt}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>No new notes added</div>
      )}
      {user ? (
        <div>
          <Button onClick={() => setIsNewTheme(true)}>
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
                      className="w-[256px] "
                      granularity="minute"
                      value={selecteddate}
                      onChange={setSelectedDate}
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
    </div>
  );
};

export default Expenses;
