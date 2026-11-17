"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { useUsername } from "@/hooks/use-username";
import { usePreventInspect } from "@/hooks/use-prevent-inspect";

// Lazy-load heavy components to maximize desktop & mobile performance and reduce TBT
const VaultMesh = dynamic(
  () => import("@/components/landing/vault-mesh").then((mod) => ({ default: mod.VaultMesh })),
  { ssr: false }
);

const PublicChat = dynamic(
  () => import("@/components/landing/public-chat").then((mod) => ({ default: mod.PublicChat })),
  { ssr: false }
);

const UsernameModal = dynamic(
  () => import("@/components/username-modal").then((mod) => ({ default: mod.UsernameModal })),
  { ssr: false }
);

const CreateRoomDialog = dynamic(
  () => import("@/components/create-room-dialog").then((mod) => ({ default: mod.CreateRoomDialog })),
  { ssr: false }
);

const JoinRoomDialog = dynamic(
  () => import("@/components/join-room-dialog").then((mod) => ({ default: mod.JoinRoomDialog })),
  { ssr: false }
);

// Lazy-load below-the-fold sections for reduced initial bundle size
const HowItWorks = dynamic(
  () => import("@/components/landing/how-it-works").then((mod) => ({ default: mod.HowItWorks })),
  { ssr: true }
);
const UseCases = dynamic(
  () => import("@/components/landing/use-cases").then((mod) => ({ default: mod.UseCases })),
  { ssr: true }
);

export default function Home() {
  usePreventInspect(true);

  const { username, isLoading, setUsername } = useUsername();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  // Pending action to execute after username is set
  const [pendingAction, setPendingAction] = useState<"create" | "join" | "chat" | null>(
    null
  );

  const handleCreateClick = () => {
    if (!username) {
      setPendingAction("create");
      return;
    }
    setShowCreate(true);
  };

  const handleJoinClick = () => {
    if (!username) {
      setPendingAction("join");
      return;
    }
    setShowJoin(true);
  };

  const handleRequireUsernameForChat = () => {
    if (!username) {
      setPendingAction("chat");
    }
  };

  const handleUsernameSubmit = (name: string) => {
    const result = setUsername(name);
    if (result.success && pendingAction) {
      if (pendingAction === "create") setShowCreate(true);
      if (pendingAction === "join") setShowJoin(true);
      setPendingAction(null);
    }
    return result;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-2 h-2 bg-accent animate-pulse" />
      </div>
    );
  }

  return (
    <main className="flex-1">
      {/* 3D Background */}
      <VaultMesh />

      {/* 24/7 Global Public Open Chat (Left Side) */}
      <PublicChat
        username={username}
        onRequireUsername={handleRequireUsernameForChat}
      />

      {/* Username modal - shown when user needs a handle to chat, create, or join */}
      {pendingAction && !username && (
        <UsernameModal
          onSubmit={handleUsernameSubmit}
          onClose={() => setPendingAction(null)}
        />
      )}

      {/* Create/Join dialogs */}
      {showCreate && username && (
        <CreateRoomDialog
          username={username}
          onClose={() => setShowCreate(false)}
        />
      )}
      {showJoin && (
        <JoinRoomDialog onClose={() => setShowJoin(false)} />
      )}

      {/* Landing content */}
      <div
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.id === "hero-create-room") handleCreateClick();
          if (target.id === "hero-join-room") handleJoinClick();
        }}
      >
        <Hero />
      </div>
      <Features />
      <HowItWorks />
      <UseCases />
      <Footer />
    </main>
  );
}
