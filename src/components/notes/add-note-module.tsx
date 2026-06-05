import { useMemo, useState, type ComponentProps } from "react";
import { v4 as uuidv4 } from "uuid";
import { saveNoteWithEmbedding } from "@/lib/db";
import { AddNoteFab } from "./add-note-fab";
import { getEmbeddingFromText } from "@/lib/embedding";
import { useMenuControl } from "@/contexts/menu-control-context";
import { AddNoteDialog } from "./add-note-dialog";

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type AddNoteModuleProps = {
  onNoteCreated: () => Promise<void>;
  onError: (message: string) => void;
  onStatusChange: (status: string) => void;
};

export function AddNoteModule({
  onNoteCreated,
  onError,
  onStatusChange,
}: Readonly<AddNoteModuleProps>) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { isMenuOpen, openMenuByType, closeMenu } = useMenuControl();
  const isOpen = isMenuOpen("add-note");

  const canSave = useMemo(
    () => title.trim().length > 0 && content.trim().length > 0 && !isCreating,
    [content, isCreating, title],
  );

  const clearForm = () => {
    setTitle("");
    setContent("");
  };

  const closeDialog = () => {
    clearForm();
    closeMenu();
  };

  const toggleDialog = () => {
    if (isOpen) {
      closeDialog();
      return;
    }

    openMenuByType("add-note");
  };

  const handleCreateNote = async (event: FormSubmitEvent) => {
    event.preventDefault();
    onError("");

    if (!canSave) {
      return;
    }

    try {
      setIsCreating(true);
      onStatusChange("Creating embedding and saving note...");

      const normalizedTitle = title.trim();
      const normalizedContent = content.trim();
      const embedding = await getEmbeddingFromText(
        `${normalizedTitle}\n${normalizedContent}`,
      );

      await saveNoteWithEmbedding(
        {
          id: uuidv4(),
          title: normalizedTitle,
          content: normalizedContent,
          createdAt: Date.now(),
        },
        embedding,
      );

      await onNoteCreated();
      closeDialog();
      onStatusChange("Saved note with vector embedding");
    } catch (saveError) {
      onError(
        saveError instanceof Error ? saveError.message : "Failed to save note",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <AddNoteDialog
        isOpen={isOpen}
        addTitle={title}
        addContent={content}
        canSave={canSave}
        isCreating={isCreating}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onClose={closeDialog}
        onSubmit={handleCreateNote}
      />

      <AddNoteFab onClick={toggleDialog} />
    </>
  );
}
