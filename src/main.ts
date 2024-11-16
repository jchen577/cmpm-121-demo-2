import "./style.css";

interface displayable {
	display(context: CanvasRenderingContext2D): void;
}
let strokeWidth: number = 1;
class cursor implements displayable {
	x: number = 0;
	y: number = 0;
	display(context: CanvasRenderingContext2D) {
		context.fillStyle = "black";
		if (drawEmote) {
			context.globalAlpha = 0.7;
			context.fillText(currText, this.x, this.y);
		} else {
			context.fillText(currText, this.x - 10, this.y + 6);
		}
		context.fillStyle = "white";
	}
}
class stickers implements displayable {
	stringBuffer: string[] = [];
	positionBuffer: number[][] = [];
	readPositionBuffer: number[][] = [];
	styleBuffer: string[] = [];
	drag(x: number, y: number): void {
		this.stringBuffer.push(currText);
		this.positionBuffer.push([x, y]);
	}
	readd(pos: number[], str: string) {
		this.styleBuffer.push(str);
		this.readPositionBuffer.push(pos);
	}
	display(context: CanvasRenderingContext2D) {
		context.globalAlpha = 1;
		for (let i = 0; i < this.positionBuffer.length; i++) {
			context.fillText(
				this.stringBuffer[i],
				this.positionBuffer[i][0],
				this.positionBuffer[i][1]
			);
		}
	}
}
class markerLines implements displayable {
	currentLineBuffer: number[][] = [];
	lineMemoryBuffer: number[][][] = [];
	styleMemoryBuffer: string[] = [];
	currentStyleBuffer: string = "";
	constructor() {}
	drag(x: number, y: number, x2: number, y2: number, lineWidth: number): void {
		this.currentLineBuffer.push([x, y, x2, y2, lineWidth]);
	}
	display(context: CanvasRenderingContext2D) {
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		if (!isDrawing) {
			for (let i = 0; i < this.lineMemoryBuffer.length; i++) {
				for (let j = 0; j < this.lineMemoryBuffer[i].length; j++) {
					drawLine(
						context,
						this.lineMemoryBuffer[i][j][0],
						this.lineMemoryBuffer[i][j][1],
						this.lineMemoryBuffer[i][j][2],
						this.lineMemoryBuffer[i][j][3],
						this.lineMemoryBuffer[i][j][4],
						this.styleMemoryBuffer[i]
					);
				}
			}
		} else {
			for (let k = 0; k < this.currentLineBuffer.length; k++) {
				drawLine(
					ctx,
					this.currentLineBuffer[k][0],
					this.currentLineBuffer[k][1],
					this.currentLineBuffer[k][2],
					this.currentLineBuffer[k][3],
					this.currentLineBuffer[k][4],
					this.currentStyleBuffer[0]
				);
			}
			for (let i = 0; i < this.lineMemoryBuffer.length; i++) {
				for (let j = 0; j < this.lineMemoryBuffer[i].length; j++) {
					drawLine(
						context,
						this.lineMemoryBuffer[i][j][0],
						this.lineMemoryBuffer[i][j][1],
						this.lineMemoryBuffer[i][j][2],
						this.lineMemoryBuffer[i][j][3],
						this.lineMemoryBuffer[i][j][4],
						this.styleMemoryBuffer[i]
					);
				}
			}
		}
	}
}

const app = document.querySelector<HTMLDivElement>("#app")!;
const ActionButtonContainer = document.querySelector<HTMLDivElement>(
	"#actionButtonContainer"
)!;
const DrawButtonContainer = document.querySelector<HTMLDivElement>(
	"#drawButtonContainer"
)!;
const StickerContainer =
	document.querySelector<HTMLDivElement>("#stickerContainer")!;

const appTitle = document.createElement("h1");
appTitle.innerHTML = "DRAW!";
app.append(appTitle);

const canvas = <HTMLCanvasElement>document.getElementById("canvas");
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.canvas.width = 256;
ctx.canvas.height = 256;

