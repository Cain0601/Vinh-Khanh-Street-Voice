type MockPoi = {
  id: string;
  ownerId: string;
  title: string;
  summary?: string;
  address?: string;
  status: string;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  mediaUrls?: string[];
  categoryId?: string;
};

type MockMenuItem = {
  id: string;
  poiId: string;
  name: string;
  price: number;
  isAvailable: boolean;
  description?: string;
  imageUrl?: string | null;
};

type MockReview = {
  id: string;
  poiId: string;
  rating: number;
  comment?: string;
};

const OWNER_ID = "dev-owner";

let pois: MockPoi[] = [
  {
    id: "poi_1",
    ownerId: OWNER_ID,
    title: "Bánh mì Phượng",
    summary: "Ngon - bổ - rẻ",
    address: "123 Trần Phú, Đà Nẵng",
    status: "approved",
    isActive: true,
    rating: 4.6,
    reviewCount: 12,
  },
  {
    id: "poi_2",
    ownerId: OWNER_ID,
    title: "Cơm gà Hội An",
    summary: "Đậm đà hương vị",
    address: "456 Nguyễn Huệ, Hội An",
    status: "approved",
    isActive: false,
    rating: 4.2,
    reviewCount: 7,
  },
];

let menuItems: MockMenuItem[] = [
  {
    id: "mi_1",
    poiId: "poi_1",
    name: "Bánh mì đặc biệt",
    price: 85000,
    isAvailable: true,
    description: "Thịt + chả + pate",
    imageUrl: null,
  },
  {
    id: "mi_2",
    poiId: "poi_1",
    name: "Bánh mì chay",
    price: 65000,
    isAvailable: false,
    description: "Đủ vị - ít ngán",
    imageUrl: null,
  },
  {
    id: "mi_3",
    poiId: "poi_2",
    name: "Cơm gà truyền thống",
    price: 99000,
    isAvailable: true,
    description: "Gà mềm - cơm thơm",
    imageUrl: null,
  },
];

