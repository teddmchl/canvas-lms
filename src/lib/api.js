import { NextResponse } from "next/server";

export const ok = (data, status = 200) => NextResponse.json(data, { status });

export const err = (error, status = 400) => {
  let message = typeof error === "string" ? error : "An unexpected error occurred.";
  
  if (error instanceof Error) {
    // Hide details for 5xx errors to prevent leaking server state
    message = status >= 500 ? "Internal Server Error" : error.message;
    if (status >= 500) {
      console.error(`[API ERROR ${status}]`, error.stack || error);
    }
  }

  return NextResponse.json({ error: message }, { status });
};
