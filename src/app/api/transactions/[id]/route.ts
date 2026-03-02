import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const cookie = req.headers.get("cookie") || "";
  const body = await req.text();

  const res = await fetch(`${API_URL}/api/transactions/${id}`, {
    method: "PATCH",
    headers: {
      Cookie: cookie,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
  });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const cookie = req.headers.get("cookie") || "";

  const res = await fetch(`${API_URL}/api/transactions/${id}`, {
    method: "DELETE",
    headers: {
      Cookie: cookie,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  return new NextResponse(null, { status: res.status });
}
