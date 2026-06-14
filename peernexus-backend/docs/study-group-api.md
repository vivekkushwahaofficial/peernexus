# Study Group Module API

Peer-to-peer study groups with role-based management, join-request workflows,
and Cloudinary image hosting.

---

## Roles

| Role     | Capabilities |
|----------|-------------|
| `OWNER`  | All ADMIN capabilities + delete group, promote to ADMIN, transfer ownership |
| `ADMIN`  | Update group, upload image, approve/reject join requests, remove members |
| `MEMBER` | View group, leave group |
| *(none)* | View public groups, search, submit join requests |

> **Invariant:** Every group always has exactly **one OWNER**.

---

## Enums

### GroupRole
`OWNER` | `ADMIN` | `MEMBER`

### JoinRequestStatus
`PENDING` | `APPROVED` | `REJECTED`

---

## Auth

All mutating endpoints require `Authorization: Bearer <JWT>`.
Read endpoints (GET /api/groups, search, single group, members) are public.

---

## Group Management

### Create Group
```
POST /api/groups
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "name": "Java Enthusiasts",
  "description": "For Java backend devs",
  "topic": "Java",
  "isPrivate": false
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Group created",
  "data": {
    "id": 1,
    "name": "Java Enthusiasts",
    "description": "For Java backend devs",
    "topic": "Java",
    "imageUrl": null,
    "isPrivate": false,
    "memberCount": 1,
    "myRole": "OWNER",
    "ownerId": 7,
    "ownerName": "Alice",
    "createdAt": "2025-06-05T07:00:00Z"
  }
}
```

---

### List All Groups (Trending)
```
GET /api/groups?page=0&size=20
```
Returns groups ordered by member count descending.

---

### Search Groups
```
GET /api/groups/search?q=java&page=0&size=10
```
Searches by name or topic (case-insensitive).

---

### My Groups
```
GET /api/groups/me
Authorization: Bearer <JWT>
```
Returns all groups the authenticated user belongs to.

---

### Get Single Group
```
GET /api/groups/{id}
```
Includes `myRole` (null if not a member).

---

### Update Group
```
PUT /api/groups/{id}
Authorization: Bearer <JWT>   (OWNER or ADMIN)
Content-Type: application/json

{
  "name": "New Name",
  "description": "Updated description",
  "topic": "Spring Boot",
  "isPrivate": true
}
```
All fields are optional — omit fields you don't want to change.

---

### Delete Group
```
DELETE /api/groups/{id}
Authorization: Bearer <JWT>   (OWNER only)
```
Deletes the group, all memberships, and all join requests.

---

