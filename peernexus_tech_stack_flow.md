# PeerNexus — Tech Stack & Architecture Flow

> **Presentation-Ready Analysis** — Vivek Kushwaha | Infosys Springboard

---

## 1. High-Level Architecture Overview

```mermaid
graph TB
    subgraph CLIENT["🖥️ Client Layer"]
        Browser["User Browser"]
        React["React 18 SPA"]
        Vite["Vite 5 Dev Server"]
    end

    subgraph GATEWAY["🌐 Gateway / Proxy Layer"]
        Nginx["Nginx 1.27 Reverse Proxy"]
        CORS["CORS Filter"]
    end

    subgraph BACKEND["⚙️ Backend Layer"]
        SpringBoot["Spring Boot 3.5"]
        Security["Spring Security 6"]
        WebSocket["STOMP WebSocket Broker"]
        JPA["Hibernate / JPA 6"]
        Flyway["Flyway Migrations"]
        MapStruct["MapStruct DTOs"]
    end

    subgraph DATA["🗄️ Data Layer"]
        PostgreSQL["PostgreSQL 16"]
        H2["H2 In-Memory (Tests)"]
    end

    subgraph EXTERNAL["☁️ External Services"]
        Cloudinary["Cloudinary CDN"]
        SMTP["SMTP Mail Server"]
    end

    subgraph DEVOPS["🐳 DevOps Layer"]
        Docker["Docker Containers"]
        Compose["Docker Compose"]
        Vercel["Vercel (Frontend)"]
        Render["Render / AWS (Backend)"]
    end

    Browser --> React
    React -->|REST API| Nginx
    React -->|WebSocket| Nginx
    Nginx --> SpringBoot
    SpringBoot --> Security
    SpringBoot --> WebSocket
    SpringBoot --> JPA
    JPA --> PostgreSQL
    JPA -.->|Test Profile| H2
    SpringBoot --> Cloudinary
    SpringBoot --> SMTP
    Flyway --> PostgreSQL
    Docker --> Compose
    React -.->|Deploy| Vercel
    SpringBoot -.->|Deploy| Render

    style CLIENT fill:#1e293b,stroke:#60a5fa,color:#f1f5f9
    style GATEWAY fill:#1e293b,stroke:#a78bfa,color:#f1f5f9
    style BACKEND fill:#1e293b,stroke:#34d399,color:#f1f5f9
    style DATA fill:#1e293b,stroke:#f59e0b,color:#f1f5f9
    style EXTERNAL fill:#1e293b,stroke:#f472b6,color:#f1f5f9
    style DEVOPS fill:#1e293b,stroke:#38bdf8,color:#f1f5f9
```

---

## 2. Tech Stack Breakdown (By Layer)

### 🎨 Frontend Stack

| Technology | Version | Purpose |
|:---|:---|:---|
| **React** | 18.3.1 | Component-based UI library |
| **Vite** | 5.4.0 | Lightning-fast build tool & HMR dev server |
| **Tailwind CSS** | 3.4.9 | Utility-first CSS framework |
| **React Router DOM** | 6.26.1 | Declarative client-side routing with nested layouts |
| **TanStack React Query** | 5.51.0 | Server-state caching, auto-refetching, optimistic updates |
| **Axios** | 1.7.3 | HTTP client with JWT interceptors & refresh token rotation |
| **STOMP.js** | 7.3.0 | WebSocket messaging over STOMP protocol |
| **SockJS Client** | 1.6.1 | WebSocket fallback for legacy browser support |
| **PostCSS** | 8.4.41 | CSS transformer pipeline |
| **Autoprefixer** | 10.4.20 | Automatic vendor prefix injection |

### ⚙️ Backend Stack

| Technology | Version | Purpose |
|:---|:---|:---|
| **Spring Boot** | 3.5.14 | Opinionated Java framework for REST + WebSocket services |
| **Spring Security** | 6.x | Authentication filter chain, RBAC, CORS |
| **Spring Data JPA** | 3.x | Repository abstraction over Hibernate ORM |
| **Hibernate** | 6.x | Object-Relational Mapping with Join Fetch optimizations |
| **Spring WebSocket** | 3.x | STOMP broker relay + SockJS server endpoints |
| **Spring Mail** | 3.x | Transactional email (registration, password reset) |
| **Spring Actuator** | 3.x | Health checks, metrics, and monitoring endpoints |
| **Spring Validation** | 3.x | Bean validation with `@Valid` annotations |
| **JJWT** | 0.12.5 | JWT token generation, signing (HS256), and parsing |
| **MapStruct** | 1.5.5 | Compile-time type-safe entity ↔ DTO mapping |
| **Lombok** | Latest | Boilerplate reduction (`@Data`, `@Builder`, etc.) |
| **Java** | 21 (LTS) | Language runtime with virtual threads support |
| **Maven** | 3.9+ | Dependency management & build lifecycle |

