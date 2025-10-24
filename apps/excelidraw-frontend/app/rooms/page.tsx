"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";

interface Room {
  id: number;
  name?: string;
  slug?: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [creating, setCreating] = useState(false);
  const [joinSlug, setJoinSlug] = useState("");
  const [joining, setJoining] = useState(false);
  const router = useRouter();

  // Fetch all available rooms
  useEffect(() => {
    const bearer = localStorage.getItem("Authorization");
    const token = bearer?.startsWith("Bearer ") ? bearer.slice(7) : bearer;

    if (!token) {
      router.push("/signin");
      return;
    }

    axios
      .get(`${HTTP_BACKEND}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setRooms(res.data.rooms || []))
      .catch(err => setError(err?.response?.data?.message || "Failed to fetch rooms"))
      .finally(() => setLoading(false));
  }, [router]);

  // Room join helper by ID
  const handleJoin = (roomId: number) => {
    router.push(`/canvas/${roomId}`);
  };

  // Room creation handler
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newRoomName || newRoomName.length < 3) {
      setError("Room name must be at least 3 characters.");
      return;
    }
    setCreating(true);

    try {
      const bearer = localStorage.getItem("Authorization");
      const token = bearer?.startsWith("Bearer ") ? bearer.slice(7) : bearer;

      const res = await axios.post(
        `${HTTP_BACKEND}/room`,
        { name: newRoomName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // After creation, go to new room
      router.push(`/canvas/${res.data.roomId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Room creation failed");
    } finally {
      setCreating(false);
    }
  };

  // Join by room name (slug) handler
  const handleJoinBySlug = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!joinSlug || joinSlug.trim().length < 3) {
      setError("Room name must be at least 3 characters.");
      return;
    }
    setJoining(true);

    try {
      const bearer = localStorage.getItem("Authorization");
      const token = bearer?.startsWith("Bearer ") ? bearer.slice(7) : bearer;

      const res = await axios.get(
        `${HTTP_BACKEND}/room/${encodeURIComponent(joinSlug)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push(`/canvas/${res.data.room.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Room not found");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <h1 className="text-3xl font-bold mb-6 mt-10">Available Rooms</h1>
      
      {/* Create Room */}
      <form onSubmit={handleCreate} className="mb-4 flex gap-2">
        <input
          className="border border-gray-300 px-4 py-2 rounded"
          placeholder="New room name"
          value={newRoomName}
          onChange={e => setNewRoomName(e.target.value)}
          minLength={3}
          maxLength={20}
          required
        />
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition"
          type="submit"
          disabled={creating}
        >
          {creating ? "Creating..." : "Create"}
        </button>
      </form>

      {/* Join by Room Name */}
      <form onSubmit={handleJoinBySlug} className="mb-8 flex gap-2">
        <input
          className="border border-gray-300 px-4 py-2 rounded"
          placeholder="Join by room name"
          value={joinSlug}
          onChange={e => setJoinSlug(e.target.value)}
          minLength={3}
          maxLength={20}
          required
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition"
          type="submit"
          disabled={joining}
        >
          {joining ? "Joining..." : "Join"}
        </button>
      </form>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div>Loading rooms...</div>}
      {!loading && rooms.length === 0 && <div>No rooms available yet.</div>}
      <ul className="space-y-3 w-full max-w-md">
        {rooms.map(room => (
          <li key={room.id}>
            <button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow transition"
              onClick={() => handleJoin(room.id)}
            >
              {room.name || `Room ${room.id}`}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
