import { NextResponse } from "next/server";
import { analyzeCompany } from "@/lib/agent";

export async function POST(req: Request) {
  try {
    const { company } = await req.json();

    if (!company) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    const analysis = await analyzeCompany(company);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Research API Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
