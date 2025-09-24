import { NextRequest, NextResponse } from "next/server";
import { ChatMessage } from "../../../../../../lib/api/chat";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

// GET /api/chat/sessions/[sessionId]/history
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> } // 👈 updated type
) {
  try {
    const { sessionId } = await context.params; // 👈 must await because it's a Promise now

    const response = await fetch(
      `${BACKEND_API_URL}/api/chat/sessions/${sessionId}/history`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to get chat history:", error);

      return NextResponse.json(
        { error: error.error || "Failed to get chat history" },
        { status: response.status }
      );
    }

    const data = await response.json();

    const formattedMessages = data.map((msg: Partial<ChatMessage>) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error("Error getting chat history:", error);

    return NextResponse.json(
      { error: "Failed to get chat history" },
      { status: 500 }
    );
  }
}
