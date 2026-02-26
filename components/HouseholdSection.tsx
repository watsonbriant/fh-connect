"use client";

import HouseholdAddMemberModal, {
  type AddNoAccountForm as AddNoAccountFormType,
} from "@/components/HouseholdAddMemberModal";
import HouseholdEditAddressModal from "@/components/HouseholdEditAddressModal";
import HouseholdEditHomeCampusModal from "@/components/HouseholdEditHomeCampusModal";
import HouseholdEditMemberRoleModal from "@/components/HouseholdEditMemberRoleModal";
import HouseholdHomeAddressBlock from "@/components/HouseholdHomeAddressBlock";
import HouseholdHomeCampusBlock from "@/components/HouseholdHomeCampusBlock";
import HouseholdMemberRow from "@/components/HouseholdMemberRow";
import HouseholdPendingInvitations from "@/components/HouseholdPendingInvitations";
import HouseholdRemoveMemberModal from "@/components/HouseholdRemoveMemberModal";
import { getMemberFullName, useHouseholdSection } from "@/hooks/useHouseholdSection";

type HouseholdSectionProps = {
  personId: string;
  onMessage: (type: "success" | "error", text: string) => void;
};

export default function HouseholdSection({ personId, onMessage }: HouseholdSectionProps) {
  const {
    household,
    invitations,
    saving,
    isHead,
    hasAddress,
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
  } = useHouseholdSection({ personId, onMessage });

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

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold tracking-tight text-brand-black">Household</h2>

      <HouseholdHomeCampusBlock
        currentHomeCampus={currentHomeCampus}
        isHead={isHead}
        onEditClick={() => setShowEditHomeCampus(true)}
      />

      <hr className="my-3 border-0 border-t border-brand-black/20" />

      <HouseholdHomeAddressBlock
        streetAddress={household.street_address ?? null}
        cityStateZip={cityStateZip}
        hasAddress={hasAddress}
        isHead={isHead}
        onEditClick={openEditAddress}
      />

      <hr className="my-3 border-0 border-t border-brand-black/20" />

      <HouseholdPendingInvitations
        invitations={invitations}
        saving={saving}
        onAccept={handleAcceptInvitation}
        onDecline={handleDeclineInvitation}
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
        memberName={memberToEditRole ? getMemberFullName(memberToEditRole) : ""}
        currentType={memberToEditRole?.household_membership_type ?? "Other"}
        onSave={handleEditRoleConfirm}
        onClose={() => setMemberToEditRole(null)}
        saving={saving}
      />

      <HouseholdRemoveMemberModal
        open={!!memberToRemove}
        memberName={memberToRemove ? getMemberFullName(memberToRemove) : ""}
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
        onAddNoAccountFormChange={(updater: (prev: AddNoAccountFormType) => AddNoAccountFormType) =>
          setAddNoAccountForm((prev) => updater(prev))
        }
        onAddByEmail={handleInviteByEmail}
        onAddNoAccount={handleAddNoAccount}
        saving={saving}
      />
    </div>
  );
}
