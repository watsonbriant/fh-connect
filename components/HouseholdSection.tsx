"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getMyHousehold,
  getPendingInvitationsForPerson,
  ensureHouseholdForPerson,
  acceptInvitation,
  declineInvitation,
  inviteToHousehold,
  addPersonWithoutAccount,
  updateHousehold,
  updateHouseholdHomeCampus,
  getHomeCampusOptions,
  updateHouseholdMemberMembershipType,
  removeMemberFromHousehold,
  personHasAccount,
  type HouseholdWithMembers,
  type HouseholdMember,
  type HouseholdMembershipType,
  type HouseholdInvitation,
} from "@/lib/households";
import type { CampusLocation } from "@/lib/households";
import HouseholdAddMemberModal, {
  type AddNoAccountForm as AddNoAccountFormType,
} from "@/components/HouseholdAddMemberModal";
import HouseholdEditAddressModal, {
  type HouseholdAddressFormState,
} from "@/components/HouseholdEditAddressModal";
import HouseholdEditHomeCampusModal from "@/components/HouseholdEditHomeCampusModal";
import HouseholdEditMemberRoleModal from "@/components/HouseholdEditMemberRoleModal";
import HouseholdRemoveMemberModal from "@/components/HouseholdRemoveMemberModal";
import HouseholdMemberRow from "@/components/HouseholdMemberRow";

type HouseholdSectionProps = {
  personId: string;
  onMessage: (type: "success" | "error", text: string) => void;
};