ctx.fillStyle = "white";
ctx.font = "32px monospace";
ctx.fillRect(10, 10, ctx.canvas.width, ctx.canvas.height);
let x = 0;
let y = 0;
let isDrawing: boolean = false;
let currText: string = "+";
let drawEmote = false;
const drawChangeEvent = new Event("drawChange");
const toolChangeEvent = new Event("toolMoved");
const displayCommand: markerLines = new markerLines();
const cursorCommand: cursor = new cursor();
const redoCommand: markerLines = new markerLines();
const stickersCommand: stickers = new stickers();
canvas?.addEventListener(
	"drawChange",
	() => {
		displayCommand.display(ctx);
		cursorCommand.display(ctx);
		stickersCommand.display(ctx);
	},
	false
);
canvas?.addEventListener(
	"toolMoved",
	() => {
		displayCommand.display(ctx);
		cursorCommand.display(ctx);
		stickersCommand.display(ctx);
	},
	false
);
canvas?.addEventListener("mousedown", (pos: MouseEvent) => {
	redoCommand.currentLineBuffer = [];
	x = pos.offsetX;
	y = pos.offsetY;
	isDrawing = true;
	if (drawEmote) {
		stickersCommand.drag(x, y);
	}
	cursorCommand.x = pos.offsetX;
	cursorCommand.y = pos.offsetY;
	canvas.dispatchEvent(toolChangeEvent);
});

canvas?.addEventListener("mousemove", (pos: MouseEvent) => {
	if (isDrawing) {
		//holder.push([x, y, pos.offsetX, pos.offsetY]);
		if (!drawEmote) {
			displayCommand.currentStyleBuffer = ctx.strokeStyle as string;
			displayCommand.drag(x, y, pos.offsetX, pos.offsetY, strokeWidth);
		}
		x = pos.offsetX;
		y = pos.offsetY;
		canvas.dispatchEvent(drawChangeEvent);
	}
	cursorCommand.x = pos.offsetX;
	cursorCommand.y = pos.offsetY;
	canvas.dispatchEvent(toolChangeEvent);
});

canvas?.addEventListener("mouseup", (pos: MouseEvent) => {
	if (isDrawing) {
		if (!drawEmote) {
			displayCommand.drag(x, y, pos.offsetX, pos.offsetY, strokeWidth);
			displayCommand.lineMemoryBuffer.push(displayCommand.currentLineBuffer);
			displayCommand.styleMemoryBuffer.push(displayCommand.currentStyleBuffer);
		}
		isDrawing = false;
		x = 0;
		y = 0;
		displayCommand.currentLineBuffer = [];
		canvas.dispatchEvent(drawChangeEvent);
	}
	cursorCommand.x = pos.offsetX;
	cursorCommand.y = pos.offsetY;
	canvas.dispatchEvent(toolChangeEvent);
});
canvas?.addEventListener("mouseenter", (pos: MouseEvent) => {
	canvas.style.cursor = "none";
	cursorCommand.x = pos.offsetX;
	cursorCommand.y = pos.offsetY;
	canvas.dispatchEvent(toolChangeEvent);
});
canvas?.addEventListener("mouseout", (pos: MouseEvent) => {
	//canvas.style.cursor = "default";
	cursorCommand.x = pos.offsetX;
	cursorCommand.y = pos.offsetY;
	canvas.dispatchEvent(toolChangeEvent);
});

const clear = createNewButton("clear");
const undoer = createNewButton("undo");
const redoer = createNewButton("redo");
const thin = createNewButton("thin");
const thick = createNewButton("thick");
const changeColor = createNewButton("change color");
createNewSticker("🧠");
createNewSticker("👊");
createNewSticker("💀");
const custom = createNewButton("custom sticker");
const exportor = createNewButton("export");

ActionButtonContainer.appendChild(clear);
ActionButtonContainer.appendChild(undoer);
ActionButtonContainer.appendChild(redoer);
ActionButtonContainer.appendChild(exportor);

DrawButtonContainer.appendChild(thin);
DrawButtonContainer.appendChild(thick);
DrawButtonContainer.appendChild(changeColor);
DrawButtonContainer.appendChild(custom);

