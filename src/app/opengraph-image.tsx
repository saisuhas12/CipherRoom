import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "CipherRoom — Temporary Encrypted Rooms for Secure Chat & File Sharing";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          border: "8px solid #1f1f1f",
          padding: "60px 70px",
          color: "#e5e5e5",
          fontFamily: "monospace",
        }}
      >
        {/* Top bar with status pill */}
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "8px 18px",
              backgroundColor: "rgba(0, 255, 136, 0.08)",
              border: "1px solid rgba(0, 255, 136, 0.3)",
              borderRadius: "4px",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#00ff88",
              }}
            />
            <span
              style={{
                color: "#00ff88",
                fontSize: "16px",
                fontWeight: "bold",
                letterSpacing: "2px",
              }}
            >
              ZERO KNOWLEDGE · CLIENT-SIDE ENCRYPTED
            </span>
          </div>

          <div
            style={{
              color: "#888888",
              fontSize: "18px",
              letterSpacing: "1px",
            }}
          >
            WWW.CIPHEROOM.APP
          </div>
        </div>

        {/* Center branding */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "76px",
              fontWeight: 900,
              letterSpacing: "-2px",
              color: "#ffffff",
              marginBottom: "12px",
            }}
          >
            CIPHE<span style={{ color: "#00ff88" }}>ROOM</span>
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "#888888",
              maxWidth: "850px",
              lineHeight: 1.4,
            }}
          >
            Temporary Encrypted Rooms for Secure Chat & Ephemeral File Sharing
          </div>
        </div>

        {/* Bottom badges row */}
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          {[
            "AES-256-GCM In-Browser",
            "Zero Accounts Required",
            "Auto-Destruct 1h / 6h / 24h",
            "Free & Open Worldwide",
          ].map((text) => (
            <div
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 18px",
                backgroundColor: "#111111",
                border: "1px solid #1f1f1f",
                borderRadius: "4px",
                fontSize: "15px",
                color: "#e5e5e5",
              }}
            >
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  backgroundColor: "#00ff88",
                  marginRight: "10px",
                  borderRadius: "1px",
                }}
              />
              {text}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
