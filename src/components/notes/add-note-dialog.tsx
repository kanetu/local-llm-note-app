import { Cross2Icon } from "@radix-ui/react-icons";
import { type ComponentProps } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type AddNoteDialogProps = {
  isOpen: boolean;
  addTitle: string;
  addContent: string;
  canSave: boolean;
  isCreating: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormSubmitEvent) => Promise<void>;
};

export function AddNoteDialog({
  isOpen,
  addTitle,
  addContent,
  canSave,
  isCreating,
  onTitleChange,
  onContentChange,
  onClose,
  onSubmit,
}: Readonly<AddNoteDialogProps>) {
  const { control } = useForm<{
    title: string;
    content: string;
  }>({
    defaultValues: {
      title: addTitle,
      content: addContent,
    },
  });

  if (!isOpen) {
    return null;
  }

  const handleClearForm = () => {
    onTitleChange("");
    onContentChange("");
  };

  const handleClose = () => {
    handleClearForm();
    onClose();
  };

  return (
    <Card className="fixed bottom-24 right-4 z-40 w-[min(520px,calc(100vw-2rem))] shadow-2xl md:right-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Add Note</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          aria-label="Close add note section"
        >
          <Cross2Icon />
        </Button>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={(event) => void onSubmit(event)}>
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
                  value={addTitle}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(event);
                    onTitleChange(event.target.value);
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
                  Title
                </Label>
                <Textarea
                  id="content"
                  placeholder="Write your note content..."
                  name={field.name}
                  ref={field.ref}
                  value={addContent}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(event);
                    onContentChange(event.target.value);
                  }}
                  rows={7}
                  className="scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-slate-300 scrollbar-track-slate-100 max-h-[50dvh]"
                />
              </div>
            )}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClearForm}
              disabled={isCreating}
            >
              Clear
            </Button>
            <Button type="submit" disabled={!canSave}>
              {isCreating ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
