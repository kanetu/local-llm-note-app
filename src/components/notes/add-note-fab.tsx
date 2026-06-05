import { PlusIcon } from "@radix-ui/react-icons";

type AddNoteFabProps = {
  onClick: () => void;
};

export function AddNoteFab({ onClick }: Readonly<AddNoteFabProps>) {
  return (
    <button
      type="button"
      className="fixed bottom-6 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-xl transition hover:scale-105 hover:bg-teal-500 md:right-8"
      onClick={onClick}
      aria-label="Open add note section"
    >
      <PlusIcon width={22} height={22} />
    </button>
  );
}