### Upload Group Image
```
POST /api/groups/{id}/image
Authorization: Bearer <JWT>   (OWNER or ADMIN)
Content-Type: multipart/form-data

file=<image-binary>
```
Uploads to Cloudinary → stores URL in MySQL → returns updated group.

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Group image updated",
  "data": { /* GroupResponse with imageUrl set */ }
}
```

---

## Membership

### Join Open Group
```
POST /api/groups/{id}/join
Authorization: Bearer <JWT>
```
Works only for **non-private** groups. For private groups use the join-request endpoint.

---

### Leave Group
```
DELETE /api/groups/{id}/leave
Authorization: Bearer <JWT>
```
The **OWNER** cannot leave until ownership is transferred.

---

### List Members
```
GET /api/groups/{id}/members?page=0&size=20
```
Returns members ordered by join date ascending.

**Member response:**
```json
{
  "memberId": 10,
  "userId": 7,
  "userName": "Alice",
  "userEmail": "alice@example.com",
  "role": "OWNER",
  "joinedAt": "2025-06-05T07:00:00Z"
}
```

---

### Remove Member
```
DELETE /api/groups/{id}/members/{memberId}
Authorization: Bearer <JWT>   (OWNER or ADMIN)
```
- OWNER cannot be removed.
- ADMIN cannot remove another ADMIN (only OWNER can).

---

### Promote Member to ADMIN
```
PUT /api/groups/{id}/members/{memberId}/promote
Authorization: Bearer <JWT>   (OWNER only)
```
Promotes a `MEMBER` to `ADMIN`. Cannot promote an existing ADMIN.

---

### Transfer Ownership
```
PUT /api/groups/{id}/members/{memberId}/transfer
Authorization: Bearer <JWT>   (OWNER only)
```
- The target member becomes `OWNER`.
- The current OWNER becomes `ADMIN`.

---

## Join Requests (Private Groups)

### Submit Join Request
```
POST /api/groups/{id}/join-requests
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "message": "I'd love to join, I have 3 years of Java experience."
}
```
Works only for **private** groups. If a previous request was `REJECTED`, the old record is deleted and a new one is created.

---

### List Pending Requests (OWNER/ADMIN)
```
GET /api/groups/{id}/join-requests?page=0&size=20
Authorization: Bearer <JWT>   (OWNER or ADMIN)
```

**Join request response:**
```json
{
  "id": 5,
  "groupId": 1,
  "groupName": "Java Enthusiasts",
  "requesterId": 9,
  "requesterName": "Bob",
  "requesterEmail": "bob@example.com",
  "message": "I want to join!",
  "status": "PENDING",
  "createdAt": "2025-06-05T07:00:00Z",
  "reviewedAt": null
}
```

---

### Approve Join Request
```
PUT /api/groups/{id}/join-requests/{requestId}/approve
Authorization: Bearer <JWT>   (OWNER or ADMIN)
```
Approves the request and adds the user as a `MEMBER`.

---

### Reject Join Request
```
PUT /api/groups/{id}/join-requests/{requestId}/reject
Authorization: Bearer <JWT>   (OWNER or ADMIN)
```

---

### My Join Request History
```
GET /api/groups/join-requests/me?page=0&size=10
Authorization: Bearer <JWT>
```
Returns all join requests the current user has submitted (any status).

---

## Error Responses

| Status | Cause |
|--------|-------|
| `400`  | Invalid input, already a member, group is private/public, request already exists |
| `401`  | Missing/invalid JWT, insufficient role |
| `404`  | Group, member record, or join request not found |

---

## Database Schema (auto-generated by Hibernate)

```sql
CREATE TABLE study_groups (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  description      VARCHAR(1000),
  image_url        VARCHAR(500),
  image_public_id  VARCHAR(300),
  topic            VARCHAR(100),
  is_private       BOOLEAN NOT NULL DEFAULT FALSE,
  member_count     INT NOT NULL DEFAULT 0,
  created_at       DATETIME(6) NOT NULL,
  updated_at       DATETIME(6) NOT NULL
);

CREATE TABLE group_members (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  group_id   BIGINT NOT NULL,
  user_id    BIGINT NOT NULL,
  role       VARCHAR(10) NOT NULL,   -- OWNER | ADMIN | MEMBER
  joined_at  DATETIME(6) NOT NULL,
  UNIQUE KEY uk_group_member (group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES study_groups(id),
  FOREIGN KEY (user_id)  REFERENCES users(id)
);

CREATE TABLE group_join_requests (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  group_id        BIGINT NOT NULL,
  requester_id    BIGINT NOT NULL,
  status          VARCHAR(10) NOT NULL DEFAULT 'PENDING',
  message         VARCHAR(500),
  reviewed_by_id  BIGINT,
  reviewed_at     DATETIME(6),
  created_at      DATETIME(6) NOT NULL,
  UNIQUE KEY uk_join_request (group_id, requester_id),
  FOREIGN KEY (group_id)       REFERENCES study_groups(id),
  FOREIGN KEY (requester_id)   REFERENCES users(id),
  FOREIGN KEY (reviewed_by_id) REFERENCES users(id)
);
```
