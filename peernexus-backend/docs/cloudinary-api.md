# Cloudinary Media API

Handles upload and deletion of all media assets for PeerNexus.
Binary files are stored on **Cloudinary**; only the resulting HTTPS URL
(and optionally the `public_id`) is persisted in MySQL.

---

## Environment Variables Required

| Variable                 | Description                   |
|--------------------------|-------------------------------|
| `CLOUDINARY_CLOUD_NAME`  | Your Cloudinary cloud name    |
| `CLOUDINARY_API_KEY`     | Cloudinary API key            |
| `CLOUDINARY_API_SECRET`  | Cloudinary API secret         |

Set these in your OS environment or in a `.env` file before starting the backend.

---

## Cloudinary Folder Structure

```
peernexus/
├── profile-pictures/   user avatars
├── doubt-images/       images attached to doubt posts
├── chat-media/         media shared inside chat rooms
└── group-images/       group cover / avatar images
```

---

## Upload Endpoints

All upload endpoints:
- **Method**: `POST`
- **Auth**: Bearer JWT required
- **Content-Type**: `multipart/form-data`
- **Form field**: `file` (the binary file)

### Upload Profile Picture

```
POST /api/upload/profile-picture/{userId}
```

| Parameter | Type    | Location | Description                  |
|-----------|---------|----------|------------------------------|
| `userId`  | Long    | Path     | ID of the user               |
| `file`    | Binary  | Form     | Image file (PNG / JPG / WEBP)|

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "data": {
    "secureUrl": "https://res.cloudinary.com/...profile-pictures/user-42.jpg",
    "publicId":  "peernexus/profile-pictures/user-42"
  }
}
```

---

### Upload Doubt Image

```
POST /api/upload/doubt-image/{doubtId}
```

| Parameter | Type   | Location | Description                  |
|-----------|--------|----------|------------------------------|
| `doubtId` | Long   | Path     | ID of the doubt post         |
| `file`    | Binary | Form     | Image file                   |

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Doubt image uploaded successfully",
  "data": {
    "secureUrl": "https://res.cloudinary.com/...doubt-images/doubt-7.png",
    "publicId":  "peernexus/doubt-images/doubt-7"
  }
}
```

---

### Upload Chat Media

```
POST /api/upload/chat-media/{chatRoomId}
```

| Parameter    | Type   | Location | Description                  |
|--------------|--------|----------|------------------------------|
| `chatRoomId` | Long   | Path     | ID of the chat room          |
| `file`       | Binary | Form     | Image or file                |

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Chat media uploaded successfully",
  "data": {
    "secureUrl": "https://res.cloudinary.com/...chat-media/chat-3.jpg",
    "publicId":  "peernexus/chat-media/chat-3"
  }
}
```

---

### Upload Group Image

```
POST /api/upload/group-image/{groupId}
```

| Parameter | Type   | Location | Description                  |
|-----------|--------|----------|------------------------------|
| `groupId` | Long   | Path     | ID of the group              |
| `file`    | Binary | Form     | Image file                   |

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Group image uploaded successfully",
  "data": {
    "secureUrl": "https://res.cloudinary.com/...group-images/group-12.jpg",
    "publicId":  "peernexus/group-images/group-12"
  }
}
```

---

## Delete Endpoint

```
DELETE /api/media?publicId={publicId}
```

| Parameter  | Type   | Location    | Description                          |
|------------|--------|-------------|--------------------------------------|
| `publicId` | String | Query param | Cloudinary public_id of the asset    |

**Auth**: Bearer JWT required

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Media deleted successfully",
  "data": null
}
```

> **Tip**: Store the `publicId` from the upload response alongside the URL in MySQL
> if you need to support deletion later.

---

## Error Responses

| HTTP Status | Cause                                      |
|-------------|--------------------------------------------|
| `400`       | Missing `file` part in multipart form      |
| `401`       | Missing or invalid JWT                     |
| `500`       | Cloudinary SDK threw an `IOException`      |

---

## UploadResult DTO

| Field       | Type   | Description                                      |
|-------------|--------|--------------------------------------------------|
| `secureUrl` | String | HTTPS URL of the asset — **store this in MySQL** |
| `publicId`  | String | Cloudinary public_id — store if deletion needed  |
