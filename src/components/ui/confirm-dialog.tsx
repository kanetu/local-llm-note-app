import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isConfirming = false,
  onConfirm,
  onCancel,
}: Readonly<ConfirmDialogProps>) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/40 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">{description}</p>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isConfirming}
            >
              {cancelLabel}
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? "Deleting..." : confirmLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
