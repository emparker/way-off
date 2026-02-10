import { NextResponse } from "next/server";
import { getTodayQuestion } from "@/lib/questions";

export async function GET() {
  return NextResponse.json(getTodayQuestion());
}
