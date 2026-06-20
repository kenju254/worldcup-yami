import { NextRequest, NextResponse } from "next/server";
import { fetchSecureApi } from "@/utils/api";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const data = await fetchSecureApi(`/team/${resolvedParams.id}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Team API proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch team data" }, { status: 500 });
  }
}
