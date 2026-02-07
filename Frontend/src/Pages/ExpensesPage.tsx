import {
  Button,
  Chip,
  Dropdown,
  Header,
  Input,
  Kbd,
  Label,
  Separator,
} from "@heroui/react";
import { useAuth } from "../Context/AuthContext";
import { BadgePlus, BookX, CheckLine } from "lucide-react";
import React, { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import useDarkMode from "../Components/Mode";
import ProductTable from "../Components/ProductTable";
const Expenses = () => {
  interface ProductRow {
    id: number;
    productName: string;
    quantity: number | string; // Legyen engedékenyebb
    estPrice: number | string; // Legyen engedékenyebb
  }
  const { isDark } = useDarkMode();
  const [isnewtheme, setIsNewTheme] = useState<boolean>(false);
  const [addtheme, setAddTheme] = useState<string>("");
  const [themes, setThemes] = useState<string[] | null>([]);
  const [selectedtheme, setSelectedTheme] = useState<string | null>(null);
  const [nodes, setNodes] = useState<string[] | null>([]);
  const [isnewnode, setIsNewNode] = useState<boolean>(false);
  const [rows, setRows] = useState<ProductRow[]>([
    { id: Date.now(), productName: "", quantity: 0, estPrice: 0 },
  ]);

  const [close, setClose] = useState<boolean>(false);
  const [showtable, setShowTable] = useState<boolean>(false);
  const { user } = useAuth();

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

  const handleAddtheme = async (e: React.FormEvent, themes: string) => {
    e.preventDefault();
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
  };
  useEffect(() => {
    console.log(themes);
    console.log(selectedtheme);
  }, [themes, selectedtheme]);

  return (
    <div>
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
            <Button>Add new node</Button>
            <Dropdown.Popover className="min-w-[20h]">
              <Dropdown.Menu>
                <Dropdown.Section>
                  <Header>Themes</Header>
                  <Dropdown.Item>
                    {themes &&
                      themes.length > 0 &&
                      themes.map((theme, index) => (
                        <div
                          key={index}
                          className="cursor-pointer"
                          onClick={() => {
                            (setSelectedTheme(theme), setClose(true));
                          }}
                        >
                          <Label>{theme} </Label>
                          <Kbd>
                            <Kbd.Content>Theme</Kbd.Content>
                          </Kbd>
                        </div>
                      ))}
                  </Dropdown.Item>
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
            <div className=" fixed flex items-center justify-center bg-black/50 inset-0 z-50 w-full border-2 ">
              <div
                className={`w-[80%] h-[80%] border-2 ${isDark ? "bg-black" : "bg-white"} p-6 shadow-xl`}
              >
                <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:gap-10">
                  <div className="flex-1">
                    <Input fullWidth placeholder="Title" />
                  </div>
                  <div
                    className="justify-between  my-3 sm:my-auto flex shrink-0 gap-3"
                    onClick={() => (setSelectedTheme(null), setClose(true))}
                  >
                    <div className="flex-[.3]">
                      <Chip
                        color="accent"
                        variant="soft"
                        className="cursor-pointer"
                      >
                        {selectedtheme}
                      </Chip>
                    </div>
                    <BookX
                      className={`${isDark ? " text-white" : "text-black"} cursor-pointer`}
                    />
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
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="justify-center items-center w-full flex  min-h-screen">
          Login
        </div>
      )}
    </div>
  );
};

export default Expenses;