### 🗄️ Database & Migrations

| Technology | Version | Purpose |
|:---|:---|:---|
| **PostgreSQL** | 16 (Alpine) | Production relational database with ACID compliance |
| **Flyway** | 10.x | Version-controlled schema migrations |
| **H2** | 2.2.x | In-memory database for unit/integration tests |

### ☁️ External Services

| Service | Purpose |
|:---|:---|
| **Cloudinary** | CDN for user avatars, group headers, chat attachments |
| **Gmail SMTP** | Email verification codes & password reset links |

### 🐳 DevOps & Deployment

| Technology | Purpose |
|:---|:---|
| **Docker** | Multi-stage containerized builds (JDK → JRE, Node → Nginx) |
| **Docker Compose** | Full-stack orchestration (PostgreSQL + Backend + Frontend) |
| **Nginx** | Production static file server + SPA fallback routing |
| **Vercel** | Frontend CDN deployment (live at `peernexus.vercel.app`) |
| **Render / AWS** | Backend JAR hosting with managed PostgreSQL |

---

## 3. Frontend Architecture Flow

```mermaid
graph LR
    subgraph PAGES["📄 Pages (10 modules)"]
        Home["Home / Landing"]
        Login["Login"]
        Register["Register"]
        Doubts["Doubts Forum"]
        Chat["Chat Inbox"]
        Groups["Study Groups"]
        Profile["User Profile"]
        Connections["Connections"]
        Leaderboard["Leaderboard"]
        Admin["Admin Panel"]
    end

    subgraph COMPONENTS["🧩 Reusable Components"]
        Layout["Layout Shell"]
        ChatComps["Chat Components"]
        GroupComps["Group Components"]
        Forms["Form Components"]
        Common["Common UI"]
        AdminComps["Admin Components"]
    end

    subgraph STATE["🔄 State Management"]
        AuthCtx["AuthContext"]
        ToastCtx["ToastContext"]
        WSCtx["WebSocketContext"]
        RQ["TanStack React Query"]
    end

    subgraph SERVICES["📡 API Services (13 modules)"]
        ApiClient["apiClient.js (Axios + JWT Interceptor)"]
        AuthSvc["authService"]
        UserSvc["userService"]
        DoubtSvc["doubtService"]
        AnswerSvc["answerService"]
        ChatSvc["chatService"]
        ConnSvc["connectionService"]
        GroupSvc["groupService"]
        GroupChatSvc["groupChatService"]
        RepSvc["reputationService"]
        NotifSvc["notificationService"]
        AdminSvc["adminService"]
        CloudSvc["cloudinaryService"]
    end

    subgraph HOOKS["🪝 Custom Hooks (12)"]
        UseAuth["useAuth"]
        UseDoubts["useDoubts"]
        UseChat["useChat"]
        UseGroups["useGroups"]
        UseConn["useConnections"]
        UseAnswers["useAnswers"]
        UseAdmin["useAdmin"]
        UseReputation["useReputation"]
        UseNotifs["useNotifications"]
        UseGroupChat["useGroupChat"]
        UseToast["useToast"]
        UseWS["useWebSocket"]
    end

    subgraph WEBSOCKET["⚡ WebSocket Layer"]
        StompClient["stompClient.js"]
        ChatSocket["chatSocket.js"]
        GroupSocket["groupSocket.js"]
    end

    PAGES --> COMPONENTS
    PAGES --> HOOKS
    HOOKS --> SERVICES
    HOOKS --> STATE
    SERVICES --> ApiClient
    STATE --> WEBSOCKET
    ApiClient -->|HTTP REST| Backend["Spring Boot API :8080"]
    WEBSOCKET -->|STOMP / SockJS| Backend

    style PAGES fill:#0f172a,stroke:#60a5fa,color:#e2e8f0
    style COMPONENTS fill:#0f172a,stroke:#a78bfa,color:#e2e8f0
    style STATE fill:#0f172a,stroke:#34d399,color:#e2e8f0
    style SERVICES fill:#0f172a,stroke:#f59e0b,color:#e2e8f0
    style HOOKS fill:#0f172a,stroke:#fb923c,color:#e2e8f0
    style WEBSOCKET fill:#0f172a,stroke:#f472b6,color:#e2e8f0
```

