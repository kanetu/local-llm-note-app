import { Cross2Icon, UploadIcon, DownloadIcon } from "@radix-ui/react-icons";
import { useRef, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { cn } from "@/lib/utils";

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    const handleResize = () => {
      checkMobile();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  const settingsContent = (
    <div
      className={cn("flex flex-col items-start gap-4", isMobile ? "px-4" : "")}
    >
      <p className="text-sm text-slate-600 text-right w-full md:text-left">
        Only data files exported by this app can be imported.
      </p>

      <div className="flex flex-wrap items-center justify-end w-full gap-2">
        <Button type="button" variant="outline" onClick={onExport}>
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
    </div>
  );

  return (
    <>
      {/* Mobile Sheet View */}
      {isMobile && (
        <Sheet open={isOpen} onOpenChange={onClose}>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
            </SheetHeader>
            <div className="space-y-3 mb-5">{settingsContent}</div>
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Card View */}
      {!isMobile && (
        <Card className="absolute top-[calc(-50%-55px)] right-4 z-40 w-[min(300px,calc(100vw-2rem))] shadow-2xl">
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

          <CardContent className="space-y-3">{settingsContent}</CardContent>
        </Card>
      )}
    </>
  );
}
