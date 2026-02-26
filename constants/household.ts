import type { HouseholdMembershipType } from "@/lib/households";

export const MEMBERSHIP_TYPE_LABELS: Record<HouseholdMembershipType, string> = {
  "Head of Household": "Head of Household",
  Adult: "Adult",
  Child: "Child",
  Other: "Other",
};
