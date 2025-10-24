// import { HTTP_BACKEND } from "@/config";
// import axios from "axios";

// export async function getExistingShapes(roomId: string) {
//     const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
//     const messages = res.data.messages;

//     const shapes = messages.map((x: {message: string}) => {
//         const messageData = JSON.parse(x.message)
//         return messageData.shape;
//     })

//     return shapes;
// }

import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
  // Get token from localStorage
  const bearer = localStorage.getItem("Authorization");
  const token = bearer?.startsWith("Bearer ") ? bearer.slice(7) : bearer;

  if (!token) {
    throw new Error("No authentication token found");
  }

  // Include Authorization header
  const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const messages = res.data.messages;

  const shapes = messages.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData.shape;
  });

  return shapes;
}
