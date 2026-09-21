import { createContext, useContext, useState, useCallback } from "react";

const PageHeaderContext = createContext(null);

export function PageHeaderProvider({ children }) {
  const [title, setTitle] = useState("Tableau de bord");
  const [subtitle, setSubtitle] = useState(
    "Plateforme de gestion de la promotion immobilière — Dakar.",
  );

  const setPageHeader = useCallback((newTitle, newSubtitle = "") => {
    setTitle(newTitle);
    setSubtitle(newSubtitle);
  }, []);

  return (
    <PageHeaderContext.Provider value={{ title, subtitle, setPageHeader }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  const context = useContext(PageHeaderContext);
  if (!context)
    throw new Error(
      "usePageHeader doit être utilisé à l'intérieur d'un <PageHeaderProvider>",
    );
  return context;
}
