import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";


export function middleware(req: Request, res: Response, next: NextFunction) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers["authorization"];
        
        if (!authHeader) {
            res.status(401).json({
                message: "No token provided"
            })
            return;
        }

        // Extract token from "Bearer <token>" format
        const token = authHeader.startsWith("Bearer ") 
            ? authHeader.substring(7) 
            : authHeader;

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        // Attach userId to request
        // @ts-ignore: TODO: Fix this
        req.userId = decoded.userId;
        
        next();
    } catch (error) {
        // jwt.verify throws an error if token is invalid or expired
        console.error('Token verification error:', error);
        res.status(403).json({
            message: "Invalid or expired token"
        })
    }
}