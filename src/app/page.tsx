"use client";

import { useState } from "react";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { UsernameModal } from "@/components/username-modal";
import { CreateRoomDialog } from "@/components/create-room-dialog";
import { JoinRoomDialog } from "@/components/join-room-dialog";
import { useUsername } from "@/hooks/use-username";

export default function Home() {
  const { username, isLoading, needsUsername, setUsername } = useUsername();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  // Pending action to execute after username is set
  const [pendingAction, setPendingAction] = useState<"create" | "join" | null>(
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
      {/* Username modal */}
      {(needsUsername || pendingAction) && !username && (
        <UsernameModal onSubmit={handleUsernameSubmit} />
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
      <Footer />
    </main>
  );
}
