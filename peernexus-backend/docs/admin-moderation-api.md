# Admin & Moderation Module API

Server-side enforcement of platform governance: abuse reporting, moderation actions (warn / suspend / ban / delete), and a full immutable audit trail.

---

## Role-Based Access

| Role | Permissions |
|------|-------------|
| Any authenticated user | Submit abuse reports |
| `MODERATOR` | List & review reports, apply moderation actions, view action history |
| `ADMIN` | Everything above + dashboard stats + full audit log |

> Roles are stored in the `users.role` column as `STUDENT`, `VERIFIED_STUDENT`, `MODERATOR`, `ADMIN`.  
> Spring Security enforces them via `@PreAuthorize` on each endpoint.

---

## Enums Reference

### ReportType
| Value | Reported entity |
|-------|----------------|
| `USER` | A user account |
| `DOUBT` | A posted doubt/question |
| `ANSWER` | An answer to a doubt |
| `MESSAGE` | A private or group chat message |
| `GROUP` | A study group |

### ReportStatus
| Value | Meaning |
|-------|---------|
| `OPEN` | Newly submitted, awaiting moderator review |
| `REVIEWING` | A moderator has picked it up |
| `RESOLVED` | Action was taken (linked to a `ModerationAction`) |
| `REJECTED` | Dismissed as invalid |

### ModerationActionType
| Value | Effect |
|-------|--------|
| `WARNING` | Formal warning recorded; no account change |
| `SUSPEND` | Account disabled until `suspendUntil` timestamp |
| `BAN` | Account permanently disabled |
| `DELETE_CONTENT` | Specified content marked deleted; no account change |

---

## REST Endpoints

All endpoints require `Authorization: Bearer <JWT>`.

---

### GET /api/admin/dashboard
**Role:** `ADMIN`

Returns aggregate platform statistics.

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved",
  "data": {
    "totalUsers": 1240,
    "totalDoubts": 534,
    "totalAnswers": 1821,
    "totalGroups": 76,
    "totalMessages": 9302,
    "totalConnections": 3108,
    "openReports": 14,
    "resolvedReports": 203
  }
}
```

---

## Report Management

### POST /api/admin/reports
**Role:** Any authenticated user

Submits an abuse report. Duplicate open/reviewing reports against the same target by the same user are rejected.

**Request body:**
```json
{
  "type": "USER",
  "targetId": 42,
  "reason": "This user is posting spam and harassment"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Report submitted successfully",
  "data": {
    "id": 1,
    "reporterId": 7,
    "reporterName": "Alice",
    "type": "USER",
    "targetId": 42,
    "reason": "This user is posting spam and harassment",
    "status": "OPEN",
    "reviewedById": null,
    "reviewedByName": null,
    "adminNotes": null,
    "resolvedByActionId": null,
    "createdAt": "2025-06-12T15:00:00Z",
    "resolvedAt": null
  }
}
```

**Errors:**
- `400` – Duplicate open report against the same target

---

### GET /api/admin/reports
**Role:** `MODERATOR` or `ADMIN`

Lists all reports with optional filtering. Paginated, newest first.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | `ReportStatus` | Filter by lifecycle status (optional) |
| `type` | `ReportType` | Filter by content type (optional) |
| `page` | int | Page number (default 0) |
| `size` | int | Page size (default 20) |

> If both `status` and `type` are provided, `type` takes precedence.

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Reports retrieved",
  "data": {
    "content": [ /* array of ReportResponse */ ],
    "totalElements": 47,
    "totalPages": 3,
    "size": 20,
    "number": 0
  }
}
```

---

### GET /api/admin/reports/{reportId}
**Role:** `MODERATOR` or `ADMIN`

Returns full detail of a single report.

**Response** `200 OK` — same `ReportResponse` shape as above.  
**Error:** `404` if report not found.

---

### PUT /api/admin/reports/{reportId}/review
**Role:** `MODERATOR` or `ADMIN`

Updates the status and/or admin notes of a report.  
When status is set to `RESOLVED` or `REJECTED`, `resolvedAt` is stamped automatically.

**Request body:**
```json
{
  "status": "REVIEWING",
  "adminNotes": "Currently investigating the account"
}
```

**Response** `200 OK` — updated `ReportResponse`.

---

## Moderation Actions

### POST /api/admin/moderation/actions
**Role:** `MODERATOR` or `ADMIN`

Applies a moderation enforcement action against a user or content.

| Action Type | Required fields | Effect |
|-------------|----------------|--------|
| `WARNING` | `targetUserId`, `reason` | Audit logged; no account change |
| `SUSPEND` | `targetUserId`, `reason`, `suspendUntil` | Account disabled |
| `BAN` | `targetUserId`, `reason` | Account permanently disabled |
| `DELETE_CONTENT` | `targetUserId`, `reason`, `targetContentId`, `targetContentType` | Audit logged |

If `linkedReportId` is provided, the linked report is automatically set to `RESOLVED`.

**Request body (SUSPEND example):**
```json
{
  "targetUserId": 42,
  "actionType": "SUSPEND",
  "reason": "Repeated spam violations",
  "suspendUntil": "2025-07-12T00:00:00Z",
  "targetContentId": null,
  "targetContentType": null,
  "linkedReportId": 1
}
```

