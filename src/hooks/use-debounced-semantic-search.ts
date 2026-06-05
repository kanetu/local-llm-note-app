import { useEffect, useRef, useState } from "react";
import type { SearchResult } from "../lib/db";
import { searchNotesByEmbedding } from "../lib/db";
import { getEmbeddingFromText } from "../lib/embedding";

type UseDebouncedSemanticSearchParams = {
  query: string;
  debounceMs: number;
  topK?: number;
  onError: (message: string) => void;
};

export function useDebouncedSemanticSearch({
  query,
  debounceMs,
  topK = 3,
  onError,
}: Readonly<UseDebouncedSemanticSearchParams>) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRequestIdRef = useRef(0);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      searchRequestIdRef.current += 1;
      setResults([]);
      setIsSearching(false);
      return;
    }

    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;

    const timeoutId = globalThis.setTimeout(() => {
      void (async () => {
        onError("");

        try {
          setIsSearching(true);

          const queryEmbedding = await getEmbeddingFromText(trimmedQuery);
          const semanticResults = await searchNotesByEmbedding(
            queryEmbedding,
            topK,
          );

          if (requestId !== searchRequestIdRef.current) {
            return;
          }

          setResults(semanticResults);
        } catch (searchError) {
          if (requestId !== searchRequestIdRef.current) {
            return;
          }

          onError(
            searchError instanceof Error
              ? searchError.message
              : "Failed to search notes",
          );
        } finally {
          if (requestId === searchRequestIdRef.current) {
            setIsSearching(false);
          }
        }
      })();
    }, debounceMs);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
  }, [debounceMs, onError, query, topK]);

  return {
    results,
    isSearching,
  };
}
