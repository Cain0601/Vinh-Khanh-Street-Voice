import { api } from "@/lib/api";

export const moderationApi = {
  requestUpgrade: () => api.post("/moderation/requests", {
    type: "UPGRADE_OWNER",
    message: "User requested an owner account upgrade.",
  }),
};
