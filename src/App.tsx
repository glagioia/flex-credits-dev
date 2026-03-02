import { JSX, useState, useEffect } from "react";
import UniversalPricingCalculator from "./calculator/components";
import { PdfTestPage } from "./calculator/pdf/PdfTestPage";
import { initGA } from "./calculator/utils/analytics";
import "./App.css";

function App(props: { id?: string }): JSX.Element {
  const [forceView, setForceView] = useState<'auto' | 'desktop' | 'mobile'>('auto');
  const isPdfTest = import.meta.env.DEV && window.location.pathname === '/pdf-test';

  useEffect(() => {
    initGA();
  }, []);

  const idFromUrl = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("id");
  const estimationId = props.id || idFromUrl || undefined;

  if (isPdfTest) {
    return <PdfTestPage />;
  }

  // Botón de desarrollo para forzar la vista
  const DevToggle = () => (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end gap-2">
      <a
        href="/pdf-test"
        className="rounded bg-amber-500 px-3 py-1 text-xs font-bold text-white hover:bg-amber-600"
      >
        PDF Test
      </a>
      <div className="flex gap-2">
      {(['auto', 'desktop', 'mobile'] as const).map((view) => (
        <button
          key={view}
          onClick={() => setForceView(view)}
          className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
            forceView === view 
              ? 'bg-purple-600 text-white shadow-lg' 
              : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'
          }`}
        >
          {view.toUpperCase()}
        </button>
      ))}
      </div>
    </div>
  );

  return (
    <div style={{ minWidth: '375px' }}>
      <UniversalPricingCalculator forceView={forceView} estimationId={estimationId} />
    </div>
  );
}

export default App;
