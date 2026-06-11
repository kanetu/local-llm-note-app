import { cn } from "@/lib/utils";
import { SearchModule } from "../notes/search-module";
import { AddNoteModule } from "../notes/add-note-module";
import { SettingsModule } from "../settings/settings-module";
import type { NotesModuleRef } from "../notes/notes-module";
import { useMobileActions } from "@/contexts/mobile-actions-context";

type BubbleButtonsPaneProps = {
  noteModuleRef: React.RefObject<NotesModuleRef | null>;
  setError: (message: string) => void;
  setStatus: (status: string) => void;
  refreshNotes: (preferredNoteId?: string) => Promise<void>;
};

export function BubbleButtonsPane({
  noteModuleRef,
  setError,
  setStatus,
  refreshNotes,
}: Readonly<BubbleButtonsPaneProps>) {
  const { isPaneOpen } = useMobileActions();

  return (
    <div
      className={cn(
        "fixed w-30 h-30 md:h-35 bottom-[calc(50%-50px)] right-0 rounded-lg p-2 z-50 md:flex flex-col items-center gap-2 hidden",
        {
          "flex opacity-100 transition-all ": isPaneOpen,
          "opacity-0 md:opacity-100 transition-all": !isPaneOpen,
        },
      )}
    >
      <SearchModule
        onSelectNoteById={(noteId: string) => {
          noteModuleRef.current?.selectNoteById(noteId);
        }}
        searchDebounceMs={400}
      />
      <AddNoteModule
        onNoteCreated={(noteId) => refreshNotes(noteId)}
        onError={setError}
        onStatusChange={setStatus}
      />
      <SettingsModule
        onError={setError}
        onStatusChange={setStatus}
        onImported={() => refreshNotes()}
      />
    </div>
  );
}
