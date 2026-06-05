import { useEffect, useRef, useState } from "react";
import type { NoteDocType } from "../lib/db";
import { saveNoteWithEmbedding } from "../lib/db";
import { getEmbeddingFromText } from "../lib/embedding";

type UseAutoSaveNoteParams = {
  selectedNote: NoteDocType | null;
  editTitle: string;
  editContent: string;
  debounceMs: number;
  onError: (message: string) => void;
  onStatusChange: (status: string) => void;
  refreshNotes: (preferredNoteId?: string) => Promise<void>;
};

export function useAutoSaveNote({
  selectedNote,
  editTitle,
  editContent,
  debounceMs,
  onError,
  onStatusChange,
  refreshNotes,
}: Readonly<UseAutoSaveNoteParams>) {
  const [isUpdating, setIsUpdating] = useState(false);
  const saveRequestIdRef = useRef(0);

  useEffect(() => {
    if (!selectedNote) {
      saveRequestIdRef.current += 1;
      setIsUpdating(false);
      return;
    }

    const nextTitle = editTitle.trim();
    const nextContent = editContent.trim();
    const isDirty =
      nextTitle !== selectedNote.title || nextContent !== selectedNote.content;

    if (!isDirty) {
      setIsUpdating(false);
      return;
    }

    if (!nextTitle || !nextContent) {
      setIsUpdating(false);
      return;
    }

    // Reflect pending auto-save immediately while waiting for debounce.
    setIsUpdating(true);

    const requestId = saveRequestIdRef.current + 1;
    saveRequestIdRef.current = requestId;

    const timeoutId = globalThis.setTimeout(() => {
      void (async () => {
        onError("");

        try {
          onStatusChange("Auto-saving note...");

          const embedding = await getEmbeddingFromText(
            `${nextTitle}\n${nextContent}`,
          );

          await saveNoteWithEmbedding(
            {
              ...selectedNote,
              title: nextTitle,
              content: nextContent,
            },
            embedding,
          );

          if (requestId !== saveRequestIdRef.current) {
            return;
          }

          await refreshNotes(selectedNote.id);
          onStatusChange("All changes saved");
        } catch (updateError) {
          if (requestId !== saveRequestIdRef.current) {
            return;
          }

          onError(
            updateError instanceof Error
              ? updateError.message
              : "Failed to auto-save note",
          );
        } finally {
          if (requestId === saveRequestIdRef.current) {
            setIsUpdating(false);
          }
        }
      })();
    }, debounceMs);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
  }, [
    debounceMs,
    editContent,
    editTitle,
    onError,
    onStatusChange,
    refreshNotes,
    selectedNote,
  ]);

  return {
    isUpdating,
  };
}
