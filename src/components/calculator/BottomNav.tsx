import { Calculator, History, Settings } from "lucide-react";

export function BottomNav() {
  return (
    <nav className="bg-card/90 backdrop-blur-lg fixed bottom-0 inset-x-0 z-50 border-t border-border shadow-warm-lg">
      <div className="max-w-2xl mx-auto flex justify-around items-center h-20 pb-4">
        <button
          type="button"
          className="flex flex-col items-center justify-center text-primary p-2"
          aria-current="page"
        >
          <Calculator className="h-6 w-6" fill="currentColor" strokeWidth={1.5} />
          <span className="text-[10px] font-bold uppercase mt-1">Calculator</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center justify-center text-muted-foreground p-2 hover:text-foreground transition-colors"
        >
          <History className="h-6 w-6" />
          <span className="text-[10px] font-bold uppercase mt-1">History</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center justify-center text-muted-foreground p-2 hover:text-foreground transition-colors"
        >
          <Settings className="h-6 w-6" />
          <span className="text-[10px] font-bold uppercase mt-1">Settings</span>
        </button>
      </div>
    </nav>
  );
}
