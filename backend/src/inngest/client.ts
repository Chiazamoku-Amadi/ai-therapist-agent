import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "ai-therapist-agent",
  // eventKey: process.env.INNGEST_EVENT_KEY,

  eventKey:
    process.env.NODE_ENV === "development"
      ? undefined // no event key locally
      : process.env.INNGEST_EVENT_KEY, // only use in prod
});
