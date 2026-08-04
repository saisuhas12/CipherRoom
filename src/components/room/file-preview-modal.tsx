"use client";

import { useEffect } from "react";
import { formatFileSize } from "@/lib/utils";
import type { FileRecord } from "@/lib/supabase/types";

interface FilePreviewModalProps {
  file: FileRecord;
  blobUrl: string | null;
  textContent: string | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onDownload: () => void;
}

export function FilePreviewModal({
  file,
  blobUrl,
  textContent,
  isLoading,
  error,
  onClose,
  onDownload,
}: FilePreviewModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const mime = (file.mime_type || "").toLowerCase();
  const ext = file.original_name.split(".").pop()?.toLowerCase() || "";

  const isImage =
    mime.startsWith("image/") ||
    ["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp", "ico"].includes(ext);

  const isText =
    mime.startsWith("text/") ||
    mime.includes("json") ||
    mime.includes("javascript") ||
    mime.includes("typescript") ||
    mime.includes("xml") ||
    [
      "txt",
      "json",
      "md",
      "js",
      "ts",
      "tsx",
      "jsx",
      "py",
      "css",
      "html",
      "csv",
      "log",
      "env",
      "sh",
      "sql",
      "yaml",
      "yml",
    ].includes(ext);

  const isPdf = mime.includes("pdf") || ext === "pdf";
  const isAudio = mime.startsWith("audio/") || ["mp3", "wav", "ogg", "aac", "m4a"].includes(ext);
  const isVideo = mime.startsWith("video/") || ["mp4", "webm", "mkv", "mov"].includes(ext);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl border border-border bg-card flex flex-col max-h-[90vh] shadow-2xl rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <span className="text-accent font-mono text-base font-bold shrink-0">
              👁
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-mono font-bold text-foreground truncate">
                {file.original_name}
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span>by {file.uploaded_by}</span>
                {file.is_encrypted && (
                  <>
                    <span>•</span>
                    <span className="text-accent">AES-256 Encrypted</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onDownload}
              className="px-3 py-1.5 border border-border text-xs font-mono text-accent hover:bg-accent/10 hover:border-accent transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>↓</span>
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-muted hover:text-foreground font-mono text-base leading-none transition-colors cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center min-h-[300px] bg-background/50">
          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="w-3 h-3 bg-accent animate-ping rounded-full" />
              <p className="text-xs font-mono text-accent">
                Decrypting file in client memory...
              </p>
            </div>
          )}

          {error && (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="text-red-400 font-mono text-xl">⚠️</div>
              <p className="text-sm font-mono text-red-400 max-w-md">{error}</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {isImage && blobUrl && (
                <div className="flex items-center justify-center w-full h-full min-h-[250px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blobUrl}
                    alt={file.original_name}
                    className="max-h-[68vh] max-w-full object-contain border border-border/50 shadow-lg"
                  />
                </div>
              )}

              {isText && textContent !== null && (
                <div className="w-full h-full flex flex-col">
                  <div className="bg-card border border-border p-2 px-4 text-[10px] font-mono text-muted border-b-0 flex justify-between items-center">
                    <span>PREVIEW MODE (TEXT/CODE)</span>
                    <span>{textContent.length} characters</span>
                  </div>
                  <pre className="font-mono text-xs text-foreground bg-background p-4 overflow-auto max-h-[62vh] border border-border leading-relaxed whitespace-pre-wrap break-all select-text">
                    {textContent || "(Empty file)"}
                  </pre>
                </div>
              )}

              {isPdf && blobUrl && (
                <iframe
                  src={blobUrl}
                  className="w-full h-[68vh] border border-border shadow-inner"
                  title={file.original_name}
                />
              )}

              {isAudio && blobUrl && (
                <div className="w-full max-w-md p-8 border border-border bg-card text-center space-y-4">
                  <p className="text-xs font-mono text-accent uppercase tracking-wider">
                    Audio Preview
                  </p>
                  <audio controls src={blobUrl} className="w-full" autoPlay />
                </div>
              )}

              {isVideo && blobUrl && (
                <div className="flex items-center justify-center w-full">
                  <video
                    controls
                    src={blobUrl}
                    className="max-h-[68vh] max-w-full border border-border shadow-lg"
                    autoPlay
                  />
                </div>
              )}

              {!isImage && !isText && !isPdf && !isAudio && !isVideo && (
                <div className="text-center py-12 px-4 space-y-4 max-w-md">
                  <div className="w-12 h-12 border border-border mx-auto flex items-center justify-center font-mono text-xl text-accent">
                    📦
                  </div>
                  <div>
                    <h4 className="text-sm font-mono font-bold text-foreground">
                      Preview Not Available
                    </h4>
                    <p className="text-xs font-mono text-muted mt-1">
                      Visual preview is not supported for binary file type ({file.mime_type || ext}).
                    </p>
                  </div>
                  <button
                    onClick={onDownload}
                    className="px-6 py-2.5 bg-accent text-background font-mono font-bold text-xs hover:bg-accent/90 transition-colors cursor-pointer"
                  >
                    Download File →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
