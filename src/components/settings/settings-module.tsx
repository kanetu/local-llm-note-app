import { useState } from "react";
import { useMenuControl } from "@/contexts/menu-control-context";
import { getLocalStorage, writeLocalStorage } from "@/lib/utils";
import { SettingsDialog } from "./settings-dialog";
import { SettingsFab } from "./settings-fab";

type SettingsModuleProps = {
  onError: (message: string) => void;
  onStatusChange: (status: string) => void;
  onImported?: () => Promise<void>;
};

export function SettingsModule({
  onError,
  onStatusChange,
  onImported,
}: Readonly<SettingsModuleProps>) {
  const [isImporting, setIsImporting] = useState(false);
  const { isMenuOpen, toggleMenu, closeMenu } = useMenuControl();
  const isOpen = isMenuOpen("settings");

  const handleToggle = () => {
    toggleMenu("settings");
  };

  const handleClose = () => {
    closeMenu();
  };

  const handleExport = () => {
    try {
      const serialized = getLocalStorage();
      const blob = new Blob([serialized], { type: "application/json" });
      const url = globalThis.URL.createObjectURL(blob);

      const anchor = globalThis.document.createElement("a");
      const fileName = `note-app-localstorage-${Date.now()}.json`;
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      globalThis.URL.revokeObjectURL(url);

      onError("");
      onStatusChange("Notes exported");
    } catch (exportError) {
      onError(
        exportError instanceof Error
          ? exportError.message
          : "Failed to export notes",
      );
    }
  };

  const handleImportFileSelected = async (file: File) => {
    onError("");

    try {
      setIsImporting(true);
      onStatusChange("Importing notes...");

      const fileText = await file.text();
      writeLocalStorage(fileText);

      if (onImported) {
        await onImported();
      }

      onStatusChange("Notes imported");
      closeMenu();
    } catch (importError) {
      onError(
        importError instanceof Error
          ? importError.message
          : "Failed to import notes",
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <SettingsDialog
        isOpen={isOpen}
        isImporting={isImporting}
        onClose={handleClose}
        onExport={handleExport}
        onImportFileSelected={handleImportFileSelected}
      />

      <SettingsFab onClick={handleToggle} />
    </>
  );
}
