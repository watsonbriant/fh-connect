"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getMyHousehold,
  getCampusLocations,
  updateHousehold,
  addMemberByEmail,
  addPersonWithoutAccount,
  updateHouseholdMember,
  removeMemberFromHousehold,
  type HouseholdWithMembers,
  type HouseholdMember,
  type HouseholdMemberRole,
  type HouseholdRelationship,
  type CampusLocation,
} from "@/lib/households";
import HouseholdEditAddressModal from "@/components/HouseholdEditAddressModal";
import HouseholdAddMemberModal from "@/components/HouseholdAddMemberModal";
import HouseholdMemberRow from "@/components/HouseholdMemberRow";

type HouseholdSectionProps = {
  personId: string;
  onMessage: (type: "success" | "error", text: string) => void;
};

export default function HouseholdSection({ personId, onMessage }: HouseholdSectionProps) {
  const [household, setHousehold] = useState<HouseholdWithMembers | null | "loading">("loading");
  const [campuses, setCampuses] = useState<CampusLocation[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalMode, setAddModalMode] = useState<"email" | "no_account">("email");
  const [showEditAddress, setShowEditAddress] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setHousehold("loading");
    const [h, c] = await Promise.all([getMyHousehold(personId), getCampusLocations()]);
    setHousehold(h);
    setCampuses(c);
  }, [personId]);

  useEffect(() => {
    load();
  }, [load]);

  const [addByEmailForm, setAddByEmailForm] = useState({
    email: "",
    role: "member" as HouseholdMemberRole,
    relationship: "" as HouseholdRelationship | "",
    first_name: "",
    last_name: "",
  });
  const [addNoAccountForm, setAddNoAccountForm] = useState({
    first_name: "",
    last_name: "",
    relationship: "parent_of" as HouseholdRelationship,
  });
  const [editAddressForm, setEditAddressForm] = useState({
    street_address: "",
    city: "",
    state: "",
    zip_code: "",
    home_campus: "",
  });

  const handleAddByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household || household === "loading") return;
    setSaving(true);
    const result = await addMemberByEmail(
      household.id,
      addByEmailForm.email,
      addByEmailForm.role,
      addByEmailForm.relationship || null,
      { first_name: addByEmailForm.first_name, last_name: addByEmailForm.last_name }
    );
    setSaving(false);
    if ("error" in result) {
      onMessage("error", result.error);
      return;
    }
    onMessage("success", "Member added. If they don't have an account, an invite was sent.");
    setShowAddModal(false);
    setAddByEmailForm({ email: "", role: "member", relationship: "", first_name: "", last_name: "" });
    load();
  };

  const handleAddNoAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household || household === "loading") return;
    setSaving(true);
    const result = await addPersonWithoutAccount(
      household.id,
      "member",
      addNoAccountForm.relationship,
      {
        first_name: addNoAccountForm.first_name,
        last_name: addNoAccountForm.last_name,
      }
    );
    setSaving(false);
    if ("error" in result) {
      onMessage("error", result.error);
      return;
    }
    onMessage("success", "Household member added.");
    setShowAddModal(false);
    setAddNoAccountForm({ first_name: "", last_name: "", relationship: "parent_of" });
    load();
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household || household === "loading") return;
    setSaving(true);
    const { error } = await updateHousehold(household.id, {
      street_address: editAddressForm.street_address,
      city: editAddressForm.city,
      state: editAddressForm.state,
      zip_code: editAddressForm.zip_code,
      home_campus: editAddressForm.home_campus || null,
    });
    setSaving(false);
    if (error) {
      onMessage("error", error);
      return;
    }
    onMessage("success", "Address updated.");
    setShowEditAddress(false);
    load();
  };

  const handleRoleChange = async (member: HouseholdMember, newRole: HouseholdMemberRole) => {
    const { error } = await updateHouseholdMember(member.id, { role: newRole });
    if (error) {
      onMessage("error", error);
      return;
    }
    onMessage("success", "Role updated.");
    load();
  };

  const handleRemove = async (member: HouseholdMember) => {
    if (!household || household === "loading") return;
    const name =
      (member.person as { preferred_name?: string; first_name?: string })?.preferred_name ||
      (member.person as { first_name?: string })?.first_name ||
      "this member";
    if (!confirm(`Remove ${name} from the household?`)) return;
    const { error } = await removeMemberFromHousehold(household.id, member.id);
    if (error) {
      onMessage("error", error);
      return;
    }
    onMessage("success", "Member removed.");
    load();
  };

  if (household === "loading") {
    return (
      <div>
        <h3 className="mb-2 text-xl font-bold tracking-tight text-brand-black">Household</h3>
        <p className="tracking-tight text-brand-black/70">Loading…</p>
      </div>
    );
  }

  if (!household) {
    return (
      <div>
        <h3 className="mb-2 text-xl font-bold tracking-tight text-brand-black">Household</h3>
        <p className="tracking-tight text-brand-black/70">
          We couldn&apos;t find a household for your account yet.
        </p>
      </div>
    );
  }

  const isHead = household.members.some((m) => m.person_id === personId && m.role === "head");
  const householdHeaderName = household.display_name.split("|")[0]?.trim() || "Household";
  const cityStateZip = [household.city, household.state, household.zip_code].filter(Boolean).join(", ");

  const handleHomeCampusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value || null;
    const { error } = await updateHousehold(household.id, { home_campus: value });
    if (error) onMessage("error", error);
    else {
      onMessage("success", "Home campus updated.");
      load();
    }
  };

  const campusOptions = [...campuses];
  const currentCampus = household.home_campus ?? "";
  if (currentCampus && !campusOptions.some((c) => c.location === currentCampus)) {
    campusOptions.push({
      location: currentCampus,
      address: null,
      city: null,
      state: null,
      zip: null,
      type: "",
    });
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold tracking-tight text-brand-black">
        {householdHeaderName} Household
      </h2>

      <p className="mb-1 text-xs font-bold uppercase tracking-tight text-brand-black/60">
        Home address
      </p>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          {household.street_address ? (
            <p className="mb-0.5 text-sm tracking-tight text-brand-black/80">
              {household.street_address}
            </p>
          ) : null}
          {cityStateZip ? (
            <p className="text-sm tracking-tight text-brand-black/70">{cityStateZip}</p>
          ) : household.street_address ? (
            <p className="text-sm tracking-tight text-brand-black/70">&nbsp;</p>
          ) : null}
        </div>
        {isHead && !showEditAddress && (
          <button
            type="button"
            onClick={() => {
              setEditAddressForm({
                street_address: household.street_address,
                city: household.city,
                state: household.state,
                zip_code: household.zip_code,
                home_campus: household.home_campus ?? "",
              });
              setShowEditAddress(true);
            }}
            className="shrink-0 rounded bg-brand-black px-3 py-1 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan"
          >
            Edit address
          </button>
        )}
      </div>

      <hr className="my-3 border-0 border-t border-brand-black/10" />

      <p className="mb-1 text-xs font-bold uppercase tracking-tight text-brand-black/60">
        Home Campus
      </p>
      <select
        value={currentCampus}
        onChange={handleHomeCampusChange}
        disabled={!isHead}
        className="mb-1 w-full max-w-xs rounded border border-brand-black/20 px-3 py-1 text-sm tracking-tight text-brand-black disabled:cursor-not-allowed disabled:opacity-70"
      >
        <option value="">Select campus</option>
        {campusOptions.map((c) => (
          <option key={c.location} value={c.location}>
            {c.location}
          </option>
        ))}
      </select>

      <hr className="my-3 border-0 border-t border-brand-black/10" />

      <HouseholdEditAddressModal
        open={showEditAddress}
        form={editAddressForm}
        onFormChange={setEditAddressForm}
        onClose={() => setShowEditAddress(false)}
        onSubmit={handleUpdateAddress}
        saving={saving}
      />

      <HouseholdAddMemberModal
        open={showAddModal}
        mode={addModalMode}
        onModeChange={setAddModalMode}
        onClose={() => setShowAddModal(false)}
        addByEmailForm={addByEmailForm}
        onAddByEmailFormChange={setAddByEmailForm}
        addNoAccountForm={addNoAccountForm}
        onAddNoAccountFormChange={setAddNoAccountForm}
        onAddByEmail={handleAddByEmail}
        onAddNoAccount={handleAddNoAccount}
        saving={saving}
      />

      <div className="mb-2 mt-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold tracking-tight text-brand-black">Household members</h3>
        {isHead && !showAddModal && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="shrink-0 rounded bg-brand-black px-3 py-1 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan"
          >
            Add member
          </button>
        )}
      </div>
      <ul className="space-y-2">
        {household.members.map((m) => (
          <HouseholdMemberRow
            key={m.id}
            member={m}
            isHead={isHead}
            onRoleChange={handleRoleChange}
            onRemove={handleRemove}
          />
        ))}
      </ul>
    </div>
  );
}
