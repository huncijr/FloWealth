import { useState, createContext, type ReactNode, useEffect } from "react";
import { api } from "../api/axiosInstance";

interface UserData {
  id: number;
  email: string;
  name: string;
}
interface userContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
}
const UserContext = createContext<userContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.get("/getUser");
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  });
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {!loading && children}
    </UserContext.Provider>
  );
};
