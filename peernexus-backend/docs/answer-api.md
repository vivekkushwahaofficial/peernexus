# Answer Module API

Base URL: /api/answers

## Create Answer
POST /api/answers

Request body:
- doubtId (number, required)
- content (string, required)

Response: ApiResponse<AnswerResponse>

## Update Answer
PUT /api/answers/{id}

Request body:
- content (string, required)

Response: ApiResponse<AnswerResponse>

## Delete Answer
DELETE /api/answers/{id}

Response: ApiResponse<Void>

## Get Answer By Id
GET /api/answers/{id}

Response: ApiResponse<AnswerResponse>

## Get Answers By Doubt
GET /api/answers/doubt/{doubtId}?page=0&size=10

Response: ApiResponse<Page<AnswerResponse>>

## Accept Answer
POST /api/answers/{id}/accept

Response: ApiResponse<AnswerResponse>

## Vote Answer
POST /api/answers/{id}/vote

Request body:
- type (UPVOTE | DOWNVOTE)

Response: ApiResponse<AnswerResponse>

## AnswerResponse
- id
- doubtId
- content
- accepted
- upvotes
- downvotes
- author { id, name, role, verified }
- createdAt
- updatedAt
