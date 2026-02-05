import { Button, Input } from "@heroui/react";
import { useAuth } from "../Context/AuthContext";
import { BadgePlus, CheckLine } from "lucide-react";
import React, { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
const Expenses = () => {
  const [isnewtheme, setIsNewTheme] = useState<boolean>(false);
  const [addtheme, setAddTheme] = useState<string>("");
  const [themes, setThemes] = useState<string[] | null>([]);
  const { user } = useAuth();
  const handleAddtheme = async (e: React.FormEvent, themes: string) => {
    e.preventDefault();
    try {
      const response = await api.post("/newtheme", {
        userId: user?.id,
        themes: themes,
      });
      console.log(response.data.allthemes);
      if (response.data.success) {
        let newthemes = response.data.allthemes;
        setThemes(Array.isArray(newthemes) ? newthemes : [newthemes]);
      }
    } catch (error) {
    } finally {
      setIsNewTheme(false);
      setAddTheme("");
    }
  };
  useEffect(() => {
    console.log(themes);
  }, [themes]);

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
