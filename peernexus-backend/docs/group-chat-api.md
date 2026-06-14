# Group Chat Module API

Real-time group messaging powered by **Spring WebSocket + STOMP + SockJS**.
All messages are persisted in MySQL; Cloudinary URLs are used for IMAGE / FILE content.
Read receipts are tracked per-user in a `group_message_reads` join table.

---

## Security Constraints

| Rule | Detail |
|------|--------|
| **Group membership required** | The authenticated user must be an active member of the group (`group_members` table) |
| **Removed members** | Users removed from the group lose access to history and cannot send messages |
| **Non-members** | Cannot subscribe to group topics or call group REST endpoints |
| **Authentication** | REST: `Authorization: Bearer <JWT>`<br>STOMP: `Authorization: Bearer <JWT>` or `token: <JWT>` in STOMP `CONNECT` headers |
| **Binary storage** | No binary blobs in MySQL — upload files via Cloudinary API first, then send the URL |

---

## WebSocket Connection

```
ws://localhost:8080/ws          (native WebSocket)
http://localhost:8080/ws        (SockJS fallback)
```

**Connect with JWT** — pass the token in the STOMP `CONNECT` frame:

```
CONNECT
Authorization: Bearer <jwt-token>
```

Or using the SockJS query-string convention:
```
http://localhost:8080/ws?token=<jwt-token>
```

---

## STOMP Subscriptions (server → client)

Subscribe to these topics after connecting to receive live events for a group.

| Destination | Event Type | Description |
|-------------|-----------|-------------|
| `/topic/group.{groupId}` | `GroupMessageResponse` | New messages sent in the group |
| `/topic/group.{groupId}.typing` | `GroupTypingEvent` | Typing start / stop indicators |
| `/topic/group.{groupId}.read` | `GroupReadReceiptEvent` | Read receipt events (who read, how many) |

> **Example:** to receive messages for group 17, subscribe to `/topic/group.17`

---

## STOMP Send Destinations (client → server)

### 1. Send a Group Message

```
SEND /app/group.send
content-type: application/json

{
  "groupId": 17,
  "content": "Hello everyone!",
  "type": "TEXT",
  "fileName": null
}
```

**MessageType values:**
| Type | `content` | `fileName` |
|------|-----------|------------|
| `TEXT` | Plain-text message body | `null` |
| `IMAGE` | Cloudinary HTTPS image URL | `null` |
| `FILE` | Cloudinary HTTPS file URL | Original filename (e.g. `report.pdf`) |

**Effect:** Message is persisted to MySQL and broadcast to `/topic/group.{groupId}`.

---

### 2. Typing Indicator

```
SEND /app/group.typing
content-type: application/json

{
  "groupId": 17,
  "senderId": 7,
  "typing": true
}
```

Set `typing: false` when the user stops typing or the composing input is cleared.

**Effect:** Event is validated (membership check) and forwarded to `/topic/group.{groupId}.typing`.  
The `senderId` field is overwritten server-side with the authenticated user's ID for security.

---

### 3. Mark Messages as Read (STOMP)

```
SEND /app/group.read
content-type: application/json

{
  "groupId": 17,
  "readerId": 0,
  "readAt": null,
  "readCount": 0
}
```

> Only the `groupId` field is used; the others are ignored and filled server-side.

**Effect:** All unread messages in the group (not sent by the caller) are marked as read.
A `GroupReadReceiptEvent` is broadcast to `/topic/group.{groupId}.read`.

---

## STOMP Event Payloads

### GroupMessageResponse (delivered to `/topic/group.{groupId}`)

```json
{
  "id": 2001,
  "groupId": 17,
  "senderId": 7,
  "senderName": "Alice",
  "content": "Hello everyone!",
  "type": "TEXT",
  "fileName": null,
  "sentAt": "2025-06-12T15:00:00Z",
  "deleted": false,
  "readCount": 1
}
```

> When a message is soft-deleted, `content` will be `null` and `deleted` will be `true`.
> `readCount` reflects the number of distinct members (including the sender) who have read the message.

---

### GroupTypingEvent (delivered to `/topic/group.{groupId}.typing`)

```json
{
  "groupId": 17,
  "senderId": 7,
  "typing": true
}
```

---

### GroupReadReceiptEvent (delivered to `/topic/group.{groupId}.read`)

```json
{
  "groupId": 17,
  "readerId": 9,
  "readAt": "2025-06-12T15:01:00Z",
  "readCount": 5
}
```

> `readCount` = number of messages newly marked as read in this batch.

---

## REST Endpoints

All REST endpoints require `Authorization: Bearer <JWT>`.
The caller must be an active group member for all group-chat endpoints.

---

### GET /api/group-chat/{groupId}/messages

Paginated message history for the group (newest first).

