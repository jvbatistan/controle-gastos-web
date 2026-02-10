import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  const { search } = new URL(req.url);

  const res = await fetch(`${API_URL}/api/transactions${search}`, {
    method: "GET",
    headers: {
      Cookie: cookie,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
