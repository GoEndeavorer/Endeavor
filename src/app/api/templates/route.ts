import { NextResponse } from "next/server";
import { templates } from "@/lib/templates";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(templates);
}
