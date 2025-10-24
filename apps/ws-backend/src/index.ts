import { WebSocket, WebSocketServer } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket,
  rooms: Number[],
  userId: string
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    //const token = 
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded == "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch(e) {
    return null;
  }
}

wss.on('connection', function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";
  const userId = checkUser(token);

  if (userId == null) {
    ws.close()
    return null;
  }

  users.push({
    userId,
    rooms: [],
    ws
  })

  ws.on('message', async function message(data) {
    let parsedData;
    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
    }

    // When a user joins a room
      if (parsedData.type === "join_room") {
        const user = users.find(x => x.ws === ws);
        if (user && !user.rooms.includes(Number(parsedData.roomId))) {
          user.rooms.push(Number(parsedData.roomId));
          console.log(`After join: User ${user.userId}, rooms: ${user.rooms}`);
        }
      }

      // When a user leaves a room
      if (parsedData.type === "leave_room") {
        const user = users.find(x => x.ws === ws);
        if (!user) return;
        user.rooms = user.rooms.filter(x => x !== Number(parsedData.roomId));
      }

      // When broadcasting a chat message
      if (parsedData.type === "chat") {
        const roomId = Number(parsedData.roomId);
        const message = parsedData.message;

        await prismaClient.chat.create({
          data: {
            roomId,
            message,
            userId
          }
        });

        users.forEach(user => {
          console.log(`User ${user.userId}, rooms: ${user.rooms}`);
          if (user.rooms.includes(roomId)) {
            user.ws.send(JSON.stringify({
              type: "chat",
              message,
              roomId
            }));
          }
        });
      }

  });

});

