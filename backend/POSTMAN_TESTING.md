# Testing RSVP Backend with Postman

This guide walks you through testing all API endpoints locally before deploying.

## Prerequisites

1. **Start the backend locally:**
   ```bash
   cd backend
   npm install
   npm run dev    # or: npm start
   ```
   The server runs at `http://localhost:5000`

2. **Environment variables:** Create a `.env` file in `backend/` with:
   - `mongo_username`, `mongo_password` (or `MONGODB_URI`)
   - `secret_key` (JWT secret)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

## Base URL

| Environment | Base URL |
|-------------|----------|
| Local      | `http://localhost:5000` |
| Production | `https://rsvp-backend-iwyf.onrender.com` |

Use a Postman **Environment** and set `baseUrl` to switch between local and production.

---

## Testing Order (Recommended)

### 1. Health & Root
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `{{baseUrl}}/` | No | Root - "Server is up and running!" |
| GET | `{{baseUrl}}/health` | No | Health check - JSON with status, uptime |

### 2. Auth – Signup
**POST** `{{baseUrl}}/api/auth/createuser`

- **Body:** `form-data` (not JSON for file upload)
  - `name`: Your name
  - `email`: test@example.com
  - `password`: password123
  - `displayPicture`: (optional) image file

**Success response:** `{ success: true, authToken: "...", userId: "..." }`

Copy `authToken` for subsequent requests.

### 3. Auth – Login
**POST** `{{baseUrl}}/api/auth/login`

- **Body:** `x-www-form-urlencoded` or `raw JSON`
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```

**Success response:** `{ success: true, authToken: "...", userId: "..." }`

### 4. Set Auth Token for Other Requests

Create a **Collection variable** or **Environment variable** `authToken` and set it to the token from signup/login.

For protected routes, add a header:
- **Key:** `auth-token`
- **Value:** `{{authToken}}`

Or use Postman **Authorization** → Type: Bearer Token → Token: `{{authToken}}` (only if your API uses `Authorization: Bearer`; your API uses `auth-token` header, so add the header manually).

---

### 5. User – Get Profile
**GET** `{{baseUrl}}/api/auth/getuser/{{userId}}`

- Replace `{{userId}}` with the ID from signup/login.
- No auth required (public profile).

### 6. User – Update Profile
**PUT** `{{baseUrl}}/api/auth/updateuser`

- **Headers:** `auth-token`: `{{authToken}}`
- **Body:** `form-data` or `raw JSON`
  - `name`, `email`, `password` (optional)
  - `displayPicture`: (optional) image file

---

### 7. Events – Get All
**GET** `{{baseUrl}}/api/event/getallevents`

- No auth required.
- Returns upcoming events.

### 8. Events – Create
**POST** `{{baseUrl}}/api/event/addevent`

- **Headers:** `auth-token`: `{{authToken}}`
- **Body:** raw JSON
  ```json
  {
    "title": "Test Event",
    "description": "A test event for Postman",
    "startdatetime": "2026-03-01T10:00:00.000Z",
    "enddatetime": "2026-03-01T14:00:00.000Z",
    "location": "Online"
  }
  ```

**Success:** Returns the created event. Save `_id` as `{{eventId}}` for later requests.

### 9. Events – Get by ID
**GET** `{{baseUrl}}/api/event/getallevents/{{eventId}}`

- No auth required.

### 10. Events – Attend (RSVP)
**POST** `{{baseUrl}}/api/event/attendevent/{{eventId}}`

- **Headers:** `auth-token`: `{{authToken}}`

### 11. Events – Get My Attending
**GET** `{{baseUrl}}/api/event/eventsvisiting`

- **Headers:** `auth-token`: `{{authToken}}`

### 12. Events – Get My Hosting
**GET** `{{baseUrl}}/api/event/eventshosting`

- **Headers:** `auth-token`: `{{authToken}}`

### 13. Events – Unattend
**DELETE** `{{baseUrl}}/api/event/unattendevent/{{eventId}}`

- **Headers:** `auth-token`: `{{authToken}}`

### 14. Events – Update
**PUT** `{{baseUrl}}/api/event/updateevent/{{eventId}}`

- **Headers:** `auth-token`: `{{authToken}}`
- **Body:** raw JSON (only fields to update)
  ```json
  {
    "title": "Updated Event Title",
    "location": "New Location"
  }
  ```

### 15. Events – Delete
**DELETE** `{{baseUrl}}/api/event/deleteevent/{{eventId}}`

- **Headers:** `auth-token`: `{{authToken}}`
- Must be the event creator.

### 16. User – Delete Account
**DELETE** `{{baseUrl}}/api/auth/deleteuser`

- **Headers:** `auth-token`: `{{authToken}}`
- **Body:** raw JSON
  ```json
  {
    "password": "password123"
  }
  ```

---

## Quick Postman Setup

1. **Create Environment** “RSVP Local”:
   - `baseUrl` = `http://localhost:5000`
   - `authToken` = (leave empty; set after login)
   - `userId` = (leave empty; set after signup)
   - `eventId` = (leave empty; set after creating event)

2. **Import collection:** Create a new Collection and add the requests above, or import the `rsvp-postman-collection.json` (if provided).

3. **Collection-level header:** Add `auth-token`: `{{authToken}}` so it applies to all requests in the collection. Remove it for public routes (signup, login, getallevents, getuser).

4. **Test locally:** Use `npm run dev`, then run requests against `http://localhost:5000`.

5. **Test production:** Change `baseUrl` to your Render URL and run the same requests.

---

## Common Issues

- **401 Unauthorized:** Check that `auth-token` header is set and the token is valid.
- **400 Bad Request:** Verify request body (required fields, date format ISO8601).
- **Rate limiting:** Auth routes: 20 req/15 min; API: 100 req/min. Wait and retry if needed.