let reviews: MockReview[] = [
  { id: "r1", poiId: "poi_1", rating: 5, comment: "Ngon quá" },
  { id: "r2", poiId: "poi_1", rating: 4, comment: "Ăn ổn" },
  { id: "r3", poiId: "poi_2", rating: 4, comment: "Khá ok" },
];

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2, 10)}`;
}

export const ownerMock = {
  // ── Owner Profile ─────────────────────────────────────────────────────────
  async getOwnerProfile() {
    return {
      success: true,
      data: {
        email: "owner@example.com",
        fullName: "Dev Owner",
        phoneNumber: "+84900001111",
        avatar: "https://example.com/avatar_owner.png",
        brandName: "Phượng Street Food",
      },
    };
  },

  async updateOwnerProfile(body: {
    fullName?: string;
    phoneNumber?: string;
    avatar?: string;
    brandName?: string;
  }) {
    return {
      success: true,
      message: "Profile updated",
      data: {
        email: "owner@example.com",
        fullName: body.fullName ?? "Dev Owner",
        phoneNumber: body.phoneNumber ?? "+84900001111",
        avatar: body.avatar ?? "https://example.com/avatar_owner.png",
        brandName: body.brandName ?? "Phượng Street Food",
      },
    };
  },

  // ── Owner Settings ────────────────────────────────────────────────────────
  async getOwnerSettings() {
    return {
      success: true,
      data: {
        notificationsEmail: true,
        poiDefaultIsActive: true,
      },
    };
  },

  async updateOwnerSettings(body: {
    notificationsEmail?: boolean;
    poiDefaultIsActive?: boolean;
  }) {
    return {
      success: true,
      message: "Settings updated",
      data: {
        notificationsEmail: body.notificationsEmail ?? true,
        poiDefaultIsActive: body.poiDefaultIsActive ?? true,
      },
    };
  },

  // ── Owner POIs ─────────────────────────────────────────────────────────────
  async getOwnerPois(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const search = (params?.search ?? "").toLowerCase();
    const status = params?.status ?? "all";

    let filtered = pois.filter((p) => p.ownerId === OWNER_ID);

    if (status === "active") filtered = filtered.filter((p) => p.isActive);
    else if (status === "hidden") filtered = filtered.filter((p) => !p.isActive);

    if (search) {
      filtered = filtered.filter((p) =>
        [p.title, p.summary, p.address].filter(Boolean).join(" ").toLowerCase().includes(search),
      );
    }

    const limit = params?.limit ?? 10;
    const page = params?.page ?? 1;

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const data = filtered.slice((page - 1) * limit, page * limit);

    return {
      success: true,
      data: {
        data: data.map((p) => ({
          ...p,
          translations: [{ name: p.title }],
        })),
        pagination: { page, limit, total, totalPages },
      },
    };
  },

  async createPoi(body: Partial<MockPoi> & { title: string }) {
    const created: MockPoi = {
      id: uid("poi"),
      ownerId: OWNER_ID,
      title: body.title,
      summary: body.summary,
      address: body.address,
      status: "pending",
      isActive: true,
      rating: 0,
      reviewCount: 0,
      mediaUrls: [],
      categoryId: body.categoryId,
    };
    pois = [created, ...pois];
    return { success: true, data: created };
  },

  // ── Owner Menu Items ───────────────────────────────────────────────────────
  async getOwnerMenuItems(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const search = (params?.search ?? "").toLowerCase();
    const limit = params?.limit ?? 12;
    const page = params?.page ?? 1;

    const ownerPoiIds = new Set(pois.filter((p) => p.ownerId === OWNER_ID).map((p) => p.id));
    let items = menuItems.filter((m) => ownerPoiIds.has(m.poiId));

    if (search) {
      items = items.filter((m) =>
        [m.name, m.description].filter(Boolean).join(" ").toLowerCase().includes(search),
      );
    }

    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const paged = items.slice((page - 1) * limit, page * limit);

    const data = paged.map((m) => {
      const poi = pois.find((p) => p.id === m.poiId)!;
      return {
        id: m.id,
        poiId: m.poiId,
        name: m.name,
        price: m.price,
        isAvailable: m.isAvailable,
        description: m.description,
        imageUrl: m.imageUrl,
        poi: { id: poi.id, translations: [{ name: poi.title }] },
      };
    });

    return {
      success: true,
      data: {
        data,
        pagination: { page, limit, total, totalPages },
      },
    };
  },

  async createMenuItemForPoi(poiId: string, body: any) {
    const created: MockMenuItem = {
      id: uid("mi"),
      poiId,
      name: body.name,
      price: Number(body.price),
      description: body.description,
      imageUrl: body.imageUrl ?? null,
      isAvailable: body.isAvailable ?? true,
    };
    menuItems = [created, ...menuItems];
    return { success: true, data: created };
  },

  async updateMenuItem(id: string, body: any) {
    const idx = menuItems.findIndex((m) => m.id === id);
    if (idx < 0) return { success: false, message: "Not found" };

    menuItems[idx] = {
      ...menuItems[idx],
      name: body.name ?? menuItems[idx].name,
      price: body.price != null ? Number(body.price) : menuItems[idx].price,
      description: body.description ?? menuItems[idx].description,
      imageUrl: body.imageUrl ?? menuItems[idx].imageUrl,
      isAvailable: body.isAvailable ?? menuItems[idx].isAvailable,
    };

    return { success: true, data: menuItems[idx] };
  },

  async deleteMenuItem(id: string) {
    menuItems = menuItems.filter((m) => m.id !== id);
    return { success: true, message: "Deleted" };
  },

  // ── Reviews ─────────────────────────────────────────────────────────────────
  async getPoiReviews(poiId: string) {
    const list = reviews.filter((r) => r.poiId === poiId);
    const averageRating =
      list.length ? Math.round((list.reduce((a, b) => a + b.rating, 0) / list.length) * 10) / 10 : 0;

    return {
      success: true,
      data: list,
      total: list.length,
      averageRating,
      message: "Tải danh sách đánh giá thành công!",
    };
  },
};