---

## 4. Backend Module Architecture

```mermaid
graph TB
    subgraph MODULES["Spring Boot Backend Modules"]
        direction TB
        Auth["🔐 auth<br/>controller / dto / entity / repository / service"]
        User["👤 user<br/>controller / dto / entity / repository / service"]
        Doubt["❓ doubt<br/>controller / dto / entity / repository / service"]
        Answer["💡 answer<br/>controller / dto / entity / repository / service"]
        Chat["💬 chat<br/>controller / dto / entity / repository / service"]
        GroupChat["📢 groupchat<br/>controller / dto / entity / repository / service"]
        Group["👥 group<br/>controller / dto / entity / repository / service"]
        Connection["🤝 connection<br/>controller / dto / entity / repository / service"]
        Reputation["🏆 reputation<br/>controller / dto / entity / repository / service"]
        Notification["🔔 notification<br/>controller / dto / entity / repository / service"]
        Admin["🛡️ admin<br/>controller / dto / entity / repository / service"]
        Email["📧 email<br/>service"]
        CloudinaryMod["☁️ cloudinary<br/>config / service"]
    end

    subgraph CONFIG["⚙️ Configuration Layer"]
        SecConfig["SecurityConfig<br/>Filter Chain + RBAC"]
        JwtFilter["JwtAuthenticationFilter<br/>Token Extraction + Validation"]
        JwtService["JwtService<br/>Token Generation + Parsing"]
        WSConfig["WebSocketConfig<br/>STOMP Endpoints + Broker"]
        WSSecConfig["WebSocketSecurityConfig<br/>Channel Interceptors"]
        CloudConfig["CloudinaryConfig<br/>SDK Bean Setup"]
        FlyConfig["FlywayConfig<br/>Migration Runner"]
        DBSeeder["DatabaseSeeder<br/>Initial Admin User"]
    end

    subgraph CROSS_CUTTING["🔧 Cross-Cutting"]
        Common["common<br/>Shared DTOs + Enums"]
        Exception["exception<br/>Global Error Handlers"]
    end

    Auth --> SecConfig
    Auth --> JwtService
    SecConfig --> JwtFilter
    Chat --> WSConfig
    GroupChat --> WSSecConfig
    CloudinaryMod --> CloudConfig
    
    style MODULES fill:#0f172a,stroke:#34d399,color:#e2e8f0
    style CONFIG fill:#0f172a,stroke:#f59e0b,color:#e2e8f0
    style CROSS_CUTTING fill:#0f172a,stroke:#94a3b8,color:#e2e8f0
```

---

## 5. Request Lifecycle & Security Flow

```mermaid
sequenceDiagram
    participant C as 🖥️ React Client
    participant N as 🌐 Nginx
    participant F as 🔒 JwtAuthFilter
    participant SC as 🛡️ Security Chain
    participant R as 📡 RestController
    participant S as ⚙️ Service Layer
    participant M as 🗺️ MapStruct
    participant DB as 🗄️ PostgreSQL

    C->>N: HTTP Request + Bearer Token
    N->>F: Forward to Spring Boot
    F->>F: Extract JWT from Authorization header
    F->>F: Validate signature + expiry (JJWT)
    
    alt Valid Token
        F->>SC: Set SecurityContext (UserId + Roles)
        SC->>SC: Check URL permission rules
        SC->>R: Pass to @RestController
        R->>R: Check @PreAuthorize annotations
        R->>S: Delegate to @Transactional service
        S->>M: Entity ↔ DTO conversion (MapStruct)
        S->>DB: JPA Repository query
        DB-->>S: Result set
        S-->>R: Response DTO
        R-->>C: JSON Response (200 OK)
    else Invalid / Expired Token
        F-->>C: HTTP 401 Unauthorized
        C->>C: Trigger refresh token flow
        C->>N: POST /api/auth/refresh
        N->>R: Refresh endpoint (public)
        R->>S: Validate refresh token (SHA-256 hash check)
        S->>DB: Lookup hashed refresh token
        DB-->>S: Token valid
        S-->>R: New access + refresh tokens
        R-->>C: New JWT pair
        C->>C: Retry original request
    end
```

