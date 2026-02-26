"use client";

type Props = {
  currentHomeCampus: string | null;
  isHead: boolean;
  onEditClick: () => void;
};

export default function HouseholdHomeCampusBlock({
  currentHomeCampus,
  isHead,
  onEditClick,
}: Props) {
  return (
    <div className="mb-3 grid grid-cols-[1fr_auto] gap-2 items-center">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-tight text-brand-black/60">
          Home campus
        </p>
        <span className="inline-flex rounded-lg bg-brand-tan/80 px-3 py-1 text-xs font-bold tracking-tight text-brand-black">
          {currentHomeCampus || "No campus selected"}
        </span>
      </div>
      {isHead && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onEditClick}
            className="rounded bg-brand-black px-3 py-1 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan"
          >
            Edit home campus
          </button>
        </div>
      )}
    </div>
  );
}
