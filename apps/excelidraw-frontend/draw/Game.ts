import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
    color?: string;
} | {
    type: "pencil";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    color?: string;
}

export class Game {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[]
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }
    
    /**
     * Get canvas-relative coordinates from mouse event
     * Converts viewport coordinates to canvas coordinates
     */
    private getCanvasCoordinates(e: MouseEvent): { x: number, y: number } {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
    }

    setTool(tool: "circle" | "pencil" | "rect" | "eraser") {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        console.log(this.existingShapes);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type == "chat") {
                const parsedShape = JSON.parse(message.message)
                this.existingShapes.push(parsedShape.shape)
                this.clearCanvas();
            }
        }
    }

    clearCanvas() {
        // Clear the entire canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw black background
        this.ctx.fillStyle = "rgba(0, 0, 0)"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Redraw all existing shapes
        this.existingShapes.forEach((shape) => {
            const color = shape.color || "rgba(255, 255, 255)";
            this.ctx.strokeStyle = color;
            this.ctx.fillStyle = color;
            
            if (shape.type === "rect") {
                if (color === "rgba(0, 0, 0)") {
                    // Fill with black for eraser
                    this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
                } else {
                    // Stroke for normal rectangle
                    this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                }
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                if (color === "rgba(0, 0, 0)") {
                    this.ctx.fill(); // Fill for eraser
                } else {
                    this.ctx.stroke(); // Stroke for normal
                }
                this.ctx.closePath();                
            } else if (shape.type === "pencil") {
                // Thicker line for eraser
                this.ctx.lineWidth = color === "rgba(0, 0, 0)" ? 20 : 2;
                this.ctx.lineCap = "round"; // Smooth line caps
                this.ctx.beginPath();
                this.ctx.moveTo(shape.startX, shape.startY);
                this.ctx.lineTo(shape.endX, shape.endY);
                this.ctx.stroke();
                this.ctx.closePath();
                this.ctx.lineWidth = 2; // Reset
            }
        })
    }

    mouseDownHandler = (e: MouseEvent) => {
        const coords = this.getCanvasCoordinates(e);
        this.clicked = true;
        this.startX = coords.x;
        this.startY = coords.y;
    }

    mouseUpHandler = (e: MouseEvent) => {
        this.clicked = false;
        const coords = this.getCanvasCoordinates(e);
        const width = coords.x - this.startX;
        const height = coords.y - this.startY;

        const selectedTool = this.selectedTool;
        const color = selectedTool === "eraser" ? "rgba(0, 0, 0)" : "rgba(255, 255, 255)";
        
        let shape: Shape | null = null;

        if (selectedTool === "rect" || selectedTool === "eraser") {
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                height,
                width,
                color
            }
        } else if (selectedTool === "circle") {
            const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
            shape = {
                type: "circle",
                radius: radius,
                centerX: this.startX + width / 2,
                centerY: this.startY + height / 2,
                color
            }
        } else if (selectedTool === "pencil") {
            shape = {
                type: "pencil",
                startX: this.startX,
                startY: this.startY,
                endX: coords.x,
                endY: coords.y,
                color
            }
        }

        if (!shape) {
            return;
        }

        this.existingShapes.push(shape);

        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId: this.roomId
        }))
    }

    mouseMoveHandler = (e: MouseEvent) => {
        if (this.clicked) {
            const coords = this.getCanvasCoordinates(e);
            const width = coords.x - this.startX;
            const height = coords.y - this.startY;
            
            this.clearCanvas();
            
            const selectedTool = this.selectedTool;
            const color = selectedTool === "eraser" ? "rgba(0, 0, 0)" : "rgba(255, 255, 255)";
            this.ctx.strokeStyle = color;
            this.ctx.fillStyle = color;
            this.ctx.lineCap = "round";
            
            if (selectedTool === "rect" || selectedTool === "eraser") {
                if (selectedTool === "eraser") {
                    this.ctx.fillRect(this.startX, this.startY, width, height);
                } else {
                    this.ctx.strokeRect(this.startX, this.startY, width, height);
                }
            } else if (selectedTool === "circle") {
                const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
                const centerX = this.startX + width / 2;
                const centerY = this.startY + height / 2;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();                
            } else if (selectedTool === "pencil") {
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(coords.x, coords.y);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        }
    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)
        this.canvas.addEventListener("mouseup", this.mouseUpHandler)
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)    
    }
}
