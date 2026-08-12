import { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { NoteDocType } from "../../lib/db";
import { deleteNoteById } from "../../lib/db";
import { useAutoSaveNote } from "../../hooks/use-auto-save-note";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { NotesPane, type NotesPaneRef } from "./notes-pane";

type NotesModuleProps = {
  notes: NoteDocType[];
  status: string;
  error: string;
  onError: (message: string) => void;
  onStatusChange: (status: string) => void;
  refreshNotes: (preferredNoteId?: string) => Promise<void>;
  pendingSelectNoteId: string | null;
  onPendingSelectHandled: () => void;
  autoSaveDebounceMs?: number;
  ref?: React.Ref<NotesModuleRef>;
};

export type NotesModuleRef = {
  selectNoteById: (noteId: string) => void;
  openEditTitleDialog: () => void;
};

export function NotesModule({
  notes,
  status,
  error,
  onError,
  onStatusChange,
  refreshNotes,
  pendingSelectNoteId,
  onPendingSelectHandled,
  autoSaveDebounceMs = 1000,
  ref,
}: Readonly<NotesModuleProps>) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<NoteDocType | null>(null);
  const notesPaneRef = useRef<NotesPaneRef>(null);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );

  const handleSelectNote = (note: NoteDocType): void => {
    setSelectedNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  useImperativeHandle(ref, () => ({
    selectNoteById: (noteId: string) => {
      const nextNote = notes.find((note) => note.id === noteId);
      if (!nextNote) {
        return;
      }

      handleSelectNote(nextNote);
    },
    openEditTitleDialog: () => {
      notesPaneRef.current?.openRenameDialog()
    }
  }));

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

  const { isUpdating } = useAutoSaveNote({
    selectedNote,
    editTitle,
    editContent,
    debounceMs: autoSaveDebounceMs,
    onError,
    onStatusChange,
    refreshNotes,
  });

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
          ref={notesPaneRef}
        />
      </div>

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
