import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useImperativeHandle, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import type { NoteDocType } from "../../lib/db";
import { BotIcon, PenIcon, TrashIcon, XIcon } from "lucide-react";
import { RenameTitleDialog } from "./add-note-dialog";

type NotesPaneProps = {
  selectedNote: NoteDocType | null;
  notes: NoteDocType[];
  status: string;
  error: string;
  editTitle: string;
  editContent: string;
  isUpdating: boolean;
  isDeleting: boolean;
  ref?: React.Ref<NotesPaneRef>;
  onEditTitleChange: (value: string) => void;
  onEditContentChange: (value: string) => void;
  onBack: () => void;
  onDeleteSelectedNote: () => Promise<void>;
  onQuickDeleteNote: (note: NoteDocType) => Promise<void>;
  onSelectNote: (note: NoteDocType) => void;
};

export type NotesPaneRef = {
  openRenameDialog: () => void;
};


type NoteDayGroup = {
  dayKey: number;
  label: string;
  notes: NoteDocType[];
};

export function NotesPane({
  selectedNote,
  notes,
  status,
  error,
  editTitle,
  editContent,
  isUpdating,
  isDeleting,
  ref,
  onEditTitleChange,
  onEditContentChange,
  onBack,
  onDeleteSelectedNote,
  onQuickDeleteNote,
  onSelectNote,
}: Readonly<NotesPaneProps>) {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);


  useImperativeHandle(ref, () => ({
    openRenameDialog: () => {
      setIsRenameDialogOpen(true);
    }
  }));

  const groupedNotes = useMemo<NoteDayGroup[]>(() => {
    const groups = new Map<number, NoteDocType[]>();

    for (const note of notes) {
      const createdAtDate = new Date(note.createdAt);
      const dayKey = new Date(
        createdAtDate.getFullYear(),
        createdAtDate.getMonth(),
        createdAtDate.getDate(),
      ).getTime();

      const existing = groups.get(dayKey);
      if (existing) {
        existing.push(note);
      } else {
        groups.set(dayKey, [note]);
      }
    }

    const today = new Date();
    const todayKey = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    ).getTime();
    const yesterdayKey = todayKey - 24 * 60 * 60 * 1000;

    return [...groups.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([dayKey, dayNotes]) => {
        let label: string;

        if (dayKey === todayKey) {
          label = "Today";
        } else if (dayKey === yesterdayKey) {
          label = "Yesterday";
        } else {
          label = new Date(dayKey).toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        }

        const sortedDayNotes = [...dayNotes];
        sortedDayNotes.sort((a, b) => b.createdAt - a.createdAt);

        return {
          dayKey,
          label,
          notes: sortedDayNotes,
        };
      });
  }, [notes]);

  const { control } = useForm<{
    title: string;
    content: string;
  }>({
    defaultValues: {
      title: editTitle,
      content: editContent,
    },
  });

  if (selectedNote) {
    return (
      <Card className="ring-0">
        <CardHeader className="space-y-4 px-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center justify-between w-full gap-2">
              <Button variant="link" className="p-0" onClick={onBack}>
                <ArrowLeftIcon />
                Back
              </Button>

              <div className="flex items-center gap-2">
                <Badge
                  className={
                    isUpdating
                      ? "border-amber-200 bg-amber-100 text-amber-900"
                      : "border-emerald-200 bg-emerald-100 text-emerald-900"
                  }
                >
                  Status: {isUpdating ? "Auto-saving..." : "Saved"}
                </Badge>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Created {new Date(selectedNote.createdAt).toLocaleString()}
          </p>
        </CardHeader>
        <CardContent className=" px-0">
          <div className="flex items-center w-fit gap-2 rounded-tl-lg rounded-tr-lg border border-slate-200 px-2 text-xs ">
            <div>
              <p className="font-medium text-slate-900">{editTitle}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsRenameDialogOpen(true)}
              className="hover:bg-transparent hover:text-blue-500 cursor-pointer p-1"
            >
              <PenIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => void onDeleteSelectedNote()}
              disabled={isDeleting}
              className="hover:bg-transparent hover:text-red-500 cursor-pointer p-1"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
          <Controller
            control={control}
            name="content"
            render={({ field }) => (
              <div>
                <Textarea
                  placeholder="Note content"
                  id="content"
                  className="min-h-[50dvh] rounded-none rounded-bl-lg rounded-tr-lg rounded-br-lg focus:ring-0 focus-visible:ring-0 forcus-visible:border-ring-0"
                  name={field.name}
                  ref={field.ref}
                  value={editContent}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(event);
                    onEditContentChange(event.target.value);
                  }}
                  rows={18}
                />
              </div>
            )}
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </CardContent>

        <RenameTitleDialog
          isOpen={isRenameDialogOpen}
          currentTitle={editTitle}
          onClose={() => setIsRenameDialogOpen(false)}
          onConfirm={(newTitle) => {
            onEditTitleChange(newTitle);
            setIsRenameDialogOpen(false);
          }}
        />
      </Card>
    );
  }

  return (
    <Card className="ring-0">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle>All Notes</CardTitle>
            <Badge className="border-teal-200 bg-teal-100 text-teal-900">
              {notes.length}
            </Badge>
          </div>
          <div className="text-sm flex items-center text-slate-500 gap-2">
            <p className="border-slate-400 border px-2 rounded-xl">{status}</p>
            <BotIcon />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-8">
          {notes.length === 0 ? (
            <p className="text-sm text-slate-500">
              No notes yet. Use the + button.
            </p>
          ) : (
            groupedNotes.map((group) => (
              <div key={group.dayKey} className="space-y-2">
                <p className="px-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  {group.label}
                </p>

                {group.notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex group items-start justify-between gap-2 rounded-lg border border-transparent bg-slate-50 p-2 transition hover:border-teal-300"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 max-w-11/12 hover:bg-transparent justify-start cursor-pointer p-1 text-left"
                      onClick={() => onSelectNote(note)}
                    >
                      <p className="font-medium text-slate-900">{note.title}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {note.content}
                      </p>
                    </Button>

                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="invisible cursor-pointer group-hover:visible"
                      disabled={isDeleting}
                      onClick={() => void onQuickDeleteNote(note)}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
