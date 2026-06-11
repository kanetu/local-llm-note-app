import { SettingsIcon } from "lucide-react";
import { useMobileActions } from "@/contexts/mobile-actions-context";

type SettingsFabProps = {
  onClick: () => void;
};

export function SettingsFab({ onClick }: Readonly<SettingsFabProps>) {
  const { closePane } = useMobileActions();

  return (
    <button
      type="button"
      className={`absolute right-14 bottom-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-white shadow-xl transition duration-300 hover:scale-105 hover:bg-slate-600 md:bottom-[calc(50%-20px)] md:right-4 md:z-39 md:pointer-events-auto md:translate-y-0 md:opacity-100`}
      onClick={() => {
        onClick();
        closePane();
      }}
      aria-label="Open settings"
    >
      <SettingsIcon width={22} height={22} />
    </button>
  );
}
