import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute.jsx";
import AppLayout from "../components/layout/AppLayout.jsx";
import AuthLayout from "../components/layout/AuthLayout.jsx";
import Spinner from "../components/common/Spinner.jsx";

// Page imports
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import NotFound from "../pages/NotFound.jsx";

// Doubts
import DoubtFeed from "../pages/doubts/DoubtFeed.jsx";
import DoubtDetail from "../pages/doubts/DoubtDetail.jsx";
import AskDoubt from "../pages/doubts/AskDoubt.jsx";
import EditDoubt from "../pages/doubts/EditDoubt.jsx";

// Profiles
import MyProfile from "../pages/profile/MyProfile.jsx";
import EditProfile from "../pages/profile/EditProfile.jsx";
import PublicProfile from "../pages/profile/PublicProfile.jsx";

// Connections, notifications & chat
import Connections from "../pages/connections/Connections.jsx";
import Notifications from "../pages/notifications/Notifications.jsx";
import ChatPage from "../pages/chat/ChatPage.jsx";

// Study Groups
import GroupList from "../pages/groups/GroupList.jsx";
import GroupDetail from "../pages/groups/GroupDetail.jsx";
import CreateGroup from "../pages/groups/CreateGroup.jsx";
import EditGroup from "../pages/groups/EditGroup.jsx";

// Leaderboard
import Leaderboard from "../pages/leaderboard/Leaderboard.jsx";

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import AdminReports from "../pages/admin/AdminReports.jsx";
import AdminModeration from "../pages/admin/AdminModeration.jsx";
import AdminAuditLog from "../pages/admin/AdminAuditLog.jsx";

function LoadingScreen() {
  return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Core Layout with Auth wrapper */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />

          {/* Authenticated Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <PublicProfile />
              </ProtectedRoute>
            }
          />

          {/* Doubt module routes */}
          <Route
            path="/doubts"
            element={
              <ProtectedRoute>
                <DoubtFeed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doubts/new"
            element={
              <ProtectedRoute>
                <AskDoubt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doubts/:id"
            element={
              <ProtectedRoute>
                <DoubtDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doubts/:id/edit"
            element={
              <ProtectedRoute>
                <EditDoubt />
              </ProtectedRoute>
            }
          />

          {/* Connections & notifications */}
          <Route
            path="/connections"
            element={
              <ProtectedRoute>
                <Connections />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* Groups module routes */}
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <GroupList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/new"
            element={
              <ProtectedRoute>
                <CreateGroup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:id"
            element={
              <ProtectedRoute>
                <GroupDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:id/edit"
            element={
              <ProtectedRoute>
                <EditGroup />
              </ProtectedRoute>
            }
          />

          {/* Leaderboard */}
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />

          {/* Moderation / Admin dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/moderation"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                <AdminModeration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-log"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminAuditLog />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Authenticated Layout for Login and Register */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
