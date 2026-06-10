import { useEffect, useState } from "react";
import { AddNoteModule } from "@/components/notes/add-note-module";
import { NotesSearchModule } from "@/components/notes/notes-search-module";
import { SettingsModule } from "@/components/settings/settings-module";
import { getAllNotes, getDatabase, type NoteDocType } from "@/lib/db";
import { warmupLocalEmbedding } from "@/lib/embedding";
import { MenuControlProvider } from "@/contexts/menu-control-context";
import { MobileActionsProvider } from "@/contexts/mobile-actions-context";
import { MobileActionsToggle } from "@/components/mobile-actions-toggle";

function App() {
  const [notes, setNotes] = useState<NoteDocType[]>([]);
  const [status, setStatus] = useState("Initializing app...");
  const [error, setError] = useState("");
  const [pendingSelectNoteId, setPendingSelectNoteId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        setStatus("Opening RxDB...");
        await getDatabase();

        const allNotes = await getAllNotes();
        if (!mounted) {
          return;
        }

        setNotes(allNotes);

        setStatus("Loading MiniLM model (first run can take some time)...");
        await warmupLocalEmbedding();
        if (!mounted) {
          return;
        }

        setStatus("MiniLM ready");
      } catch (appError) {
        if (!mounted) {
          return;
        }

        setError(
          appError instanceof Error
            ? appError.message
            : "Failed to initialize the note app",
        );
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshNotes = async (_preferredNoteId?: string): Promise<void> => {
    const allNotes = await getAllNotes();
    setNotes(allNotes);

    if (_preferredNoteId) {
      setPendingSelectNoteId(_preferredNoteId);
    }
  };

  return (
    <main className="min-h-screen px-4 md:py-8 md:px-10">
      <MobileActionsProvider>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-3">
          <NotesSearchModule
            notes={notes}
            status={status}
            error={error}
            onError={setError}
            onStatusChange={setStatus}
            refreshNotes={refreshNotes}
            pendingSelectNoteId={pendingSelectNoteId}
            onPendingSelectHandled={() => setPendingSelectNoteId(null)}
          />
        </div>

        <MenuControlProvider>
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
        </MenuControlProvider>

        <MobileActionsToggle />
      </MobileActionsProvider>
    </main>
  );
}

export default App;
