import { useEffect, useMemo, useState } from "react";
import type { NoteDocType } from "../../lib/db";
import { deleteNoteById } from "../../lib/db";
import { useAutoSaveNote } from "../../hooks/use-auto-save-note";
import { useDebouncedSemanticSearch } from "../../hooks/use-debounced-semantic-search";
import { ConfirmDialog } from "../ui/confirm-dialog";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { NotesPane } from "./notes-pane";
import { SearchFab } from "./search-fab";

type NotesSearchModuleProps = {
  notes: NoteDocType[];
  status: string;
  error: string;
  onError: (message: string) => void;
  onStatusChange: (status: string) => void;
  refreshNotes: (preferredNoteId?: string) => Promise<void>;
  pendingSelectNoteId: string | null;
  onPendingSelectHandled: () => void;
  searchDebounceMs?: number;
  autoSaveDebounceMs?: number;
};

export function NotesSearchModule({
  notes,
  status,
  error,
  onError,
  onStatusChange,
  refreshNotes,
  pendingSelectNoteId,
  onPendingSelectHandled,
  searchDebounceMs = 400,
  autoSaveDebounceMs = 700,
}: Readonly<NotesSearchModuleProps>) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [query, setQuery] = useState("");
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<NoteDocType | null>(null);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );

  const handleSelectNote = (note: NoteDocType): void => {
    setSelectedNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleSelectNoteById = (noteId: string): void => {
    const nextNote = notes.find((note) => note.id === noteId);
    if (!nextNote) {
      return;
    }

    handleSelectNote(nextNote);
  };

  useEffect(() => {
    if (!pendingSelectNoteId) {
      return;
    }

    const createdNote = notes.find((note) => note.id === pendingSelectNoteId);
    if (!createdNote) {
      return;
    }

    handleSelectNote(createdNote);
    onPendingSelectHandled();
  }, [notes, onPendingSelectHandled, pendingSelectNoteId]);

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

  const { isUpdating } = useAutoSaveNote({
    selectedNote,
    editTitle,
    editContent,
    debounceMs: autoSaveDebounceMs,
    onError,
    onStatusChange,
    refreshNotes,
  });

  const { results, isSearching } = useDebouncedSemanticSearch({
    query,
    debounceMs: searchDebounceMs,
    topK: 5,
    onError,
  });

  const handleCommandOpenChange = (open: boolean) => {
    setIsCommandOpen(open);

    if (!open) {
      setQuery("");
    }
  };

  const handleDeleteSelectedNote = async (): Promise<void> => {
    if (!selectedNote) {
      return;
    }

    setNoteToDelete(selectedNote);
  };

  const handleQuickDeleteNote = async (note: NoteDocType): Promise<void> => {
    setNoteToDelete(note);
  };

  const handleCancelDelete = () => {
    if (isDeleting) {
      return;
    }

    setNoteToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) {
      return;
    }

    const deletingNote = noteToDelete;
    onError("");

    try {
      setIsDeleting(true);
      onStatusChange("Deleting note...");

      await deleteNoteById(deletingNote.id);
      await refreshNotes();

      if (selectedNoteId === deletingNote.id) {
        setSelectedNoteId(null);
        setEditTitle("");
        setEditContent("");
      }

      onStatusChange("Note deleted");
      setNoteToDelete(null);
    } catch (deleteError) {
      onError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete note",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="order-1 sm:col-span-3">
        <NotesPane
          selectedNote={selectedNote}
          notes={notes}
          status={status}
          error={error}
          editTitle={editTitle}
          editContent={editContent}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
          onEditTitleChange={setEditTitle}
          onEditContentChange={setEditContent}
          onBack={() => {
            setSelectedNoteId(null);
            setEditTitle("");
            setEditContent("");
          }}
          onDeleteSelectedNote={handleDeleteSelectedNote}
          onQuickDeleteNote={handleQuickDeleteNote}
          onSelectNote={handleSelectNote}
        />
      </div>

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
                    handleSelectNoteById(result.note.id);
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

      <ConfirmDialog
        open={Boolean(noteToDelete)}
        title="Delete Note"
        description={
          noteToDelete
            ? `Are you sure you want to delete ${noteToDelete.title}"? You won’t be able to recover it afterward`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isConfirming={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
