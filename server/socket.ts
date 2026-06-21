import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import jwt from "jsonwebtoken";
import { storage } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Store active connections: userId -> WebSocket
const clients = new Map<string, WebSocket>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    let userId: string | null = null;

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "auth") {
          const token = message.token;
          if (!token) {
            ws.send(JSON.stringify({ type: "error", message: "Token required" }));
            return;
          }

          jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
            if (err) {
              ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
              return;
            }
            userId = decoded.id;
            if (userId) {
              clients.set(userId, ws);
              ws.send(JSON.stringify({ type: "authenticated", userId }));
              console.log(`WebSocket client authenticated: ${userId}`);
            }
          });
          return;
        }

        // If not authenticated, reject messages
        if (!userId) {
          ws.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
          return;
        }

        if (message.type === "message") {
          const { receiverId, productId, content } = message;
          if (!receiverId || !content) {
            ws.send(JSON.stringify({ type: "error", message: "receiverId and content are required" }));
            return;
          }

          // Save message to database
          const savedMsg = await storage.createMessage({
            senderId: userId,
            receiverId,
            productId: productId || null,
            content,
          });

          const outgoingPayload = JSON.stringify({
            type: "message",
            message: savedMsg,
          });

          // Forward to receiver if online
          const receiverSocket = clients.get(receiverId);
          if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
            receiverSocket.send(outgoingPayload);
          }

          // Send confirmation back to sender (including generated id/createdAt)
          ws.send(outgoingPayload);
        }
      } catch (err: any) {
        console.error("WebSocket message error:", err);
        ws.send(JSON.stringify({ type: "error", message: "Failed to parse or handle message" }));
      }
    });

    ws.on("close", () => {
      if (userId) {
        clients.delete(userId);
        console.log(`WebSocket client disconnected: ${userId}`);
      }
    });
  });

  console.log("WebSocket engine mounted on /ws");
}
