# TODO - Owner backend completion (FoodTour.Api)

## Step 1
- [x] Read owner-related controllers and middleware to understand current owner/role gating

## Step 2
- [ ] Update MenuItemController to enforce ownership for:
  - [ ] CreateMenuItemForPoi
  - [ ] UpdateMenuItemById
  - [ ] DeleteMenuItemById
  - [ ] (optional) null-safety in GetOwnerMenuItems mapping

## Step 3
- [x] Build API to verify compilation

## Step 4
- [ ] Quick runtime test via swagger/postman:
  - [ ] Create/update/delete menu items belonging to another owner should return 403/NotFound

## Frontend owner testing helpers (optional)
- [x] Owner requests now auto-attach header `X-Dev-Bypass: owner` when `NEXT_PUBLIC_DEV_BYPASS=owner`.
- [ ] If you want mock POI/menu/reviews, wire pages to mock mode using `NEXT_PUBLIC_DEV_FIRESTORE_MOCK=true`.


