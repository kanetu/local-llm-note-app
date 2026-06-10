import { PlusIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useMobileActions } from "@/contexts/mobile-actions-context";

type AddNoteFabProps = {
  onClick: () => void;
};

export function AddNoteFab({ onClick }: Readonly<AddNoteFabProps>) {
  const { isPaneOpen, closePane } = useMobileActions();

  return (
    <Button
      type="button"
      className={`fixed right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-600 text-white shadow-xl transition duration-300 hover:scale-105 hover:bg-slate-500 md:bottom-6 md:right-8 md:z-50 ${
        isPaneOpen
          ? "bottom-[calc(40%+32px)] right-2 z-49 opacity-100"
          : "pointer-events-none bottom-[calc(40%+32px)] right-2 z-40 translate-y-2 opacity-0"
      } md:pointer-events-auto md:translate-y-0 md:opacity-100`}
      onClick={() => {
        onClick();
        closePane();
      }}
      aria-label="Create note"
    >
      <PlusIcon width={22} height={22} />
    </Button>
  );
}
