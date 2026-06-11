import { SearchIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useMobileActions } from "@/contexts/mobile-actions-context";

type SearchFabProps = {
  onClick: () => void;
};

export function SearchFab({ onClick }: Readonly<SearchFabProps>) {
  const { closePane } = useMobileActions();

  return (
    <Button
      type="button"
      className={`absolute top-0 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-white shadow-xl transition duration-300 hover:scale-105 hover:bg-slate-600 md:right-4 md:z-39 md:pointer-events-auto md:translate-y-0 md:opacity-100`}
      onClick={() => {
        onClick();
        closePane();
      }}
      aria-label="Open search"
    >
      <SearchIcon width={22} height={22} />
    </Button>
  );
}
