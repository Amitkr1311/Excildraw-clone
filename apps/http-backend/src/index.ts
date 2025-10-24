import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from "./middleware";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors())


app.post("/signup", async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body);

    if (!parsedData.success) {
        console.log(parsedData.error);
        res.status(400).json({
            message: "Incorrect inputs"
        })
        return;
    }
    
    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data?.username,
                // TODO: Hash the pw (use bcrypt)
                password: parsedData.data.password,
                name: parsedData.data.name
            }
        })

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id }, 
                     JWT_SECRET, // Use environment variable
            { expiresIn: '7d' }  // Token expires in 7 days
        );

        res.json({
            userId: user.id,
            token: token // Send token to frontend
        })
    } catch(e) {
        res.status(411).json({
            message: "User already exists with this username"
        })
    }
})

app.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    
    if (!parsedData.success) {
        res.status(400).json({  // Add status code
            message: "Incorrect inputs"
        })
        return;
    }

    try {
        // Find user by email only (not password)
        const user = await prismaClient.user.findFirst({
            where: {
                email: parsedData.data.username
            }
        })

        if (!user) {
            res.status(403).json({
                message: "Invalid credentials"  // Generic message for security
            })
            return;
        }

        // TODO: Compare hashed passwords using bcrypt
        // const isPasswordValid = await bcrypt.compare(parsedData.data.password, user.password);
        // if (!isPasswordValid) {
        //     res.status(403).json({
        //         message: "Invalid credentials"
        //     })
        //     return;
        // }

        // Temporary check until you implement bcrypt (REMOVE THIS)
        if (user.password !== parsedData.data.password) {
            res.status(403).json({
                message: "Invalid credentials"
            })
            return;
        }

        // Generate token with expiration
        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: '7d' }  // Add expiration
        );

        res.json({
            token,
            userId: user.id,  // Optional: send userId back
            name: user.name    // Optional: send user info back
        })
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({  // Add status code
            message: "Incorrect inputs"
        })
        return;
    }
    // @ts-ignore: TODO: Fix this
    const userId = req.userId;

    if (!userId) {  // Add check
        res.status(401).json({
            message: "Unauthorized"
        })
        return;
    }

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        })

        res.status(201).json({  // 201 for resource creation
            roomId: room.id
        })
    } catch(e: any) {  // Type the error
        // Check if it's a unique constraint violation
        if (e.code === 'P2002') {
            res.status(409).json({  // 409 Conflict
                message: "Room already exists with this name"
            })
        } else {
            console.error('Room creation error:', e);
            res.status(500).json({
                message: "Failed to create room"
            })
        }
    }
})

app.get("/chats/:roomId", middleware, async (req, res) => {  // Add middleware for auth
    try {
        const roomId = Number(req.params.roomId);
        
        // Validate roomId is a valid number
        if (isNaN(roomId) || roomId <= 0) {
            res.status(400).json({
                message: "Invalid room ID"
            })
            return;
        }

        // Check if room exists
        const roomExists = await prismaClient.room.findUnique({
            where: { id: roomId }
        });

        if (!roomExists) {
            res.status(404).json({
                message: "Room not found"
            })
            return;
        }

        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 50  // Reduce to 50, add pagination if needed
        });

        res.json({
            messages: messages.reverse()  // Return in chronological order
        })
    } catch(e) {
        console.error('Fetch messages error:', e);
        res.status(500).json({
            message: "Failed to fetch messages",
            messages: []
        })
    }
})

app.get("/room/:slug", middleware, async (req, res) => {  // Add middleware if needed
    try {
        const slug = req.params.slug;

        // Validate slug
        if (!slug || slug.trim() === '') {
            res.status(400).json({
                message: "Invalid room slug"
            })
            return;
        }

        const room = await prismaClient.room.findFirst({
            where: {
                slug
            }
        });

        if (!room) {
            res.status(404).json({
                message: "Room not found"
            })
            return;
        }

        res.json({
            room
        })
    } catch(e) {
        console.error('Fetch room error:', e);
        res.status(500).json({
            message: "Failed to fetch room"
        })
    }
})

app.listen(3002);