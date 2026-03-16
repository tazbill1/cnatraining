import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Dealership {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

interface DealershipContextType {
  dealerships: Dealership[];
  selectedDealershipId: string | null;
  selectedDealership: Dealership | null;
  setSelectedDealershipId: (id: string | null) => void;
  isFiltering: boolean;
  loading: boolean;
  /** When set, pages like Learn/Practice render as if the admin belongs to this dealership */
  previewDealershipId: string | null;
  previewDealership: Dealership | null;
  setPreviewDealershipId: (id: string | null) => void;
  isPreviewing: boolean;
}

const DealershipContext = createContext<DealershipContextType | undefined>(undefined);

export function DealershipProvider({ children }: { children: ReactNode }) {
  const { isSuperAdmin, user } = useAuth();
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [selectedDealershipId, setSelectedDealershipId] = useState<string | null>(null);
  const [previewDealershipId, setPreviewDealershipId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSuperAdmin && user) {
      setLoading(true);
      supabase
        .from("dealerships")
        .select("id, name, slug, is_active")
        .order("name")
        .then(({ data }) => {
          setDealerships(data || []);
          setLoading(false);
        });
    }
  }, [isSuperAdmin, user]);

  const selectedDealership = dealerships.find((d) => d.id === selectedDealershipId) || null;
  const previewDealership = dealerships.find((d) => d.id === previewDealershipId) || null;

  return (
    <DealershipContext.Provider
      value={{
        dealerships,
        selectedDealershipId,
        selectedDealership,
        setSelectedDealershipId,
        isFiltering: !!selectedDealershipId,
        loading,
        previewDealershipId,
        previewDealership,
        setPreviewDealershipId,
        isPreviewing: !!previewDealershipId,
      }}
    >
      {children}
    </DealershipContext.Provider>
  );
}

export function useDealershipContext() {
  const context = useContext(DealershipContext);
  if (!context) {
    throw new Error("useDealershipContext must be used within DealershipProvider");
  }
  return context;
}
