import { NextResponse } from "next/server";

export const ok  = (data, status = 200) => NextResponse.json(data, { status });
export const err = (msg,  status = 400) => NextResponse.json({ error: msg }, { status });
