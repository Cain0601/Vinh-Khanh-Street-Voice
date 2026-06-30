import { api } from "@/lib/api";

export type OwnerUpgradeRequestPayload = {
  ownerFullName: string;
  ownerPhoneNumber?: string | null;
  ownerAvatar?: string | null;
  ownerBrandName?: string | null;
  message?: string;
};

export type ModerationRequest = {
  id: string;
  type: string;
  targetId: string;
  requestedBy: string;
  status: string;
  reason?: string | null;
  ownerFullName?: string | null;
  ownerPhoneNumber?: string | null;
  ownerAvatar?: string | null;
  ownerBrandName?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export const moderationApi = {
  requestUpgrade: (payload: OwnerUpgradeRequestPayload) =>
    api.post<ModerationRequest>("/moderation/requests", {
      type: "UPGRADE_OWNER",
      message: payload.message || "User requested an owner account upgrade.",
      ownerFullName: payload.ownerFullName,
      ownerPhoneNumber: payload.ownerPhoneNumber,
      ownerAvatar: payload.ownerAvatar,
      ownerBrandName: payload.ownerBrandName,
    }),
  getMyUpgradeRequest: () =>
    api.get<ModerationRequest | null>("/moderation/requests/me?type=UPGRADE_OWNER"),
};
