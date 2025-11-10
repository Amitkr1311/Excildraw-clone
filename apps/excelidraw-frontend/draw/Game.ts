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
} | {
    type: "text";
    x: number;
    y: number;
    content: string;
    color?: string;
    fontSize?: number;
}


export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";
    private backgroundColor: string = "#000000";

    // Pan and zoom state
    private offsetX = 0;
    private offsetY = 0;
    private scale = 1;
    private isPanning = false;
    private panStartX = 0;
    private panStartY = 0;

    // Text-specific state
    private isTyping = false;
    private textInputX = 0;
    private textInputY = 0;
    private currentText = "";

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
        this.initKeyboardHandlers();
        this.backgroundColor = "#000";
    }

    setBackgroundColor(color: string) {
        this.backgroundColor = color;
        this.clearCanvas();
    }

    /**
     * Get current background color
     */
    getBackgroundColor(): string {
        return this.backgroundColor;
    }

    /**
     * Convert screen coordinates to world coordinates
     * Takes zoom and pan into account
     */
    private screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
        return {
            x: (screenX - this.offsetX) / this.scale,
            y: (screenY - this.offsetY) / this.scale
        };
    }

    /**
     * Get canvas-relative coordinates from mouse event
     */
    private getCanvasCoordinates(e: MouseEvent): { x: number; y: number } {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    /**
     * Initialize keyboard event listeners for text input
     */
    initKeyboardHandlers() {
        window.addEventListener("keydown", this.keyDownHandler);
    }

     /**
     * Handle keyboard input for text tool
     * Captures typed characters and creates text shapes
     */
    keyDownHandler = (e: KeyboardEvent) => {
        if (!this.isTyping) return;

        if (e.key === "Enter") {
            // Finish typing and create the text shape
            if (this.currentText.trim().length > 0) {
                const shape: Shape = {
                    type: "text",
                    x: this.textInputX,
                    y: this.textInputY,
                    content: this.currentText,
                    color: "rgba(255, 255, 255)",
                    fontSize: 24
                };

                this.existingShapes.push(shape);
                this.socket.send(JSON.stringify({
                    type: "chat",
                    message: JSON.stringify({ shape }),
                    roomId: this.roomId
                }));
            }

            // Reset text input state
            this.isTyping = false;
            this.currentText = "";
            this.clearCanvas();
        } else if (e.key === "Backspace") {
            // Remove last character
            this.currentText = this.currentText.slice(0, -1);
            this.clearCanvas();
            this.drawTextPreview();
        } else if (e.key === "Escape") {
            // Cancel text input
            this.isTyping = false;
            this.currentText = "";
            this.clearCanvas();
        } else if (e.key.length === 1) {
            // Add character to current text (only single characters, not special keys)
            this.currentText += e.key;
            this.clearCanvas();
            this.drawTextPreview();
        }
    };

    drawTextPreview() {
        if (!this.isTyping) return;

        this.ctx.fillStyle = "rgba(255, 255, 255)";
        this.ctx.font = `${16 | this.scale}px Arial`;
        this.ctx.fillText(this.currentText + "|", this.textInputX, this.textInputY);
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        this.canvas.removeEventListener("wheel", this.wheelHandler);
    }

    setTool(tool: "circle" | "pencil" | "rect" | "eraser" | "text") {
        this.selectedTool = tool;
        // Cancel any ongoing text input when switching tools
        if (this.isTyping && tool !== "text") {
            this.isTyping = false;
            this.currentText = "";
            this.clearCanvas();
        }
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
                const parsedShape = JSON.parse(message.message);
                this.existingShapes.push(parsedShape.shape);
                this.clearCanvas();
            }
        };
    }

    clearCanvas() {
        // Save current transform
        this.ctx.save();
        
        // Reset transform to clear entire canvas
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.ctx.fillStyle = this.backgroundColor //"rgba(0, 0, 0)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Restore transform
        this.ctx.restore();
        
        // Apply pan and zoom transformations
        this.ctx.setTransform(this.scale, 0, 0, this.scale, this.offsetX, this.offsetY);

        // Draw grid (optional, for visual reference)
        //this.drawGrid();

        // Draw all shapes
        this.existingShapes.forEach((shape) => {
            const color = shape.color || "rgba(255, 255, 255)";
            this.ctx.strokeStyle = color;
            this.ctx.fillStyle = color;

            if (shape.type === "rect") {
                if (color === "rgba(0, 0, 0)") {
                    this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
                } else {
                    this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                }
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                if (color === "rgba(0, 0, 0)") {
                    this.ctx.fill();
                } else {
                    this.ctx.stroke();
                }
                this.ctx.closePath();
            } else if (shape.type === "pencil") {
                this.ctx.lineWidth = (color === "rgba(0, 0, 0)" ? 20 : 2) / this.scale;
                this.ctx.lineCap = "round";
                this.ctx.beginPath();
                this.ctx.moveTo(shape.startX, shape.startY);
                this.ctx.lineTo(shape.endX, shape.endY);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "text") {
                // Render text shape
                const fontSize = (shape.fontSize || 16) / this.scale;
                this.ctx.font = `${fontSize}px Arial`;
                this.ctx.fillStyle = color;
                this.ctx.fillText(shape.content, shape.x, shape.y);
            }
        });
        // Draw text preview if currently typing
        if (this.isTyping) {
            this.drawTextPreview();
        }
    }

    /**
     * Draw a grid for visual reference of the infinite canvas
     */
    private drawGrid() {
        const gridSize = 50; // Grid spacing
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        this.ctx.lineWidth = 1 / this.scale;

        // Calculate visible area in world coordinates
        const startWorld = this.screenToWorld(0, 0);
        const endWorld = this.screenToWorld(this.canvas.width, this.canvas.height);

        // Draw vertical lines
        const startX = Math.floor(startWorld.x / gridSize) * gridSize;
        for (let x = startX; x < endWorld.x; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, startWorld.y);
            this.ctx.lineTo(x, endWorld.y);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        const startY = Math.floor(startWorld.y / gridSize) * gridSize;
        for (let y = startY; y < endWorld.y; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(startWorld.x, y);
            this.ctx.lineTo(endWorld.x, y);
            this.ctx.stroke();
        }
    }

    mouseDownHandler = (e: MouseEvent) => {
        const coords = this.getCanvasCoordinates(e);

        // Text tool: Click to start typing
        if (this.selectedTool === "text") {
            const worldCoords = this.screenToWorld(coords.x, coords.y);
            this.isTyping = true;
            this.textInputX = worldCoords.x;
            this.textInputY = worldCoords.y;
            this.currentText = "";
            return;
        }

        // Middle mouse button or Space+Click for panning
        if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
            this.isPanning = true;
            this.panStartX = coords.x;
            this.panStartY = coords.y;
            this.canvas.style.cursor = "grab";
            return;
        }

        // Regular drawing
        const worldCoords = this.screenToWorld(coords.x, coords.y);
        this.clicked = true;
        this.startX = worldCoords.x;
        this.startY = worldCoords.y;
    };

    mouseUpHandler = (e: MouseEvent) => {
        if (this.isPanning) {
            this.isPanning = false;
            this.canvas.style.cursor = "crosshair";
            return;
        }

        if (!this.clicked) return;

        this.clicked = false;
        const coords = this.getCanvasCoordinates(e);
        const worldCoords = this.screenToWorld(coords.x, coords.y);
        const width = worldCoords.x - this.startX;
        const height = worldCoords.y - this.startY;

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
            };
        } else if (selectedTool === "circle") {
            const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
            shape = {
                type: "circle",
                radius: radius,
                centerX: this.startX + width / 2,
                centerY: this.startY + height / 2,
                color
            };
        } else if (selectedTool === "pencil") {
            shape = {
                type: "pencil",
                startX: this.startX,
                startY: this.startY,
                endX: worldCoords.x,
                endY: worldCoords.y,
                color
            };
        }

        if (!shape) return;

        this.existingShapes.push(shape);
        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape }),
            roomId: this.roomId
        }));
    };

    mouseMoveHandler = (e: MouseEvent) => {
        const coords = this.getCanvasCoordinates(e);

        // Handle panning
        if (this.isPanning) {
            const dx = coords.x - this.panStartX;
            const dy = coords.y - this.panStartY;
            this.offsetX += dx;
            this.offsetY += dy;
            this.panStartX = coords.x;
            this.panStartY = coords.y;
            this.clearCanvas();
            return;
        }

        // Handle drawing preview
        if (this.clicked) {
            const worldCoords = this.screenToWorld(coords.x, coords.y);
            const width = worldCoords.x - this.startX;
            const height = worldCoords.y - this.startY;

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
                this.ctx.lineWidth = 2 / this.scale;
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(worldCoords.x, worldCoords.y);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        }
    };

    /**
     * Handle mouse wheel for zooming
     */
    wheelHandler = (e: WheelEvent) => {
        e.preventDefault();

        const coords = this.getCanvasCoordinates(e);
        const worldBefore = this.screenToWorld(coords.x, coords.y);

        // Zoom in or out
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        this.scale *= zoomFactor;

        // Clamp zoom level
        this.scale = Math.max(0.1, Math.min(10, this.scale));

        // Adjust offset to zoom towards cursor
        const worldAfter = this.screenToWorld(coords.x, coords.y);
        this.offsetX += (worldAfter.x - worldBefore.x) * this.scale;
        this.offsetY += (worldAfter.y - worldBefore.y) * this.scale;

        this.clearCanvas();
    };

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
        this.canvas.addEventListener("wheel", this.wheelHandler);
        window.removeEventListener("keydown", this.keyDownHandler);
    }
}
