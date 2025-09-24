import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

// Fetches chat session history
export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Extract session ID
    const { sessionId } = params;

    // Fetch chat session history using the session ID
    const response = await fetch(
      `${BACKEND_API_URL}/chat/sessions/${sessionId}/history`
    );

    // If not successful, an error is thrown
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // If successful, return the data as JSON
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in chat history API:", error);

    return NextResponse.json(
      { error: "Faled to fetch chat history" },
      { status: 500 }
    );
  }
}

// For adding a new message
export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params; // Extract sessionId from params
    const { message } = await req.json(); // Extract message from the request body

    // I no message, return an error
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Send POST request to create the new message
    const response = await fetch(
      `${BACKEND_API_URL}/chat/sessions/${sessionId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      }
    );

    // If response is not successful, throw an error
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // If response is successful, return the data as JSON
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in chat API:", error);

    return NextResponse.json(
      { error: "Faled to process chat message" },
      { status: 500 }
    );
  }
}