---

## 6. JWT Authentication Flow (Dual-Token)

```mermaid
graph TB
    subgraph AUTH_FLOW["🔐 JWT Dual-Token Authentication"]
        direction TB
        
        Register["📝 POST /api/auth/register"]
        VerifyEmail["✉️ Email Verification Code Sent"]
        Verify["✅ GET /api/auth/verify?token=xxx"]
        Login["🔑 POST /api/auth/login"]
        AccessToken["🎫 Access Token (15 min TTL)"]
        RefreshToken["🔄 Refresh Token (30 days, SHA-256 hashed in DB)"]
        APICall["📡 API Call with Bearer Token"]
        Expired["⏰ Token Expired (401)"]
        Refresh["🔁 POST /api/auth/refresh"]
        NewTokens["🆕 New Token Pair Issued"]
        Logout["🚪 POST /api/auth/logout"]
        Revoke["❌ Refresh Token Revoked from DB"]
    end

    Register --> VerifyEmail
    VerifyEmail --> Verify
    Verify --> Login
    Login --> AccessToken
    Login --> RefreshToken
    AccessToken --> APICall
    APICall --> Expired
    Expired --> Refresh
    Refresh --> NewTokens
    NewTokens --> APICall
    Login --> Logout
    Logout --> Revoke

    style AUTH_FLOW fill:#0f172a,stroke:#60a5fa,color:#e2e8f0
```

---

## 7. Real-Time WebSocket Architecture

```mermaid
sequenceDiagram
    participant C as 🖥️ React Client
    participant STOMP as 📡 STOMP.js + SockJS
    participant WSI as 🔒 WS Interceptor
    participant Broker as 📬 STOMP Broker
    participant SC as ⚙️ Spring Controller
    participant DB as 🗄️ PostgreSQL

    Note over C,DB: Connection Phase
    C->>STOMP: Create STOMP client with JWT token
    STOMP->>WSI: CONNECT frame (Authorization header)
    WSI->>WSI: Validate JWT signature
    alt Valid
        WSI->>Broker: Accept connection, set principal
        Broker-->>C: CONNECTED frame
    else Invalid
        WSI-->>C: ERROR frame (reject)
    end

    Note over C,DB: Subscription Phase
    C->>Broker: SUBSCRIBE /user/queue/notifications
    C->>Broker: SUBSCRIBE /user/queue/messages
    C->>Broker: SUBSCRIBE /topic/group.{groupId}
    Broker->>WSI: Validate group membership for topic subscriptions
    WSI->>DB: Check existsByGroupIdAndUserId
    
    Note over C,DB: Messaging Phase
    C->>SC: SEND /app/chat.send (message body)
    SC->>DB: Persist message
    SC->>Broker: Push to /user/queue/messages (recipient)
    Broker-->>C: MESSAGE frame to recipient

    Note over C,DB: Live Features
    C->>SC: SEND /app/chat.typing
    SC->>Broker: Broadcast typing indicator
    C->>SC: SEND /app/chat.react (emoji reaction)
    SC->>DB: Persist reaction
    SC->>Broker: Broadcast reaction update
```

---

## 8. Data Flow — Complete Request Pipeline

```mermaid
graph LR
    subgraph FRONTEND["React Frontend"]
        Page["Page Component"]
        Hook["Custom Hook<br/>(e.g. useDoubts)"]
        RQ["TanStack Query<br/>Cache + Auto-Refetch"]
        Service["API Service<br/>(e.g. doubtService)"]
        Axios["Axios Client<br/>+ JWT Interceptor"]
    end

    subgraph BACKEND["Spring Boot Backend"]
        Controller["@RestController"]
        ServiceLayer["@Service<br/>(@Transactional)"]
        Mapper["MapStruct Mapper"]
        Repository["JPA Repository"]
    end

    subgraph DATABASE["PostgreSQL"]
        Tables["Tables<br/>(users, doubts, answers, ...)"]
        Indexes["B-Tree Indexes"]
        Constraints["FK Constraints"]
    end

    Page -->|"render + events"| Hook
    Hook -->|"useQuery / useMutation"| RQ
    RQ -->|"HTTP call"| Service
    Service -->|"configured request"| Axios
    Axios -->|"REST + Bearer JWT"| Controller
    Controller -->|"validate + delegate"| ServiceLayer
    ServiceLayer -->|"entity ↔ DTO"| Mapper
    ServiceLayer -->|"JPQL / derived queries"| Repository
    Repository -->|"SQL"| Tables

    style FRONTEND fill:#0f172a,stroke:#60a5fa,color:#e2e8f0
    style BACKEND fill:#0f172a,stroke:#34d399,color:#e2e8f0
    style DATABASE fill:#0f172a,stroke:#f59e0b,color:#e2e8f0
```

