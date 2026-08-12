import { useEffect } from "react";

type ShortcutProps = {
  onHandleAltN: () => Promise<void>;
  onHandleAltR: () => void;
};

export function useShortcut({ onHandleAltN, onHandleAltR }: Readonly<ShortcutProps>) {
  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      // Alt + N: create new note
      if (event.altKey && event.key.toLowerCase() === "n") {
        event.preventDefault();
        await onHandleAltN();
      }

      // Alt + R: edit note title
      if (event.altKey && event.key.toLowerCase() === "r") {
        event.preventDefault();
        await onHandleAltR();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener when component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
