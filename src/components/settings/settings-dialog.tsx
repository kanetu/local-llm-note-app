import { Cross2Icon, UploadIcon, DownloadIcon } from "@radix-ui/react-icons";
import { useRef } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type SettingsDialogProps = {
  isOpen: boolean;
  isImporting: boolean;
  onClose: () => void;
  onExport: () => void;
  onImportFileSelected: (file: File) => Promise<void>;
};

export function SettingsDialog({
  isOpen,
  isImporting,
  onClose,
  onExport,
  onImportFileSelected,
}: Readonly<SettingsDialogProps>) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) {
    return null;
  }

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    void onImportFileSelected(selectedFile);

    // Reset value so selecting the same file again still triggers change.
    event.target.value = "";
  };

  return (
    <Card className="fixed bottom-24 right-20 z-40 w-[min(520px,calc(100vw-2rem))] shadow-2xl md:right-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Settings</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close settings"
        >
          <Cross2Icon />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Important the data file which is exported by this application can be imported and understandable by the application, other JSON file is not capatible */}
        <p className="text-sm text-slate-600">
          Only data files exported by this app can be imported.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" onClick={onExport}>
            <UploadIcon />
            Export Notes
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handlePickFile}
            disabled={isImporting}
          >
            <DownloadIcon />
            {isImporting ? "Importing..." : "Import Notes"}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileChange}
        />
      </CardContent>
    </Card>
  );
}