---

## 9. Docker Deployment Architecture

```mermaid
graph TB
    subgraph COMPOSE["🐳 Docker Compose (docker-compose.yml)"]
        direction TB
        
        subgraph PG_CONTAINER["PostgreSQL Container"]
            PG_IMG["postgres:16-alpine"]
            PG_VOL["Volume: postgres_data"]
            PG_PORT["Port: 5432"]
            PG_HEALTH["Healthcheck: pg_isready"]
        end

        subgraph BACKEND_CONTAINER["Backend Container (Multi-Stage)"]
            BUILD_STAGE["Stage 1: eclipse-temurin:21-jdk<br/>mvnw package -DskipTests"]
            RUN_STAGE["Stage 2: eclipse-temurin:21-jre<br/>Non-root user 'peernexus'"]
            BE_PORT["Port: 8080"]
            BE_HEALTH["Healthcheck: /actuator/health"]
        end

        subgraph FRONTEND_CONTAINER["Frontend Container (Multi-Stage)"]
            FE_BUILD["Stage 1: node:20-alpine<br/>npm ci + npm run build"]
            FE_SERVE["Stage 2: nginx:1.27-alpine<br/>SPA fallback routing"]
            FE_PORT["Port: 3000 → 80"]
        end
    end

    subgraph NETWORK["🔗 peernexus-net (bridge)"]
        NET["Internal Docker Network"]
    end

    FRONTEND_CONTAINER -->|depends_on| BACKEND_CONTAINER
    BACKEND_CONTAINER -->|depends_on (healthy)| PG_CONTAINER
    PG_CONTAINER --> NET
    BACKEND_CONTAINER --> NET
    FRONTEND_CONTAINER --> NET

    style COMPOSE fill:#0f172a,stroke:#38bdf8,color:#e2e8f0
    style PG_CONTAINER fill:#1e293b,stroke:#f59e0b,color:#e2e8f0
    style BACKEND_CONTAINER fill:#1e293b,stroke:#34d399,color:#e2e8f0
    style FRONTEND_CONTAINER fill:#1e293b,stroke:#60a5fa,color:#e2e8f0
    style NETWORK fill:#1e293b,stroke:#a78bfa,color:#e2e8f0
```

---

## 10. Role-Based Access Control (RBAC) Hierarchy

```mermaid
graph BT
    STUDENT["🎓 STUDENT<br/>Basic Access"]
    VERIFIED["✅ VERIFIED_STUDENT<br/>Post Doubts, Answer, Vote"]
    MOD["🛡️ MODERATOR<br/>Content Moderation, Warn/Ban"]
    ADMIN["👑 ADMIN<br/>Full System Control"]

    STUDENT --> VERIFIED
    VERIFIED --> MOD
    MOD --> ADMIN

    style STUDENT fill:#1e40af,stroke:#60a5fa,color:#f1f5f9
    style VERIFIED fill:#065f46,stroke:#34d399,color:#f1f5f9
    style MOD fill:#92400e,stroke:#f59e0b,color:#f1f5f9
    style ADMIN fill:#7f1d1d,stroke:#ef4444,color:#f1f5f9
```

| Role | Capabilities |
|:---|:---|
| `STUDENT` | View doubts, browse profiles, manage connections, private chat |
| `VERIFIED_STUDENT` | + Post doubts, submit answers, vote, create groups |
| `MODERATOR` | + Delete content, warn/suspend/ban users, review reports |
| `ADMIN` | + Full user management, system configuration, audit logs |

---

## 11. Reputation System Flow

