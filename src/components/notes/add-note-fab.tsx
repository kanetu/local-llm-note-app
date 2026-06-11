import { PlusIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useMobileActions } from "@/contexts/mobile-actions-context";

type AddNoteFabProps = {
  onClick: () => void;
};

export function AddNoteFab({ onClick }: Readonly<AddNoteFabProps>) {
  const { closePane } = useMobileActions();

  return (
    <Button
      type="button"
      className={`absolute bottom-0 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-600 text-white shadow-xl transition duration-300 hover:scale-105 hover:bg-slate-500 md:bottom-0 md:right-4 md:z-50 md:pointer-events-auto md:translate-y-0 md:opacity-100`}
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
