"use client";

import { RELATIONSHIP_LABELS } from "@/constants/household";
import type {
  HouseholdMemberRole,
  HouseholdRelationship,
} from "@/lib/households";

type AddByEmailForm = {
  email: string;
  role: HouseholdMemberRole;
  relationship: HouseholdRelationship | "";
  first_name: string;
  last_name: string;
};

type AddNoAccountForm = {
  first_name: string;
  last_name: string;
  relationship: HouseholdRelationship;
};

type Props = {
  open: boolean;
  mode: "email" | "no_account";
  onModeChange: (mode: "email" | "no_account") => void;
  onClose: () => void;
  addByEmailForm: AddByEmailForm;
  onAddByEmailFormChange: (updater: (prev: AddByEmailForm) => AddByEmailForm) => void;
  addNoAccountForm: AddNoAccountForm;
  onAddNoAccountFormChange: (updater: (prev: AddNoAccountForm) => AddNoAccountForm) => void;
  onAddByEmail: (e: React.FormEvent) => void;
  onAddNoAccount: (e: React.FormEvent) => void;
  saving: boolean;
};

export default function HouseholdAddMemberModal({
  open,
  mode,
  onModeChange,
  onClose,
  addByEmailForm,
  onAddByEmailFormChange,
  addNoAccountForm,
  onAddNoAccountFormChange,
  onAddByEmail,
  onAddNoAccount,
  saving,
}: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/50 px-4 transition-opacity duration-200">
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-brand-black bg-brand-white shadow-lg text-brand-black transition-all duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-member-title"
      >
        <div className="border-b border-brand-black/10 px-5 py-4">
          <h3 id="add-member-title" className="text-xl font-bold tracking-tight text-brand-black">
            Add member
          </h3>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onModeChange("email")}
              className={`rounded px-3 py-1.5 text-sm font-medium tracking-tight transition-colors ${
                mode === "email"
                  ? "bg-brand-black text-brand-white"
                  : "border border-brand-black/30 text-brand-black hover:bg-brand-black/5"
              }`}
            >
              By email
            </button>
            <button
              type="button"
              onClick={() => onModeChange("no_account")}
              className={`rounded px-3 py-1.5 text-sm font-medium tracking-tight transition-colors ${
                mode === "no_account"
                  ? "bg-brand-black text-brand-white"
                  : "border border-brand-black/30 text-brand-black hover:bg-brand-black/5"
              }`}
            >
              Without account
            </button>
          </div>
        </div>
        <div className="p-5">
          {mode === "email" ? (
            <form onSubmit={onAddByEmail} className="flex flex-col gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
                  Email
                </span>
                <input
                  type="email"
                  value={addByEmailForm.email}
                  onChange={(e) => onAddByEmailFormChange((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
                  required
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="First name (optional)"
                  value={addByEmailForm.first_name}
                  onChange={(e) => onAddByEmailFormChange((f) => ({ ...f, first_name: e.target.value }))}
                  className="rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
                />
                <input
                  type="text"
                  placeholder="Last name (optional)"
                  value={addByEmailForm.last_name}
                  onChange={(e) => onAddByEmailFormChange((f) => ({ ...f, last_name: e.target.value }))}
                  className="rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
                />
              </div>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
                  Role
                </span>
                <select
                  value={addByEmailForm.role}
                  onChange={(e) => onAddByEmailFormChange((f) => ({ ...f, role: e.target.value as HouseholdMemberRole }))}
                  className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm tracking-tight text-brand-black"
                >
                  <option value="member">Member</option>
                  <option value="head">Head</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
                  Relationship
                </span>
                <select
                  value={addByEmailForm.relationship}
                  onChange={(e) =>
                    onAddByEmailFormChange((f) => ({ ...f, relationship: e.target.value as HouseholdRelationship | "" }))
                  }
                  className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm tracking-tight text-brand-black"
                >
                  <option value="">—</option>
                  {(Object.keys(RELATIONSHIP_LABELS) as HouseholdRelationship[]).map((r) => (
                    <option key={r} value={r}>
                      {RELATIONSHIP_LABELS[r]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-brand-black px-4 py-2 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan disabled:opacity-50"
                >
                  {saving ? "Adding…" : "Add"}
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
          ) : (
            <form onSubmit={onAddNoAccount} className="flex flex-col gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
                  First name
                </span>
                <input
                  type="text"
                  value={addNoAccountForm.first_name}
                  onChange={(e) => onAddNoAccountFormChange((f) => ({ ...f, first_name: e.target.value }))}
                  className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
                  required
                  placeholder=""
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
                  Last name
                </span>
                <input
                  type="text"
                  value={addNoAccountForm.last_name}
                  onChange={(e) => onAddNoAccountFormChange((f) => ({ ...f, last_name: e.target.value }))}
                  className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
                  required
                  placeholder=""
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
                  Relationship
                </span>
                <select
                  value={addNoAccountForm.relationship}
                  onChange={(e) =>
                    onAddNoAccountFormChange((f) => ({ ...f, relationship: e.target.value as HouseholdRelationship }))
                  }
                  className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm tracking-tight text-brand-black"
                >
                  {(Object.keys(RELATIONSHIP_LABELS) as HouseholdRelationship[]).map((r) => (
                    <option key={r} value={r}>
                      {RELATIONSHIP_LABELS[r]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-brand-black px-4 py-2 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan disabled:opacity-50"
                >
                  {saving ? "Adding…" : "Add"}
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
          )}
        </div>
      </div>
    </div>
  );
}