```mermaid
graph LR
    Actions["User Actions"]
    Ledger["Reputation Ledger<br/>(ReputationTransaction table)"]
    Points["Points Accumulation"]
    Tiers["Dynamic Tier Badges"]

    Actions -->|"ANSWER_POSTED (+5)"| Ledger
    Actions -->|"ANSWER_ACCEPTED (+15)"| Ledger
    Actions -->|"UPVOTE_RECEIVED (+2)"| Ledger
    Actions -->|"DOWNVOTE_RECEIVED (-1)"| Ledger
    Ledger --> Points
    Points --> Tiers

    Tiers --> B["🌱 Beginner<br/>0-49"]
    Tiers --> C["📝 Contributor<br/>50-199"]
    Tiers --> M["🎓 Mentor<br/>200-499"]
    Tiers --> E["⭐ Expert<br/>500-999"]
    Tiers --> L["🏆 Legend<br/>1000+"]

    style Actions fill:#0f172a,stroke:#60a5fa,color:#e2e8f0
    style Ledger fill:#0f172a,stroke:#f59e0b,color:#e2e8f0
    style Points fill:#0f172a,stroke:#34d399,color:#e2e8f0
    style Tiers fill:#0f172a,stroke:#a78bfa,color:#e2e8f0
```

---

## 12. Database Schema Relationships

```mermaid
erDiagram
    USERS ||--o{ DOUBTS : "author_id"
    USERS ||--o{ ANSWERS : "author_id"
    DOUBTS ||--o{ ANSWERS : "doubt_id"
    USERS ||--o{ CONNECTIONS : "requester/recipient"
    USERS ||--o{ GROUP_MEMBERS : "user_id"
    STUDY_GROUPS ||--o{ GROUP_MEMBERS : "group_id"
    USERS ||--o{ CHAT_ROOMS : "user1/user2"
    CHAT_ROOMS ||--o{ MESSAGES : "room_id"
    USERS ||--o{ MESSAGES : "sender_id"
    USERS ||--o{ REPUTATION_TRANSACTIONS : "user_id"
    USERS ||--o{ NOTIFICATIONS : "user_id"

    USERS {
        bigint id PK
        varchar email UK
        varchar password
        varchar role
        int reputation_points
        boolean enabled
        varchar avatar_url
    }

    DOUBTS {
        bigint id PK
        bigint author_id FK
        varchar title
        text content
        varchar category
        boolean resolved
    }

    ANSWERS {
        bigint id PK
        bigint doubt_id FK
        bigint author_id FK
        text content
        boolean accepted
        int upvotes
        int downvotes
    }

    STUDY_GROUPS {
        bigint id PK
        varchar name
        text description
        varchar privacy
        varchar cover_url
    }

    GROUP_MEMBERS {
        bigint id PK
        bigint group_id FK
        bigint user_id FK
        varchar role
    }

    CHAT_ROOMS {
        bigint id PK
        bigint user1_id FK
        bigint user2_id FK
    }

    MESSAGES {
        bigint id PK
        bigint room_id FK
        bigint sender_id FK
        text content
        boolean read
        boolean pinned
    }

    CONNECTIONS {
        bigint id PK
        bigint requester_id FK
        bigint recipient_id FK
        varchar status
    }

    REPUTATION_TRANSACTIONS {
        bigint id PK
        bigint user_id FK
        varchar type
        int points
        timestamp created_at
    }
```

---

## 13. Production Deployment Flow

```mermaid
graph LR
    subgraph DEV["👨‍💻 Development"]
        Code["Source Code"]
        Git["Git Repository"]
    end

    subgraph CI["🔄 Build Pipeline"]
        FE_Build["npm run build<br/>(Vite → dist/)"]
        BE_Build["mvnw package<br/>(Maven → JAR)"]
    end

    subgraph DEPLOY["🚀 Production"]
        VercelDeploy["Vercel CDN<br/>peernexus.vercel.app"]
        RenderDeploy["Render / AWS<br/>Spring Boot JAR"]
        ManagedDB["Managed PostgreSQL"]
    end

    subgraph SERVICES["☁️ Cloud Services"]
        CloudinaryCDN["Cloudinary<br/>Image CDN"]
        GmailSMTP["Gmail SMTP<br/>Transactional Mail"]
    end

    Code --> Git
    Git --> FE_Build
    Git --> BE_Build
    FE_Build --> VercelDeploy
    BE_Build --> RenderDeploy
    RenderDeploy --> ManagedDB
    RenderDeploy --> CloudinaryCDN
    RenderDeploy --> GmailSMTP
    VercelDeploy -->|"API calls"| RenderDeploy

    style DEV fill:#0f172a,stroke:#94a3b8,color:#e2e8f0
    style CI fill:#0f172a,stroke:#f59e0b,color:#e2e8f0
    style DEPLOY fill:#0f172a,stroke:#34d399,color:#e2e8f0
    style SERVICES fill:#0f172a,stroke:#f472b6,color:#e2e8f0
```

