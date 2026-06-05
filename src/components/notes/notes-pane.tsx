import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Controller, useForm } from "react-hook-form";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import type { NoteDocType } from "../../lib/db";
import { getContentPreview } from "./note-helpers";
import { BotIcon, TrashIcon } from "lucide-react";

type NotesPaneProps = {
  selectedNote: NoteDocType | null;
  notes: NoteDocType[];
  status: string;
  error: string;
  editTitle: string;
  editContent: string;
  isUpdating: boolean;
  isDeleting: boolean;
  onEditTitleChange: (value: string) => void;
  onEditContentChange: (value: string) => void;
  onBack: () => void;
  onDeleteSelectedNote: () => Promise<void>;
  onQuickDeleteNote: (note: NoteDocType) => Promise<void>;
  onSelectNote: (note: NoteDocType) => void;
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
  onEditTitleChange,
  onEditContentChange,
  onBack,
  onDeleteSelectedNote,
  onQuickDeleteNote,
  onSelectNote,
}: Readonly<NotesPaneProps>) {
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
      <Card className="shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center justify-between w-full gap-2">
              <Button variant="link" onClick={onBack}>
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
                  {isUpdating ? "Auto-saving..." : "Saved"}
                </Badge>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Created {new Date(selectedNote.createdAt).toLocaleString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <div>
                <Label htmlFor="title" className="mb-2">
                  Title
                </Label>
                <Input
                  id="title"
                  placeholder="Title"
                  name={field.name}
                  ref={field.ref}
                  value={editTitle}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(event);
                    onEditTitleChange(event.target.value);
                  }}
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name="content"
            render={({ field }) => (
              <div>
                <Label htmlFor="content" className="mb-2">
                  Content
                </Label>{" "}
                <Textarea
                  placeholder="Note content"
                  id="content"
                  className="min-h-[50dvh]"
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
          <div className="flex justify-end">
            <Button
              variant="destructive"
              onClick={() => void onDeleteSelectedNote()}
              disabled={isDeleting}
            >
              <TrashIcon className="size-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
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
        <div className="flex flex-col gap-2">
          {notes.length === 0 ? (
            <p className="text-sm text-slate-500">
              No notes yet. Use the + button.
            </p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="flex group  items-start gap-2 rounded-lg border border-transparent bg-slate-50 p-2 transition hover:border-teal-300"
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 hover:bg-transparent justify-start cursor-pointer p-1 text-left"
                  onClick={() => onSelectNote(note)}
                >
                  <p className="font-medium text-slate-900">{note.title}</p>
                  <p className="text-xs text-slate-500">
                    {getContentPreview(note.content)}
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
            ))
          )}
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
