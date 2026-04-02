import type { DateValue } from "@heroui/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { api } from "../api/axiosInstance";
import { useLoading } from "./LoadingContext";

export interface Product {
  name: string;
  quantity: number | null;
  estprice: number | null;
}

export interface Note {
  id: number;
  theme: string | null;
  color?: string;
  productTitle: string;
  products: Product[];
  completed: boolean;
  estcost: string;
  cost: string;
  estimatedTime: string | null;
  picture?: string | null;
  message?: string | null;
  createdAt: string;
}

export interface AddNotePayload {
  Theme: string | null;
  Color: string;
  ProductTitle: string | null;
  ProductNames: string[];
  Quantities: number[];
  EstPrices: number[];
  Cost: number;
  Date: DateValue | null;
}

export interface UpdateNotePayload {
  id: number;
  theme: string | null;
  color?: string;
  productTitle: string;
  products: Product[];
  estimatedTime: string | null;
  estcost: string;
  picture?: string | null;
  message?: string | null;
  cost?: string | null;
}

export interface CompleteNotePayload {
  picture?: string | null;
  message?: string | null;
  cost?: string | null;
}

interface NotesContextState {
  notes: Note[];
  totalPages: number;
  page: number;
  sortBy: string;
  isloading: boolean;
  error: string | null;

  fetchNotes: (page?: number, sort?: string) => Promise<void>;
  addNote: (payload: AddNotePayload) => Promise<Note | null>;
  updateNote: (payload: UpdateNotePayload) => Promise<boolean>;
  deleteNote: (id: number) => Promise<boolean>;
  completeNote: (id: number, payload: CompleteNotePayload) => Promise<boolean>;
  refreshNotes: () => Promise<void>;

  setPage: (page: number) => void;
  setSortBy: (sort: string) => void;
}

const NotesContext = createContext<NotesContextState | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { isanimationready, hasInitiallyLoaded } = useLoading();

  const [notes, setNotes] = useState<Note[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>("created");
  const [isloading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState<boolean>(false);

  // Fetches paginated notes from the backend with flexible data parsing
  // Handles multiple response formats (nested result arrays, flat arrays, single objects)
  const fetchNotes = useCallback(
    async (fetchPage?: number, fetchSort?: string) => {
      if (!user) return;

      const currentPage = fetchPage ?? page;
      const currentSort = fetchSort ?? sortBy;

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get("/getnotes", {
          params: { page: currentPage, sort: currentSort },
        });

        if (response.data.success) {
          let allnotes: Note[] = [];
          const notedata = response.data.note;

          // Normalize various backend response structures into a flat array
          if (notedata?.result && Array.isArray(notedata)) {
            allnotes = notedata.flat();
          } else if (Array.isArray(notedata)) {
            allnotes = notedata;
          } else if (notedata) {
            allnotes = [notedata];
          }

          setNotes(allnotes);
          setTotalPages(response.data.totalPages || 1);
          setHasFetched(true);
        }
      } catch (err) {
        setError("Failed to fetch notes");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [user, page, sortBy],
  );

  useEffect(() => {
    if (user && !hasFetched) {
      fetchNotes();
    }
  }, [user, isanimationready, hasInitiallyLoaded, hasFetched, fetchNotes]);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setPage(1);
      setTotalPages(1);
      setHasFetched(false);
    }
  }, [user]);

  const refreshNotes = useCallback(async () => {
    await fetchNotes();
  }, [fetchNotes]);

  const addNote = useCallback(
    async (payload: AddNotePayload): Promise<Note | null> => {
      try {
        const response = await api.post("/addnote", payload);
        if (response.data.success) {
          const newNote = response.data.note;
          setNotes((prev) => [...prev, newNote]);
          return newNote;
        }
        return null;
      } catch (err) {
        setError("Failed to add note");
        return null;
      }
    },
    [],
  );

  const updateNote = useCallback(
    async (payload: UpdateNotePayload): Promise<boolean> => {
      try {
        const response = await api.patch("/updatenotes", payload);
        if (response.data.success && response.data.changed) {
          setNotes((prev) =>
            prev.map((n) => (n.id === payload.id ? response.data.note : n)),
          );
          return true;
        }
        return false;
      } catch (err) {
        setError("Failed to update note");
        return false;
      }
    },
    [],
  );

  const deleteNote = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await api.delete(`/deletenote/${id}`);
      if (response.data.success) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      setError("Failed to delete note");
      return false;
    }
  }, []);

  const completeNote = useCallback(
    async (id: number, payload: CompleteNotePayload): Promise<boolean> => {
      try {
        const response = await api.post(`/completenote/${id}`, payload);
        if (response.data.success) {
          setNotes((prev) =>
            prev.map((n) => (n.id === id ? response.data.note[0] : n)),
          );
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },
    [],
  );

  useEffect(() => {
    if (user && hasFetched) {
      fetchNotes();
    }
  }, [page, sortBy]);

  useEffect(() => {
    console.log(notes);
  }, [notes]);

  const value: NotesContextState = {
    notes,
    totalPages,
    page,
    sortBy,
    isloading,
    error,
    fetchNotes,
    addNote,
    updateNote,
    deleteNote,
    completeNote,
    refreshNotes,
    setPage,
    setSortBy,
  };

  return (
    <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
  );
};

export const useNotes = (): NotesContextState => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
};
