"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { getFiles, deleteFile, getSignedUrl } from "@/lib/actions/files";
import { encryptFile, decryptFile } from "@/lib/crypto";
import { formatFileSize, formatTimeRemaining } from "@/lib/utils";
import { isAllowedMimeType } from "@/lib/validations";
import type { FileRecord } from "@/lib/supabase/types";

interface FilesProps {
  roomId: string;
  roomExpiresAt: string;
  username: string;
  roomPassword: string;
}

export function Files({ roomId, roomExpiresAt, username, roomPassword }: FilesProps) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Time remaining display
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadFiles = useCallback(async () => {
    const data = await getFiles(roomId);
    setFiles(data);
  }, [roomId]);

  // Load files on mount
  useEffect(() => {
    let cancelled = false;
    getFiles(roomId).then((data) => {
      if (!cancelled) setFiles(data);
    });
    return () => { cancelled = true; };
  }, [roomId]);

  // Realtime file updates
  useEffect(() => {
    const channel = supabase
      .channel(`room-files:${roomId}`)
      .on("broadcast", { event: "files_change" }, () => {
        loadFiles();
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, loadFiles]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError("");
    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];

        if (file.size > 100 * 1024 * 1024) {
          setError(`${file.name} exceeds 100MB limit.`);
          continue;
        }

        if (file.type && !isAllowedMimeType(file.type)) {
          setError(`${file.name} (type: ${file.type}) is not an allowed file format.`);
          continue;
        }

        setUploadProgress(10);

        // Encrypt file
        const arrayBuffer = await file.arrayBuffer();
        setUploadProgress(30);

        const encryptedData = await encryptFile(arrayBuffer, roomPassword);
        setUploadProgress(60);

        // Create FormData
        const formData = new FormData();
        formData.append(
          "file",
          new Blob([encryptedData], { type: "application/octet-stream" }),
          file.name
        );
        formData.append("roomId", roomId);
        formData.append("username", username);
        formData.append("isEncrypted", "true");
        formData.append("originalMimeType", file.type || "application/octet-stream");

        // Upload
        const response = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
        });

        setUploadProgress(90);

        const result = await response.json();
        if (!response.ok) {
          setError(result.error || "Upload failed.");
        } else {
          channelRef.current?.send({
            type: "broadcast",
            event: "files_change",
          });
        }

        setUploadProgress(100);
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      loadFiles();
    }
  };

  const handleDownload = async (file: FileRecord) => {
    try {
      const url = await getSignedUrl(file.storage_path);
      if (!url) {
        setError("Failed to generate download link.");
        return;
      }

      const response = await fetch(url);
      const encryptedData = await response.arrayBuffer();

      if (file.is_encrypted) {
        // Decrypt
        const decryptedData = await decryptFile(encryptedData, roomPassword);
        const blob = new Blob([decryptedData], { type: file.mime_type });
        const downloadUrl = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = file.original_name;
        a.click();
        URL.revokeObjectURL(downloadUrl);
      } else {
        const blob = new Blob([encryptedData]);
        const downloadUrl = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = file.original_name;
        a.click();
        URL.revokeObjectURL(downloadUrl);
      }
    } catch {
      setError("Download failed. The file may be corrupted or the password may be wrong.");
    }
  };

  const handleDelete = async (fileId: string) => {
    const result = await deleteFile(fileId, roomId);
    if (result.error) {
      setError(result.error);
    } else {
      channelRef.current?.send({
        type: "broadcast",
        event: "files_change",
      });
      loadFiles();
    }
  };

  const getFileIcon = (mime: string) => {
    if (mime.startsWith("image/")) return "◻";
    if (mime.includes("pdf")) return "◼";
    if (mime.includes("zip")) return "◆";
    if (mime.includes("word") || mime.includes("document")) return "◇";
    return "○";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Upload area */}
      <div
        className={`m-4 border-2 border-dashed transition-colors cursor-pointer ${
          dragOver
            ? "border-accent bg-accent/5"
            : "border-border hover:border-muted"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center py-8">
          {isUploading ? (
            <>
              <p className="text-sm font-mono text-accent mb-2">
                Encrypting & Uploading...
              </p>
              <div className="w-48 h-1 bg-border">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs font-mono text-muted mt-2">
                {uploadProgress}%
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-mono text-muted">
                Drop files here or click to upload
              </p>
              <p className="text-xs font-mono text-muted/50 mt-1">
                Files are encrypted before upload · Max 100MB
              </p>
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={(e) => handleUpload(e.target.files)}
      />

      {error && (
        <p className="text-sm text-red-400 font-mono px-4 mb-2">{error}</p>
      )}

      {/* File list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
        {files.length === 0 && !isUploading && (
          <p className="text-sm text-muted font-mono text-center py-8">
            No files uploaded yet.
          </p>
        )}

        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between py-2.5 px-3 border border-border hover:bg-white/[0.02] transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-accent font-mono text-sm shrink-0">
                {getFileIcon(file.mime_type)}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-mono text-foreground truncate">
                  {file.original_name}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-muted">
                  <span>{formatFileSize(file.size)}</span>
                  <span>by {file.uploaded_by}</span>
                  {file.is_encrypted && (
                    <span className="text-accent">encrypted</span>
                  )}
                  <span>expires {formatTimeRemaining(roomExpiresAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleDownload(file)}
                className="px-2 py-1 text-xs font-mono text-accent hover:bg-accent/10 transition-colors"
              >
                ↓
              </button>
              {file.uploaded_by === username && (
                <button
                  onClick={() => handleDelete(file.id)}
                  className="px-2 py-1 text-xs font-mono text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