exportor.onclick = () => {
	const anchor = document.createElement("a");
	const newCanv = <HTMLCanvasElement>document.getElementById("canvas");
	const ctx2 = newCanv.getContext("2d") as CanvasRenderingContext2D;
	ctx2.canvas.width = 1024;
	ctx2.canvas.height = 1024;
	ctx2.scale(4, 4);
	ctx2.fillStyle = "white";
	displayCommand.display(ctx2);
	stickersCommand.display(ctx2);
	anchor.href = newCanv.toDataURL("image/png");
	anchor.download = "sketchpad.png";
	anchor.click();
	newCanv.remove();
	ctx2.canvas.width = 256;
	ctx2.canvas.height = 256;
	newCanv.remove();
};
changeColor.onclick = () => {
	const color: string = prompt("What color would you like?: ", "") as string;
	const before = ctx.strokeStyle;
	ctx.strokeStyle = color;
	if (ctx.strokeStyle == before) {
		console.log("Invalid Color");
	}
};
clear.onclick = () => {
	clearCanvas(ctx);
};
undoer.onclick = () => {
	undo();
};
redoer.onclick = () => {
	redo();
};
thin.onclick = () => {
	drawEmote = false;
	strokeWidth = 1;
	currText = "+";
};
thin.addEventListener("mouseenter", () => {});
thick.onclick = () => {
	drawEmote = false;
	strokeWidth = 5;
	currText = "+";
};
custom.onclick = () => {
	const stick: string = prompt("Please Input A Sticker: ", "") as string;
	if (stick) {
		createNewSticker(stick);
	}
};
function drawLine(
	context: CanvasRenderingContext2D,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	lineWidth: number,
	color: string
) {
	context.lineWidth = lineWidth;
	const prevColor = context.strokeStyle;
	context.strokeStyle = color;
	context.beginPath();
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
	context.closePath();
	context.strokeStyle = prevColor;
}
function clearCanvas(context: CanvasRenderingContext2D) {
	context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	for (let i = 0; i < displayCommand.lineMemoryBuffer.length; i++) {
		redoCommand.lineMemoryBuffer.push(displayCommand.lineMemoryBuffer[i]);
	}
	displayCommand.styleMemoryBuffer = [];
	displayCommand.lineMemoryBuffer = [];
	stickersCommand.stringBuffer = [];
	stickersCommand.positionBuffer = [];
}
function undo() {
	if (drawEmote) {
		if (stickersCommand.stringBuffer.length > 0) {
			stickersCommand.readPositionBuffer.push(
				stickersCommand.positionBuffer.pop() as number[]
			);
			stickersCommand.styleBuffer.push(
				stickersCommand.stringBuffer.pop() as string
			);
			canvas?.dispatchEvent(toolChangeEvent);
		}
	} else {
		if (displayCommand.lineMemoryBuffer.length > 0) {
			redoCommand.lineMemoryBuffer.push(
				displayCommand.lineMemoryBuffer.pop() as number[][]
			);
			redoCommand.styleMemoryBuffer.push(
				displayCommand.styleMemoryBuffer.pop() as string
			);
			canvas?.dispatchEvent(drawChangeEvent);
		}
	}
}

function createNewSticker(stick: string) {
	const newStick = document.createElement("button");
	newStick.innerHTML = stick;
	StickerContainer.appendChild(newStick);
	newStick.onclick = () => {
		drawEmote = true;
		currText = stick;
	};
}
function createNewButton(name: string) {
	const newButt = document.createElement("button");
	newButt.innerHTML = name;
	app.append(newButt);
	return newButt;
}

function redo() {
	if (drawEmote) {
		if (stickersCommand.readPositionBuffer.length > 0) {
			stickersCommand.positionBuffer.push(
				stickersCommand.readPositionBuffer.pop() as number[]
			);
			stickersCommand.stringBuffer.push(
				stickersCommand.styleBuffer.pop() as string
			);
			canvas?.dispatchEvent(toolChangeEvent);
		}
	} else {
		if (redoCommand.lineMemoryBuffer.length > 0) {
			displayCommand.lineMemoryBuffer.push(
				redoCommand.lineMemoryBuffer.pop() as number[][]
			);
			displayCommand.styleMemoryBuffer.push(
				redoCommand.styleMemoryBuffer.pop() as string
			);
			canvas?.dispatchEvent(drawChangeEvent);
		}
	}
}
