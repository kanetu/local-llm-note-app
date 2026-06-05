import { GearIcon } from "@radix-ui/react-icons";

type SettingsFabProps = {
  onClick: () => void;
};

export function SettingsFab({ onClick }: Readonly<SettingsFabProps>) {
  return (
    <button
      type="button"
      className="fixed bottom-25 right-4 z-39 inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-700 text-white shadow-xl transition hover:scale-105 hover:bg-slate-600 md:right-8"
      onClick={onClick}
      aria-label="Open settings"
    >
      <GearIcon width={22} height={22} />
    </button>
  );
}
