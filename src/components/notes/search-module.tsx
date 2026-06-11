import { useEffect, useState } from "react";
import { useDebouncedSemanticSearch } from "../../hooks/use-debounced-semantic-search";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { SearchFab } from "./search-fab";

type SearchModuleProps = {
  onSelectNoteById: (noteId: string) => void;
  searchDebounceMs?: number;
};

export function SearchModule({
  onSelectNoteById,
  searchDebounceMs = 400,
}: Readonly<SearchModuleProps>) {
  const [query, setQuery] = useState("");
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "p") {
        event.preventDefault();
        setIsCommandOpen(true);
      }
    };

    globalThis.window.addEventListener("keydown", handleKeyDown);

    return () => {
      globalThis.window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const { results, isSearching } = useDebouncedSemanticSearch({
    query,
    debounceMs: searchDebounceMs,
    topK: 5,
  });

  const handleCommandOpenChange = (open: boolean) => {
    setIsCommandOpen(open);

    if (!open) {
      setQuery("");
    }
  };

  return (
    <>
      <SearchFab onClick={() => setIsCommandOpen(true)} />

      <CommandDialog
        open={isCommandOpen}
        onOpenChange={handleCommandOpenChange}
        title="Search Notes"
        className="top-8"
        description="Search notes by semantic meaning"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search note meaning"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-[60vh] overflow-y-auto">
            {isSearching ? (
              <CommandGroup heading="Status">
                <CommandItem disabled>Searching...</CommandItem>
              </CommandGroup>
            ) : null}
            <CommandEmpty>Run a search to show ranked notes.</CommandEmpty>
            <CommandGroup heading={`Top Results (${results.length})`}>
              {results.map((result, index) => (
                <CommandItem
                  key={result.note.id}
                  value={`${result.note.id}-${result.note.title}`}
                  onSelect={() => {
                    onSelectNoteById(result.note.id);
                    setIsCommandOpen(false);
                  }}
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-medium">{`Top ${index + 1} - ${result.note.title}`}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {result.note.content || "No content"}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {result.score.toFixed(3)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
