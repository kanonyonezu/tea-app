# Tea Recommendation API

## Overview

This API allows users to log in, browse available teas, and receive personalized tea recommendations based on their preferences.

## Authentication

Most endpoints require a JWT Bearer token, obtained via the login endpoint.

**In Postman:**
1. Go to the **Authorization** tab
2. Set **Auth Type** to `Bearer Token`
3. Paste the token into the field
## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/login` | Log in and receive a JWT token |
| GET | `/api/v1/sign_up` | Sign up for a new account |
| DELETE | `/api/v1/logout` | Log out the current user |
| GET | `/api/v1/teas` | List all teas |
| GET | `/api/v1/teas/:id` | Get a single tea by ID |
| POST | `/api/v1/recommendations` | Create a tea recommendation based on preferences |
| GET | `/api/v1/recommendations/:id` | Get a single recommendation by ID |

---

## GET `/api/v1/teas`

Returns a list of all available teas.

**Headers**

| Key | Value |
|-----|-------|
| Authorization | `Bearer <JWT_TOKEN>` |

**Response**

```json
[
  {
    "id": 2,
    "name_en": "Earl Grey",
    "category": ["black", "flavored"],
    "flavor_primary": "citrus",
    "created_at": "2026-09-15T08:28:55.572Z",
    "updated_at": "2026-09-15T08:28:55.572Z"
  },
  ...
  {
    "id": 3,
    "name_en": "Tieguanyin",
    "category": ["oolong"],
    "flavor_primary": "floral",
    "created_at": "2026-09-15T08:28:55.574Z",
    "updated_at": "2026-09-15T08:28:55.574Z"
  }
]
```

---

## POST `/api/v1/recommendations`

Generates tea recommendations based on the user's stated preferences.

**Headers**

| Key | Value |
|-----|-------|
| Authorization | `Bearer <JWT_TOKEN>` |

**Request Body**

```json
{
  "preferences": {
      "caffeine": "high",
      "body": "medium-full",
      "flavor": ["Roasted", "Earthy"]
  }
}
```

Caffeine level can be chosen from ["low", "moderate", "high"]
Body can be chosen from ["A", "B", "C"]
Flavor can be chosen from ["A", "B", "C"]

**Response**

```json
{
  "id": 3,
  "user_id": 1,
  "tea_id": [1, 3],
  "preference": null,
  "created_at": "2026-09-16T00:52:34.234Z",
  "updated_at": "2026-09-16T00:52:34.234Z"
}
```

---

## GET `/api/v1/recommendations/:id`

Returns the tea(s) associated with a given recommendation ID.

**Headers**

| Key | Value |
|-----|-------|
| Authorization | `Bearer <JWT_TOKEN>` |

**Example**

`GET /api/v1/recommendations/1`

**Response**

```json
[
  {
    "id": 1,
    "name_en": "Jasmine Green Tea",
    "category": ["green", "scented"],
    "flavor_primary": "floral",
    "created_at": "2026-09-15T08:28:55.568Z",
    "updated_at": "2026-09-15T08:28:55.568Z"
  },
  {
    "id": 3,
    "name_en": "Tieguanyin",
    "category": ["oolong"],
    "flavor_primary": "floral",
    "created_at": "2026-09-15T08:28:55.574Z",
    "updated_at": "2026-09-15T08:28:55.574Z"
  }
]
```

## Tea Object Structure

```json
{
  "id": 1,
  "name_en": "Jasmine Green Tea",
  "category": ["green", "scented"],
  "flavor_primary": "floral",
  "created_at": "2026-09-15T08:28:55.568Z",
  "updated_at": "2026-09-15T08:28:55.568Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique tea identifier |
| `name_en` | string | English name of the tea |
| `category` | array of strings | Tea categories (e.g. green, scented, herbal) |
| `flavor_primary` | string | Dominant flavor profile |
| `created_at` | datetime | Record creation timestamp |
| `updated_at` | datetime | Record last-updated timestamp |
