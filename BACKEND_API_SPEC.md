# Backend API Spec — Admin Extension

Changes required to support: Coupons, Customers, Inventory stock update, and Order detail (tracking).

All admin endpoints require an authenticated owner/staff JWT.  
Base path: `/api/v1` (or whatever the existing base is).

---

## 1. Coupons

### Model

```go
type Coupon struct {
    gorm.Model
    Code      string    `json:"Code" gorm:"uniqueIndex;not null"`
    Type      string    `json:"Type"`      // "percent" | "fixed"
    Value     float64   `json:"Value"`
    MinOrder  *float64  `json:"MinOrder"`  // nullable — minimum cart total to apply
    MaxUses   *int      `json:"MaxUses"`   // nullable — unlimited if null
    UsedCount int       `json:"UsedCount" gorm:"default:0"`
    IsActive  bool      `json:"IsActive"  gorm:"default:true"`
    ExpiresAt *time.Time `json:"ExpiresAt"` // nullable
}
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/coupons` | List all coupons |
| POST | `/admin/coupons` | Create a coupon |
| PUT | `/admin/coupons/:id` | Update a coupon |
| DELETE | `/admin/coupons/:id` | Delete a coupon |
| POST | `/coupons/validate` | Validate a coupon code (public, used at checkout) |

#### POST `/admin/coupons` body
```json
{
  "code": "SAVE20",
  "type": "percent",
  "value": 20,
  "min_order": 1000,
  "max_uses": 100,
  "is_active": true,
  "expires_at": "2025-12-31T23:59:59Z"
}
```

#### POST `/coupons/validate` body + response
```json
// Request
{ "code": "SAVE20", "cart_total": 2500 }

// Response (200 OK)
{
  "valid": true,
  "discount_amount": 500,
  "coupon": { "ID": 1, "Code": "SAVE20", "Type": "percent", "Value": 20 }
}

// Response (400 Bad Request)
{ "error": "Coupon expired" }
```

**Validation rules the backend must enforce:**
- Code must exist and `IsActive = true`
- `ExpiresAt` must not be in the past (if set)
- `UsedCount` must be less than `MaxUses` (if set)
- `cart_total` must be >= `MinOrder` (if set)
- On successful order placement that uses a coupon, increment `UsedCount`

---

## 2. Customers

### Model

The existing `User` model is reused. Add computed fields via a query or service layer:

```go
// Response shape for admin customer list
type CustomerResponse struct {
    ID         uint      `json:"ID"`
    Name       string    `json:"Name"`
    Email      string    `json:"Email"`
    Phone      *string   `json:"Phone"`
    IsBlocked  bool      `json:"IsBlocked"`
    CreatedAt  time.Time `json:"CreatedAt"`
    OrderCount int       `json:"OrderCount"` // COUNT(orders) for this user
    TotalSpent float64   `json:"TotalSpent"` // SUM(orders.total) WHERE status != 'cancelled'
}
```

Add `IsBlocked bool` to the existing `User` model (default `false`). When `true`, the user's login should return 403.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/customers` | List all customers with order stats |
| GET | `/admin/customers/:id` | Get single customer |
| GET | `/admin/customers/:id/orders` | Get all orders for a customer |
| PUT | `/admin/customers/:id/block` | Block a customer account |
| PUT | `/admin/customers/:id/unblock` | Unblock a customer account |

#### GET `/admin/customers` — suggested SQL
```sql
SELECT
    u.id, u.name, u.email, u.phone, u.is_blocked, u.created_at,
    COUNT(o.id) AS order_count,
    COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN o.total ELSE 0 END), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.role = 'customer'
GROUP BY u.id
ORDER BY u.created_at DESC;
```

#### Block / Unblock
```
PUT /admin/customers/:id/block
PUT /admin/customers/:id/unblock
```
No body needed. Returns the updated `CustomerResponse`.

**Login enforcement:** In the auth middleware, after verifying the JWT, check `user.IsBlocked`. If true, return:
```json
{ "error": "Your account has been suspended. Please contact support." }
```
with HTTP 403.

---

## 3. Inventory — Stock Update

Existing `Product` model already has a `Stock int` field. Add a dedicated PATCH endpoint so staff can update stock without touching other product fields.

### Endpoint

| Method | Path | Description |
|--------|------|-------------|
| PATCH | `/admin/products/:id/stock` | Update stock count only |

#### PATCH `/admin/products/:id/stock` body
```json
{ "stock": 25 }
```

**Response:** the full updated `Product` object (same shape as existing `GET /products/:id`).

**Validation:**
- `stock` must be >= 0
- Update `in_stock = (stock > 0)` automatically

---

## 4. Order Detail — Tracking Number

### Model change

Add `TrackingNumber *string` to the `Order` model:

```go
type Order struct {
    // ... existing fields
    TrackingNumber *string `json:"TrackingNumber"`
}
```

The field is already handled in the frontend adapter — just needs to be persisted and returned.

### Endpoint

| Method | Path | Description |
|--------|------|-------------|
| PUT | `/admin/orders/:id/tracking` | Set or update tracking number |

#### PUT `/admin/orders/:id/tracking` body
```json
{ "tracking_number": "NP123456789" }
```

**Response:** the full updated `Order` object.

This endpoint should be accessible to both `owner` and `staff` roles.

---

## 5. Order — Coupon Application (checkout change)

When a coupon is used at checkout, the `createOrder` payload needs two extra fields:

```json
{
  "delivery_address": "...",
  "phone": "...",
  "payment_method": "cod",
  "coupon_code": "SAVE20",
  "discount_amount": 500
}
```

The backend should:
1. Re-validate the coupon server-side (don't trust the client's `discount_amount`)
2. Store `coupon_id` and `discount_amount` on the order
3. Increment `coupon.used_count`
4. Add `CouponCode` and `DiscountAmount` to the `Order` model and response

---

## Summary of new DB columns / tables

| Table | New column(s) |
|-------|---------------|
| `coupons` | **new table** — see model above |
| `users` | `is_blocked BOOLEAN DEFAULT FALSE` |
| `orders` | `tracking_number VARCHAR`, `coupon_id INT FK`, `discount_amount DECIMAL` |
| `products` | _(no change — `stock` already exists)_ |
