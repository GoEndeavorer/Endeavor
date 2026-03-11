import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") ?? "Untitled Endeavor";
  const category = searchParams.get("category") ?? "";
  const members = searchParams.get("members") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          padding: "60px",
        }}
      >
        {/* Brand */}
        <div
          style={{
            fontSize: 24,
            fontVariant: "small-caps",
            letterSpacing: "0.3em",
            color: "#00FF00",
            marginBottom: 40,
          }}
        >
          ENDEAVOR
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: "90%",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {title}
        </div>

        {/* Category badge */}
        {category && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 32,
              backgroundColor: "#00A1D6",
              color: "#FFFFFF",
              fontSize: 20,
              fontWeight: 600,
              padding: "8px 24px",
              borderRadius: 9999,
            }}
          >
            {category}
          </div>
        )}

        {/* Members count */}
        {members && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 24,
              color: "#AAAAAA",
              fontSize: 18,
            }}
          >
            {members} {Number(members) === 1 ? "member" : "members"}
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
