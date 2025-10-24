"use client";

import { WS_URL } from "@/config";
import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}: {roomId: string}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
    //const token = localStorage.getItem('token'); // Get token from localStorage
    const bearer = localStorage.getItem('Authorization'); // or 'token'
    const token = bearer?.startsWith("Bearer ") ? bearer.slice(7) : bearer;

    
    if (!token) {
        console.error('No token found in localStorage');
        // Optionally redirect to login page
        alert("Sign in again");
        window.location.href = '/signin';
        return;
    }

    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
        setSocket(ws);
        const data = JSON.stringify({
            type:   "join_room",
            roomId: Number(roomId)
        });
        console.log(data);
        ws.send(data);
    }

    // Cleanup function to close WebSocket on unmount
    return () => {
        ws.close();
    }
}, [roomId]) // Add roomId to dependencies if it can change
   
    if (!socket) {
        return <div>
            Connecting to server....
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket={socket} />
    </div>
}