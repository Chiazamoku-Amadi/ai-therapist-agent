import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

// Chat Session Request Function
export async function POST(req: NextRequest) {
  try {
    // Extract the authorization header
    const authHeader = req.headers.get("Authorization");

    // If there's no authorization header, return an error indicating it's required
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_API_URL}/api/chat/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    // If response is unsuccessful, return the error message
    if (!response.ok) {
      const error = await response.json();

      console.error("Failed to create chat session:", error);

      return NextResponse.json(
        { error: error.error || "Failed to create chat session" },
        { status: response.status }
      );
    }

    // If successful, store the received data and returned it as a JSON response
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating chat session:", error);

    return NextResponse.json(
      { error: "Failed to create chat session" },
      { status: 500 }
    );
  }
}