---

## 14. Feature Module Summary

| Module | Frontend Pages | Backend Package | Key Endpoints |
|:---|:---|:---|:---|
| **Auth** | Login, Register | `auth/` | `/api/auth/register`, `/login`, `/refresh`, `/verify` |
| **Profiles** | Profile, EditProfile | `user/` | `/api/users/me`, `/api/users/{id}` |
| **Doubts** | DoubtFeed, DoubtDetail | `doubt/` + `answer/` | `/api/doubts`, `/api/answers` |
| **Chat** | ChatInbox, ChatRoom | `chat/` | `/api/chat/rooms`, WebSocket STOMP |
| **Groups** | GroupList, GroupDetail | `group/` + `groupchat/` | `/api/groups`, WebSocket topics |
| **Connections** | ConnectionsList | `connection/` | `/api/connections` |
| **Reputation** | Leaderboard | `reputation/` | `/api/reputation` |
| **Notifications** | NotificationBell | `notification/` | `/api/notifications` + WebSocket push |
| **Admin** | AdminModeration | `admin/` | `/api/admin/*` |
| **Media** | — | `cloudinary/` | Upload/Delete via Cloudinary SDK |
| **Email** | — | `email/` | Internal service (verification, reset) |

---

## 15. Key Engineering Patterns Used

```mermaid
mindmap
  root((PeerNexus<br/>Engineering))
    Security
      JWT Dual-Token Rotation
      RBAC with Spring Security
      WebSocket Channel Interceptors
      IDOR Protection
      CORS Whitelisting
      File Upload Validation
    Architecture
      Clean Layered Architecture
      Controller → Service → Repository
      MapStruct DTO Mapping
      Transactional Service Methods
      Global Exception Handling
    Real-Time
      STOMP over SockJS
      Typing Indicators
      Read Receipts
      Message Reactions
      Online Presence Tracking
    Frontend Patterns
      Context API State Management
      Custom Hooks Abstraction
      Axios Interceptor Chain
      TanStack Query Caching
      Protected Route Guards
    DevOps
      Multi-Stage Docker Builds
      Docker Compose Orchestration
      Flyway DB Migrations
      Health Check Probes
      Non-Root Container Users
```

---

## 16. Tech Stack Visual Summary (Presentation Slide)

```mermaid
graph TB
    subgraph STACK["PeerNexus Technology Stack"]
        direction TB
        
        FE["🎨 FRONTEND<br/>React 18 · Vite 5 · Tailwind CSS 3<br/>TanStack Query · Axios · React Router 6<br/>STOMP.js · SockJS"]
        
        BE["⚙️ BACKEND<br/>Spring Boot 3.5 · Spring Security 6<br/>Hibernate/JPA · JJWT 0.12.5<br/>MapStruct · Lombok · Java 21"]
        
        DB["🗄️ DATABASE<br/>PostgreSQL 16 · Flyway Migrations<br/>H2 (Testing)"]
        
        CLOUD["☁️ CLOUD SERVICES<br/>Cloudinary CDN · Gmail SMTP"]
        
        OPS["🐳 DEVOPS<br/>Docker · Docker Compose · Nginx<br/>Vercel · Render/AWS"]
    end

    FE -->|"REST API + WebSocket"| BE
    BE -->|"JPA/SQL"| DB
    BE -->|"SDK / SMTP"| CLOUD
    FE -.-> OPS
    BE -.-> OPS
    DB -.-> OPS

    style STACK fill:#020617,stroke:#475569,color:#f1f5f9
    style FE fill:#1e3a5f,stroke:#60a5fa,color:#e2e8f0
    style BE fill:#14532d,stroke:#34d399,color:#e2e8f0
    style DB fill:#78350f,stroke:#f59e0b,color:#e2e8f0
    style CLOUD fill:#831843,stroke:#f472b6,color:#e2e8f0
    style OPS fill:#1e293b,stroke:#38bdf8,color:#e2e8f0
```

---

> **Live Demo**: [peernexus.vercel.app](https://peernexus.vercel.app) · **Repository**: [github.com/vivekkushwahaofficial/peernexus](https://github.com/vivekkushwahaofficial/peernexus)
