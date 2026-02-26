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
  type CampusLocation,
} from "@/lib/households";
import type { HouseholdAddressFormState } from "@/components/HouseholdEditAddressModal";
import type { AddNoAccountForm as AddNoAccountFormType } from "@/components/HouseholdAddMemberModal";

export function getMemberFullName(member: { person?: { first_name?: string; last_name?: string } }): string {
  const p = member.person as { first_name?: string; last_name?: string } | undefined;
  if (!p) return "this member";
  const first = (p.first_name ?? "").trim();
  const last = (p.last_name ?? "").trim();
  return [first, last].filter(Boolean).join(" ") || "this member";
}

type UseHouseholdSectionProps = {
  personId: string;
  onMessage: (type: "success" | "error", text: string) => void;
};

export function useHouseholdSection({ personId, onMessage }: UseHouseholdSectionProps) {
  const [household, setHousehold] = useState<HouseholdWithMembers | null | "loading">("loading");
  const [invitations, setInvitations] = useState<HouseholdInvitation[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalMode, setAddModalMode] = useState<"email" | "no_account">("email");
  const [saving, setSaving] = useState(false);
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

  const handleInviteByEmail = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [household, personId, addByEmailForm, load, onMessage]
  );

  const handleAddNoAccount = useCallback(
    async (e: React.FormEvent) => {
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
      setAddNoAccountForm({ first_name: "", last_name: "", membership_type: "Child", gender: "" });
      setAddModalMode("no_account");
      load();
    },
    [household, addNoAccountForm, load, onMessage]
  );

  const handleAcceptInvitation = useCallback(
    async (invitationId: string) => {
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
    },
    [personId, load, onMessage]
  );

  const handleDeclineInvitation = useCallback(
    async (invitationId: string) => {
      await declineInvitation(invitationId, personId);
      load();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("household-invitations-changed"));
      }
    },
    [personId, load]
  );

  const handleEditRoleClick = useCallback((member: HouseholdMember) => {
    setMemberToEditRole(member);
  }, []);

  const handleEditRoleConfirm = useCallback(
    async (newType: HouseholdMembershipType) => {
      if (!household || household === "loading" || !memberToEditRole) return;
      const member = memberToEditRole;
      const isChangingSelf = member.person_id === personId;
      const targetIsHead = member.household_membership_type === "Head of Household";
      if ((isChangingSelf || targetIsHead) && newType !== "Head of Household") {
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
    },
    [household, memberToEditRole, personId, load, onMessage]
  );

  const handleUpdateAddress = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [household, editAddressForm, load, onMessage]
  );

  const handleSaveHomeCampus = useCallback(
    async (homeCampus: string | null) => {
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
    },
    [household, load, onMessage]
  );

  const handleRemoveClick = useCallback((member: HouseholdMember) => {
    setMemberToRemove(member);
  }, []);

  const handleRemoveConfirm = useCallback(
    async () => {
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
      setMemberToRemove(null);
      onMessage("success", "Member removed.");
      load();
    },
    [household, memberToRemove, load, onMessage]
  );

  const openEditAddress = useCallback(() => {
    if (!household || household === "loading") return;
    setEditAddressForm({
      street_address: household.street_address ?? "",
      city: household.city ?? "",
      state: household.state ?? "",
      zip: household.zip ?? "",
    });
    setShowEditAddress(true);
  }, [household]);

  const isHead =
    household !== "loading" &&
    household !== null &&
    household.members.some(
      (m) => m.person_id === personId && m.household_membership_type === "Head of Household"
    );

  const hasAddress =
    household !== "loading" &&
    household !== null &&
    ((household.street_address ?? "").trim() ||
      (household.city ?? "").trim() ||
      (household.state ?? "").trim() ||
      (household.zip ?? "").trim());
  const cityStateZip =
    household && household !== "loading"
      ? [household.city, household.state, household.zip].filter(Boolean).join(", ")
      : "";
  const currentHomeCampus = household && household !== "loading" ? household.home_campus ?? null : null;
  const campusOptionsWithCurrent =
    currentHomeCampus && !campusOptions.some((c) => c.location === currentHomeCampus)
      ? [
          {
            location: currentHomeCampus,
            address: null,
            city: null,
            state: null,
            zip: null,
            type: "physical_campus",
          } as CampusLocation,
          ...campusOptions,
        ]
      : campusOptions;

  return {
    household,
    invitations,
    saving,
    isHead: !!isHead,
    hasAddress: !!hasAddress,
    cityStateZip,
    currentHomeCampus,
    campusOptionsWithCurrent,
    showAddModal,
    setShowAddModal,
    addModalMode,
    setAddModalMode,
    inviteByEmailError,
    setInviteByEmailError,
    addByEmailForm,
    setAddByEmailForm,
    addNoAccountForm,
    setAddNoAccountForm,
    showEditAddress,
    setShowEditAddress,
    editAddressForm,
    setEditAddressForm,
    showEditHomeCampus,
    setShowEditHomeCampus,
    memberToRemove,
    setMemberToRemove,
    memberToEditRole,
    setMemberToEditRole,
    handleInviteByEmail,
    handleAddNoAccount,
    handleAcceptInvitation,
    handleDeclineInvitation,
    handleEditRoleClick,
    handleEditRoleConfirm,
    handleUpdateAddress,
    handleSaveHomeCampus,
    handleRemoveClick,
    handleRemoveConfirm,
    openEditAddress,
  };
}
