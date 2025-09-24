import { NextRequest, NextResponse } from "next/server";

// Login Request
export async function POST(request: NextRequest) {
  const body = await request.json(); // Request body
  const BACKEND_API_URL =
    process.env.BACKEND_API_URL || "http://localhost:3001"; // API url

  try {
    // Initiate a POST request to the auth login route
    const res = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body), // Send the request body as a JSON string
    });

    const data = await res.json(); // Get the data from the response

    // If successful, return the data with a success status
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    // Any errors are caught and returned
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}