**Request body (DELETE_CONTENT example):**
```json
{
  "targetUserId": 42,
  "actionType": "DELETE_CONTENT",
  "reason": "Abusive language in answer",
  "suspendUntil": null,
  "targetContentId": 99,
  "targetContentType": "ANSWER",
  "linkedReportId": 2
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Moderation action applied",
  "data": {
    "id": 5,
    "actorId": 1,
    "actorName": "Admin User",
    "targetUserId": 42,
    "targetUserName": "Bad Actor",
    "actionType": "SUSPEND",
    "reason": "Repeated spam violations",
    "suspendUntil": "2025-07-12T00:00:00Z",
    "targetContentId": null,
    "targetContentType": null,
    "createdAt": "2025-06-12T15:05:00Z"
  }
}
```

---

### GET /api/admin/moderation/actions
**Role:** `MODERATOR` or `ADMIN`

Lists all moderation actions, newest first.

**Query params:** `?page=0&size=20`

**Response** `200 OK` — paged list of `ModerationActionResponse`.

---

### GET /api/admin/moderation/actions/user/{userId}
**Role:** `MODERATOR` or `ADMIN`

Returns the full moderation history for a specific user (all warnings, suspensions, bans, and content deletions targeting them).

**Response** `200 OK` — paged list of `ModerationActionResponse`.

---

## Audit Log

### GET /api/admin/audit-log
**Role:** `ADMIN`

Returns the complete audit trail of all admin/moderator actions, newest first.

**Query params:** `?page=0&size=50`

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Audit log retrieved",
  "data": {
    "content": [
      {
        "id": 101,
        "actorId": 1,
        "actorName": "Admin User",
        "action": "USER_BANNED",
        "targetType": "USER",
        "targetId": 42,
        "details": "Action #5: Repeated spam violations",
        "performedAt": "2025-06-12T15:05:00Z"
      }
    ],
    "totalElements": 350,
    "totalPages": 7,
    "size": 50,
    "number": 0
  }
}
```

**Audit action codes:**

| Code | Trigger |
|------|---------|
| `REPORT_SUBMITTED` | A user submits a report |
| `REPORT_REVIEWED` | A moderator updates report status |
| `REPORT_REJECTED` | Report status set to REJECTED |
| `USER_WARNED` | WARNING action applied |
| `USER_SUSPENDED` | SUSPEND action applied |
| `USER_BANNED` | BAN action applied |
| `CONTENT_DELETED` | DELETE_CONTENT action applied |

---

### GET /api/admin/audit-log/actor/{actorId}
**Role:** `ADMIN`

Returns audit log entries filtered by the actor who performed the actions.

**Response** `200 OK` — paged list of `AuditLogResponse`.

---

## Error Responses

| HTTP Status | Cause |
|-------------|-------|
| `400` | Validation failure or duplicate report |
| `401` | Missing or invalid JWT |
| `403` | Insufficient role (e.g. STUDENT accessing moderator endpoint) |
| `404` | Report, user, or action not found |

---

## Database Schema (auto-generated by Hibernate)

```sql
CREATE TABLE reports (
  id                     BIGINT AUTO_INCREMENT PRIMARY KEY,
  reporter_id            BIGINT        NOT NULL,
  type                   VARCHAR(20)   NOT NULL,   -- ReportType
  target_id              BIGINT        NOT NULL,
  reason                 VARCHAR(1000) NOT NULL,
  status                 VARCHAR(20)   NOT NULL DEFAULT 'OPEN',
  reviewed_by_id         BIGINT,
  admin_notes            VARCHAR(1000),
  resolved_by_action_id  BIGINT,
  created_at             DATETIME(6)   NOT NULL,
  resolved_at            DATETIME(6),
  FOREIGN KEY (reporter_id)           REFERENCES users(id),
  FOREIGN KEY (reviewed_by_id)        REFERENCES users(id),
  FOREIGN KEY (resolved_by_action_id) REFERENCES moderation_actions(id)
);

CREATE TABLE moderation_actions (
  id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
  actor_id             BIGINT        NOT NULL,
  target_user_id       BIGINT        NOT NULL,
  action_type          VARCHAR(20)   NOT NULL,   -- ModerationActionType
  reason               VARCHAR(1000) NOT NULL,
  suspend_until        DATETIME(6),
  target_content_id    BIGINT,
  target_content_type  VARCHAR(20),              -- ReportType
  created_at           DATETIME(6)   NOT NULL,
  FOREIGN KEY (actor_id)       REFERENCES users(id),
  FOREIGN KEY (target_user_id) REFERENCES users(id)
);

CREATE TABLE audit_logs (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  actor_id     BIGINT       ,
  action       VARCHAR(60)   NOT NULL,
  target_type  VARCHAR(20),                       -- ReportType
  target_id    BIGINT,
  details      VARCHAR(2000),
  performed_at DATETIME(6)   NOT NULL,
  FOREIGN KEY (actor_id) REFERENCES users(id)
);
```

---

## Typical Moderation Workflow

```
1. User A reports User B for spam
   POST /api/admin/reports
   → Report #1 created with status OPEN

2. Moderator reviews the report
   PUT /api/admin/reports/1/review
   body: { "status": "REVIEWING", "adminNotes": "Investigating..." }
   → Report #1 status = REVIEWING

3. Moderator issues a warning first
   POST /api/admin/moderation/actions
   body: { "targetUserId": B, "actionType": "WARNING", "reason": "...", "linkedReportId": 1 }
   → ModerationAction #1 created
   → Report #1 auto-resolved (status = RESOLVED)
   → AuditLog entries written for USER_WARNED + REPORT_REVIEWED

4. User B repeats offense → new report #2

5. Admin escalates to BAN
   POST /api/admin/moderation/actions
   body: { "targetUserId": B, "actionType": "BAN", "reason": "...", "linkedReportId": 2 }
   → User B account disabled (enabled = false)
   → ModerationAction #2 created
   → Report #2 auto-resolved
   → AuditLog entry USER_BANNED written
```
