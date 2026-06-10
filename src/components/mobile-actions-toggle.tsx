import { ChevronLeft, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useMobileActions } from "@/contexts/mobile-actions-context";

export function MobileActionsToggle() {
  const { isPaneOpen, togglePane } = useMobileActions();

  return (
    <Button
      type="button"
      className="fixed p-1 bottom-[calc(50%-5px)] right-[-12px] justify-start z-50 h-8 w-8 rounded-full bg-slate-900 text-white shadow-xl transition hover:scale-105 hover:bg-slate-800 md:hidden"
      onClick={togglePane}
      aria-label={isPaneOpen ? "Close quick actions" : "Open quick actions"}
    >
      {isPaneOpen ? (
        <XIcon width={20} height={20} />
      ) : (
        <ChevronLeft width={20} height={20} />
      )}
    </Button>
  );
}
