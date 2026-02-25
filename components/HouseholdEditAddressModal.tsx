"use client";

type FormState = {
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  home_campus: string;
};

type Props = {
  open: boolean;
  form: FormState;
  onFormChange: (updater: (prev: FormState) => FormState) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
};

export default function HouseholdEditAddressModal({
  open,
  form,
  onFormChange,
  onClose,
  onSubmit,
  saving,
}: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/50 px-4 transition-opacity duration-200">
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-brand-black bg-brand-white shadow-lg text-brand-black transition-all duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-address-title"
      >
        <div className="border-b border-brand-black/10 px-5 py-4">
          <h3 id="edit-address-title" className="text-xl font-bold tracking-tight text-brand-black">
            Edit address
          </h3>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-3 p-5">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
              Street address
            </span>
            <input
              type="text"
              value={form.street_address}
              onChange={(e) => onFormChange((f) => ({ ...f, street_address: e.target.value }))}
              className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="City"
              value={form.city}
              onChange={(e) => onFormChange((f) => ({ ...f, city: e.target.value }))}
              className="rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
            />
            <input
              type="text"
              placeholder="State"
              value={form.state}
              onChange={(e) => onFormChange((f) => ({ ...f, state: e.target.value }))}
              className="rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
            />
          </div>
          <input
            type="text"
            placeholder="ZIP"
            value={form.zip_code}
            onChange={(e) => onFormChange((f) => ({ ...f, zip_code: e.target.value }))}
            className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-brand-black px-4 py-2 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-brand-black/30 px-4 py-2 text-sm font-medium tracking-tight text-brand-black hover:bg-brand-black/5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