**Query params:** `?page=0&size=30` (Spring `Pageable`)

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Message history retrieved",
  "data": {
    "content": [
      {
        "id": 2001,
        "groupId": 17,
        "senderId": 7,
        "senderName": "Alice",
        "content": "Hello everyone!",
        "type": "TEXT",
        "fileName": null,
        "sentAt": "2025-06-12T15:00:00Z",
        "deleted": false,
        "readCount": 4
      }
    ],
    "totalElements": 87,
    "totalPages": 3,
    "size": 30,
    "number": 0
  }
}
```

---

### POST /api/group-chat/{groupId}/messages

Sends a message to the group via REST (non-WebSocket fallback).
Prefer the STOMP `/app/group.send` destination for real-time delivery.

**Request body:**
```json
{
  "groupId": 17,
  "content": "Hello via REST!",
  "type": "TEXT",
  "fileName": null
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "id": 2002,
    "groupId": 17,
    "senderId": 7,
    "senderName": "Alice",
    "content": "Hello via REST!",
    "type": "TEXT",
    "fileName": null,
    "sentAt": "2025-06-12T15:02:00Z",
    "deleted": false,
    "readCount": 1
  }
}
```

---

### POST /api/group-chat/{groupId}/read

Marks all unread messages in the group as read for the authenticated user.
Call this when the user opens the group chat view.

> For real-time read receipts visible to other members, prefer the STOMP `/app/group.read` destination.

**Response** `200 OK`
```json
{
  "success": true,
  "message": "5 message(s) marked as read",
  "data": 5
}
```

---

### GET /api/group-chat/{groupId}/unread-count

Returns the number of unread messages in the group for the authenticated user.
Use this to populate notification badges in the group list view.

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Unread count retrieved",
  "data": 12
}
```

---

### GET /api/group-chat/{groupId}/last-message

Returns the last non-deleted message in the group for inbox preview.
Returns `null` data if no messages have been sent yet.

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Last message retrieved",
  "data": {
    "id": 2001,
    "groupId": 17,
    "senderId": 7,
    "senderName": "Alice",
    "content": "See you all tomorrow!",
    "type": "TEXT",
    "fileName": null,
    "sentAt": "2025-06-12T14:59:00Z",
    "deleted": false,
    "readCount": 3
  }
}
```

---

## Error Responses

| HTTP Status | Cause |
|-------------|-------|
| `401` | Missing or invalid JWT |
| `403` | User is not an active group member, or is a removed member |
| `404` | Group does not exist |

---

## Database Schema (auto-generated by Hibernate)

```sql
CREATE TABLE group_messages (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  group_id   BIGINT        NOT NULL,
  sender_id  BIGINT        NOT NULL,
  content    VARCHAR(2000) NOT NULL,
  type       VARCHAR(10)   NOT NULL,  -- TEXT | IMAGE | FILE
  file_name  VARCHAR(255),
  deleted    BOOLEAN       NOT NULL DEFAULT FALSE,
  sent_at    DATETIME(6)   NOT NULL,
  FOREIGN KEY (group_id)  REFERENCES study_groups(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

CREATE TABLE group_message_reads (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  message_id BIGINT      NOT NULL,
  reader_id  BIGINT      NOT NULL,
  read_at    DATETIME(6) NOT NULL,
  UNIQUE KEY uk_group_msg_reader (message_id, reader_id),
  FOREIGN KEY (message_id) REFERENCES group_messages(id),
  FOREIGN KEY (reader_id)  REFERENCES users(id)
);
```

---

## Sending an IMAGE or FILE — Full Flow

### Image message

1. **Upload** via `POST /api/upload/group-media/{groupId}` (Cloudinary API)  
   → receive `{ secureUrl, publicId }`
2. **Send STOMP frame** to `/app/group.send`:
   ```json
   {
     "groupId": 17,
     "content": "https://res.cloudinary.com/.../group-media/group-17-photo.jpg",
     "type": "IMAGE",
     "fileName": null
   }
   ```
3. Message is persisted in MySQL with the Cloudinary URL as `content`.
4. All group subscribers receive the `GroupMessageResponse` on `/topic/group.17`.

### File message

1. **Upload** via `POST /api/upload/group-media/{groupId}`  
   → receive `{ secureUrl, publicId }`
2. **Send STOMP frame** to `/app/group.send`:
   ```json
   {
     "groupId": 17,
     "content": "https://res.cloudinary.com/.../group-media/report.pdf",
     "type": "FILE",
     "fileName": "Q2-Report.pdf"
   }
   ```
3. `fileName` is stored in MySQL so the UI can display a meaningful download label.

---

## Client Integration Example (SockJS + STOMP.js)

```javascript
const socket = new SockJS('http://localhost:8080/ws');
const client = Stomp.over(socket);

client.connect({ Authorization: `Bearer ${jwt}` }, () => {
  const groupId = 17;

  // Subscribe to incoming messages
  client.subscribe(`/topic/group.${groupId}`, (frame) => {
    const msg = JSON.parse(frame.body);
    console.log('New message:', msg);
  });

  // Subscribe to typing indicators
  client.subscribe(`/topic/group.${groupId}.typing`, (frame) => {
    const event = JSON.parse(frame.body);
    showTypingIndicator(event.senderId, event.typing);
  });

  // Subscribe to read receipts
  client.subscribe(`/topic/group.${groupId}.read`, (frame) => {
    const receipt = JSON.parse(frame.body);
    updateReadCount(receipt.readerId, receipt.readCount);
  });

  // Send a text message
  client.send('/app/group.send', {}, JSON.stringify({
    groupId,
    content: 'Hello group!',
    type: 'TEXT',
    fileName: null
  }));

  // Send typing indicator
  client.send('/app/group.typing', {}, JSON.stringify({
    groupId,
    senderId: 0,   // overwritten server-side
    typing: true
  }));

  // Mark messages as read
  client.send('/app/group.read', {}, JSON.stringify({
    groupId,
    readerId: 0,   // overwritten server-side
    readAt: null,
    readCount: 0
  }));
});
```
