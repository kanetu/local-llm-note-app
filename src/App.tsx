import { useEffect, useRef, useState } from "react";
import {
  NotesModule,
  type NotesModuleRef,
} from "@/components/notes/notes-module";
import { getAllNotes, getDatabase, saveNoteWithEmbedding, type NoteDocType } from "@/lib/db";
import { getEmbeddingFromText, warmupLocalEmbedding } from "@/lib/embedding";
import { MenuControlProvider } from "@/contexts/menu-control-context";
import { MobileActionsProvider } from "@/contexts/mobile-actions-context";
import { MobileActionsToggle } from "@/components/mobile-actions-toggle";
import { BubbleButtonsPane } from "./components/bubble-buttons-pane/bubble-buttons-pane";
import { useShortcut } from "./components/shortcut/shortcut";
import { generateDefaultTitle } from "./lib/utils";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [notes, setNotes] = useState<NoteDocType[]>([]);
  const [status, setStatus] = useState("Initializing app...");
  const [error, setError] = useState("");
  const [pendingSelectNoteId, setPendingSelectNoteId] = useState<string | null>(
    null,
  );
  

  const noteModuleRef = useRef<NotesModuleRef>(null);

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

  const handleCreate = async () => {
    setStatus("Creating note...");

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

      await refreshNotes(noteId);
      setStatus("Note created");
  }

  const handleEditNoteTitle = () =>{
    noteModuleRef.current?.openEditTitleDialog()
  }

  useShortcut({
    onHandleAltN: handleCreate,
    onHandleAltR: handleEditNoteTitle
  })

  return (
    <main className="min-h-screen px-4 md:py-8 md:px-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-3">
        
        <NotesModule
          notes={notes}
          status={status}
          error={error}
          onError={setError}
          onStatusChange={setStatus}
          refreshNotes={refreshNotes}
          pendingSelectNoteId={pendingSelectNoteId}
          onPendingSelectHandled={() => setPendingSelectNoteId(null)}
          ref={noteModuleRef}
          autoSaveDebounceMs={3000}
        />
      </div>
      <MobileActionsProvider>
        <MenuControlProvider>
          <BubbleButtonsPane
            noteModuleRef={noteModuleRef}
            setError={setError}
            setStatus={setStatus}
            refreshNotes={refreshNotes}
          />
        </MenuControlProvider>
        <MobileActionsToggle />
      </MobileActionsProvider>
    </main>
  );
}

export default App;
