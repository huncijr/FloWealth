import {
  useState,
  createContext,
  type ReactNode,
  useEffect,
  useContext,
} from "react";
import { api } from "../api/axiosInstance";

export interface UserData {
  id: number;
  email: string;
  name: string;
  isGoogleUser: boolean;
  picture?: string;
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
  }, []);
  // useEffect(() => {
  //   console.log(user);
  // }, [user]);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within Userprovider");
  }
  return context;
};