export default function HouseholdSection({ personId, onMessage }: HouseholdSectionProps) {
  const [household, setHousehold] = useState<HouseholdWithMembers | null | "loading">("loading");
  const [invitations, setInvitations] = useState<HouseholdInvitation[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalMode, setAddModalMode] = useState<"email" | "no_account">("email");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setHousehold("loading");
    const [h, inv] = await Promise.all([
      getMyHousehold(personId),
      getPendingInvitationsForPerson(personId),
    ]);
    if (!h && personId) {
      const ensured = await ensureHouseholdForPerson(personId);
      if ("household_id" in ensured) {
        const updated = await getMyHousehold(personId);
        setHousehold(updated);
      } else {
        setHousehold(null);
      }
    } else {
      setHousehold(h);
    }
    setInvitations(inv ?? []);
  }, [personId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getHomeCampusOptions().then(setCampusOptions);
  }, []);

  const [addByEmailForm, setAddByEmailForm] = useState({
    email: "",
    membership_type: "Other" as HouseholdMembershipType,
  });
  const [addNoAccountForm, setAddNoAccountForm] = useState<AddNoAccountFormType>({
    first_name: "",
    last_name: "",
    membership_type: "Child",
    gender: "",
  });
  const [showEditAddress, setShowEditAddress] = useState(false);
  const [showEditHomeCampus, setShowEditHomeCampus] = useState(false);
  const [campusOptions, setCampusOptions] = useState<CampusLocation[]>([]);
  const [memberToRemove, setMemberToRemove] = useState<HouseholdMember | null>(null);
  const [memberToEditRole, setMemberToEditRole] = useState<HouseholdMember | null>(null);
  const [inviteByEmailError, setInviteByEmailError] = useState<string | null>(null);
  const [editAddressForm, setEditAddressForm] = useState<HouseholdAddressFormState>({
    street_address: "",
    city: "",
    state: "",
    zip: "",
  });

  const handleInviteByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household || household === "loading") return;
    setInviteByEmailError(null);
    setSaving(true);
    const result = await inviteToHousehold(
      household.id,
      personId,
      addByEmailForm.email,
      addByEmailForm.membership_type
    );
    setSaving(false);
    if ("error" in result) {
      if (result.error === "No account found with that email.") {
        setInviteByEmailError(result.error);
      } else {
        onMessage("error", result.error);
      }
      return;
    }
    setInviteByEmailError(null);
    onMessage("success", "Invitation sent.");
    setShowAddModal(false);
    setAddByEmailForm({ email: "", membership_type: "Other" });
    setAddModalMode("email");
    load();
  };

  const handleAddNoAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household || household === "loading") return;
    setSaving(true);
    const result = await addPersonWithoutAccount(
      household.id,
      addNoAccountForm.membership_type,
      {
        first_name: addNoAccountForm.first_name,
        last_name: addNoAccountForm.last_name,
        email: addNoAccountForm.email,
        date_of_birth: addNoAccountForm.date_of_birth,
        gender: addNoAccountForm.gender || undefined,
        phone_number: addNoAccountForm.phone_number,
      }
    );
    setSaving(false);
    if ("error" in result) {
      onMessage("error", result.error);
      return;
    }
    onMessage("success", "Household member added.");
    setShowAddModal(false);
    setAddNoAccountForm({
      first_name: "",
      last_name: "",
      membership_type: "Child",
    });
    setAddModalMode("no_account");
    load();
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    setSaving(true);
    const result = await acceptInvitation(invitationId, personId);
    setSaving(false);
    if ("error" in result) {
      onMessage("error", result.error);
      return;
    }
    onMessage("success", "You joined the household.");
    load();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("household-invitations-changed"));
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    await declineInvitation(invitationId, personId);
    load();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("household-invitations-changed"));
    }
  };

  const handleEditRoleClick = (member: HouseholdMember) => {
    if (!household || household === "loading") return;
    setMemberToEditRole(member);
  };

  const handleEditRoleConfirm = async (newType: HouseholdMembershipType) => {
    if (!household || household === "loading" || !memberToEditRole) return;
    const member = memberToEditRole;
    const isChangingSelf = member.person_id === personId;
    const targetIsHead = member.household_membership_type === "Head of Household";
    if (
      (isChangingSelf || targetIsHead) &&
      newType !== "Head of Household"
    ) {
      const message = isChangingSelf
        ? "If you change your own membership type from Head of Household, you may lose the ability to manage the household. Continue?"
        : "Changing this member from Head of Household may remove their management permissions. Continue?";
      if (!confirm(message)) return;
    }
    setSaving(true);
    const { error } = await updateHouseholdMemberMembershipType(member.person_id, newType);
    setSaving(false);
    if (error) {
      onMessage("error", error);
      return;
    }
    onMessage("success", "Membership type updated.");
    load();
    // Modal closes itself via onClose after its exit animation
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household || household === "loading") return;
    setSaving(true);
    const { error } = await updateHousehold(household.id, {
      street_address: editAddressForm.street_address || null,
      city: editAddressForm.city || null,
      state: editAddressForm.state || null,
      zip: editAddressForm.zip || null,
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

  const handleSaveHomeCampus = async (homeCampus: string | null) => {
    if (!household || household === "loading") return;
    setSaving(true);
    const { error } = await updateHouseholdHomeCampus(household.id, homeCampus);
    setSaving(false);
    if (error) {
      onMessage("error", error);
      return;
    }
    setShowEditHomeCampus(false);
    onMessage("success", "Home campus updated.");
    load();
  };

  const handleRemoveClick = (member: HouseholdMember) => {
    if (!household || household === "loading") return;
    setMemberToRemove(member);
  };

  const handleRemoveConfirm = async () => {
    if (!household || household === "loading" || !memberToRemove) return;
    setSaving(true);
    const hasAccount = await personHasAccount(memberToRemove.person_id);
    const { error } = await removeMemberFromHousehold(
      household.id,
      memberToRemove.person_id,
      hasAccount
    );
    setSaving(false);
    if (error) {
      onMessage("error", error);
      return;
    }
    onMessage("success", "Member removed.");
    load();
    // Modal closes itself (onClose clears memberToRemove) after exit animation
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

  const isHead = household.members.some(
    (m) => m.person_id === personId && m.household_membership_type === "Head of Household"
  );

  const hasAddress =
    (household.street_address ?? "").trim() ||
    (household.city ?? "").trim() ||
    (household.state ?? "").trim() ||
    (household.zip ?? "").trim();
  const cityStateZip = [household.city, household.state, household.zip]
    .filter(Boolean)
    .join(", ");

  const currentHomeCampus = household.home_campus ?? null;
  const campusOptionsWithCurrent =
    currentHomeCampus && !campusOptions.some((c) => c.location === currentHomeCampus)
      ? [{ location: currentHomeCampus, address: null, city: null, state: null, zip: null, type: "physical_campus" } as CampusLocation, ...campusOptions]
      : campusOptions;

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold tracking-tight text-brand-black">Household</h2>

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
              onClick={() => setShowEditHomeCampus(true)}
              className="rounded bg-brand-black px-3 py-1 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan"
            >
              Edit home campus
            </button>
          </div>
        )}
      </div>

      <hr className="my-3 border-0 border-t border-brand-black/20" />

      <div className="mb-3 grid grid-cols-[1fr_auto] gap-2 items-center">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-tight text-brand-black/60">
            Home address
          </p>
          <span className="inline-flex flex-col rounded-lg bg-brand-tan/80 px-3 py-1 text-xs font-bold tracking-tight text-brand-black">
            {household.street_address ? (
              <span className="text-brand-black/80">{household.street_address}</span>
            ) : null}
            {cityStateZip ? (
              <span className="text-brand-black/70">{cityStateZip}</span>
            ) : household.street_address ? (
              <span className="text-brand-black/70">&nbsp;</span>
            ) : null}
            {!hasAddress && (
              <span className="text-brand-black/60">No address entered</span>
            )}
          </span>
        </div>
        {isHead && (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                setEditAddressForm({
                  street_address: household.street_address ?? "",
                  city: household.city ?? "",
                  state: household.state ?? "",
                  zip: household.zip ?? "",
                });
                setShowEditAddress(true);
              }}
              className="rounded bg-brand-black px-3 py-1 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan"
            >
              Edit address
            </button>
          </div>
        )}
      </div>

      <hr className="my-3 border-0 border-t border-brand-black/20" />

      {invitations.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="mb-1 text-xs font-bold uppercase tracking-tight text-brand-black/60">
            Pending invitations
          </p>
          {invitations.map((inv) => {
            const inviterName =
              inv.inviter?.preferred_name ||
              [inv.inviter?.first_name, inv.inviter?.last_name].filter(Boolean).join(" ") ||
              "Someone";
            return (
              <div
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-brand-tan/50 bg-brand-tan/10 px-3 py-2 transition-all duration-200"
              >
                <p className="text-sm tracking-tight text-brand-black">
                  <strong>{inviterName}</strong> has invited you to their household.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAcceptInvitation(inv.id)}
                    disabled={saving}
                    className="rounded bg-brand-black px-3 py-1.5 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeclineInvitation(inv.id)}
                    disabled={saving}
                    className="rounded border border-brand-black/30 px-3 py-1.5 text-sm font-medium tracking-tight text-brand-black hover:bg-brand-black/5 disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
            key={m.person_id}
            member={m}
            isHead={isHead}
            onEditRole={handleEditRoleClick}
            onRemove={handleRemoveClick}
          />
        ))}
      </ul>

      <HouseholdEditAddressModal
        open={showEditAddress}
        form={editAddressForm}
        onFormChange={setEditAddressForm}
        onClose={() => setShowEditAddress(false)}
        onSubmit={handleUpdateAddress}
        saving={saving}
      />

      <HouseholdEditHomeCampusModal
        open={showEditHomeCampus}
        selectedValue={currentHomeCampus}
        options={campusOptionsWithCurrent}
        onClose={() => setShowEditHomeCampus(false)}
        onSave={handleSaveHomeCampus}
        saving={saving}
      />

      <HouseholdEditMemberRoleModal
        open={!!memberToEditRole}
        memberName={
          memberToEditRole
            ? (() => {
                const p = memberToEditRole.person as {
                  first_name?: string;
                  last_name?: string;
                } | undefined;
                if (!p) return "this member";
                const first = (p.first_name ?? "").trim();
                const last = (p.last_name ?? "").trim();
                return [first, last].filter(Boolean).join(" ") || "this member";
              })()
            : ""
        }
        currentType={memberToEditRole?.household_membership_type ?? "Other"}
        onSave={handleEditRoleConfirm}
        onClose={() => setMemberToEditRole(null)}
        saving={saving}
      />

      <HouseholdRemoveMemberModal
        open={!!memberToRemove}
        memberName={
          memberToRemove
            ? (() => {
                const p = memberToRemove.person as {
                  first_name?: string;
                  last_name?: string;
                } | undefined;
                if (!p) return "this member";
                const first = (p.first_name ?? "").trim();
                const last = (p.last_name ?? "").trim();
                return [first, last].filter(Boolean).join(" ") || "this member";
              })()
            : ""
        }
        onConfirm={handleRemoveConfirm}
        onClose={() => setMemberToRemove(null)}
        removing={saving}
      />

      <HouseholdAddMemberModal
        open={showAddModal}
        mode={addModalMode}
        onModeChange={(m) => {
          setAddModalMode(m);
          if (m === "no_account") setInviteByEmailError(null);
        }}
        onClose={() => {
          setShowAddModal(false);
          setInviteByEmailError(null);
        }}
        inviteByEmailError={inviteByEmailError}
        addByEmailForm={addByEmailForm}
        onAddByEmailFormChange={setAddByEmailForm}
        addNoAccountForm={addNoAccountForm}
        onAddNoAccountFormChange={(updater) =>
          setAddNoAccountForm((prev) => updater(prev))
        }
        onAddByEmail={handleInviteByEmail}
        onAddNoAccount={handleAddNoAccount}
        saving={saving}
      />
    </div>
  );
}
