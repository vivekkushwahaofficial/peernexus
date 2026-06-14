# Doubt Module API

Base URL: /api/doubts

## Create Doubt
POST /api/doubts

Request body:
- title (string, required)
- content (string, required)
- categoryId (number, required)
- tagNames (array of string, optional)
- imageUrls (array of string, optional)

Response: ApiResponse<DoubtResponse>

## Update Doubt
PUT /api/doubts/{id}

Request body:
- title (string, optional)
- content (string, optional)
- categoryId (number, optional)
- tagNames (array of string, optional)
- imageUrls (array of string, optional)

Response: ApiResponse<DoubtResponse>

## Delete Doubt
DELETE /api/doubts/{id}

Response: ApiResponse<Void>

## Get Doubt By Id
GET /api/doubts/{id}

Response: ApiResponse<DoubtResponse>

## Get All Doubts
GET /api/doubts?page=0&size=10&sort=createdAt,desc

Response: ApiResponse<Page<DoubtResponse>>

## Search Doubts
GET /api/doubts/search?query=java&page=0&size=10

Response: ApiResponse<Page<DoubtResponse>>

## Filter By Category
GET /api/doubts/category/{categoryId}?page=0&size=10

Response: ApiResponse<Page<DoubtResponse>>

## Upload Images
POST /api/doubts/{id}/images

Request body:
- imageUrls (array of string, required)

Response: ApiResponse<DoubtResponse>

## DoubtResponse
- id
- title
- content
- status (OPEN | ANSWERED | CLOSED)
- category { id, name, description }
- author { id, name, role, verified }
- tags (array of string)
- images [{ id, url }]
- createdAt
- updatedAt
