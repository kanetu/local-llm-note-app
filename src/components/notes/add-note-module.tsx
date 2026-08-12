import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { saveNoteWithEmbedding } from "@/lib/db";
import { AddNoteFab } from "./add-note-fab";
import { getEmbeddingFromText } from "@/lib/embedding";
import { generateDefaultTitle } from "@/lib/utils";

type AddNoteModuleProps = {
  onNoteCreated: (noteId: string) => Promise<void>;
  onError: (message: string) => void;
  onStatusChange: (status: string) => void;
};

export function AddNoteModule({
  onNoteCreated,
  onError,
  onStatusChange,
}: Readonly<AddNoteModuleProps>) {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateNote = async () => {
    if (isCreating) {
      return;
    }

    onError("");

    try {
      setIsCreating(true);
      onStatusChange("Creating note...");

      const noteId = uuidv4();
      const title = generateDefaultTitle();
      const embedding = await getEmbeddingFromText(title);

      await saveNoteWithEmbedding(
        {
          id: noteId,
          title,
          content: "",
          createdAt: Date.now(),
        },
        embedding,
      );

      await onNoteCreated(noteId);
      onStatusChange("Note created");
    } catch (createError) {
      onError(
        createError instanceof Error
          ? createError.message
          : "Failed to create note",
      );
    } finally {
      setIsCreating(false);
    }
  };

  
  return <AddNoteFab onClick={() => void handleCreateNote()} />;
}
