import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";
import type { SearchResult } from "../../lib/db";
import { getContentPreview, getRankColor } from "./note-helpers";

type SearchPaneProps = {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  onQueryChange: (value: string) => void;
  onSelectNoteById: (noteId: string) => void;
};

export function SearchPane({
  query,
  results,
  isSearching,
  onQueryChange,
  onSelectNoteById,
}: Readonly<SearchPaneProps>) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-4">
        <CardTitle>Search Notes</CardTitle>
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search note meaning"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
        {isSearching ? (
          <p className="text-sm text-slate-500">Searching...</p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Top Results</p>
          <Badge className="border-blue-200 bg-blue-100 text-blue-900">
            {results.length}
          </Badge>
        </div>

        {results.length === 0 ? (
          <p className="text-sm text-slate-500">
            Run a search to show ranked notes.
          </p>
        ) : (
          results.map((result, index) => {
            const rank = index + 1;
            return (
              <button
                key={result.note.id}
                type="button"
                className="w-full rounded-lg border border-transparent bg-slate-50 p-3 text-left transition hover:border-sky-300"
                onClick={() => onSelectNoteById(result.note.id)}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <Badge className={cn("border", getRankColor(rank))}>
                      Top {rank}
                    </Badge>
                    <p className="text-xs text-slate-500">
                      score ref {result.score.toFixed(3)}
                    </p>
                  </div>
                  <p className="font-medium text-slate-900">
                    {result.note.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {getContentPreview(result.note.content)}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
