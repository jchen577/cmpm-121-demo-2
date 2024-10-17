import "./style.css";

interface displayable {
  display(context: CanvasRenderingContext2D): void;
}
let strokeWidth: number = 1;
class cursor implements displayable {
  x: number = 0;
  y: number = 0;
  display(context: CanvasRenderingContext2D) {
    context.font = "32px monospace";
    context.fillStyle = "black";
    if (currText == "") {
      context.fillText("+", this.x - 8, this.y + 10);
    } else {
      context.fillText(currText, this.x, this.y);
    }
    context.fillStyle = "white";
  }
}
class stickers implements displayable {
  holder: string[] = [];
  holder2: number[][] = [];
  drag(x: number, y: number): void {
    this.holder.push(currText);
    this.holder2.push([x, y]);
  }
  display(context: CanvasRenderingContext2D) {
    context.font = "32px monospace";
    context.fillStyle = "black";
    for (let i = 0; i < this.holder2.length; i++) {
      context.fillText(this.holder[i], this.holder2[i][0], this.holder2[i][1]);
    }
    context.fillStyle = "white";
  }
}
class markerLines implements displayable {
  holder: number[][] = [];
  holder2: number[][][] = [];
  constructor() {}
  drag(x: number, y: number, x2: number, y2: number, lineWidth: number): void {
    this.holder.push([x, y, x2, y2, lineWidth]);
  }
  display(context: CanvasRenderingContext2D) {
    context.fillRect(0, 0, 256, 256);
    if (!isDrawing) {
      for (let i = 0; i < this.holder2.length; i++) {
        for (let j = 0; j < this.holder2[i].length; j++) {
          drawLine(
            ctx,
            this.holder2[i][j][0],
            this.holder2[i][j][1],
            this.holder2[i][j][2],
            this.holder2[i][j][3],
            this.holder2[i][j][4]
          );
        }
      }
    } else {
      for (let k = 0; k < this.holder.length; k++) {
        drawLine(
          ctx,
          this.holder[k][0],
          this.holder[k][1],
          this.holder[k][2],
          this.holder[k][3],
          this.holder[k][4]
        );
      }
      for (let i = 0; i < this.holder2.length; i++) {
        for (let j = 0; j < this.holder2[i].length; j++) {
          drawLine(
            context,
            this.holder2[i][j][0],
            this.holder2[i][j][1],
            this.holder2[i][j][2],
            this.holder2[i][j][3],
            this.holder2[i][j][4]
          );
        }
      }
    }
  }
}

const app = document.querySelector<HTMLDivElement>("#app")!;

const appTitle = document.createElement("h1");
appTitle.innerHTML = "DRAW!";
app.append(appTitle);

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 256;
canvas.height = 256;

ctx.fillStyle = "white";
ctx.fillRect(10, 10, 256, 256);
let x = 0;
let y = 0;
let isDrawing: boolean = false;
let currText: string = "";
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
  redoCommand.holder = [];
  x = pos.offsetX;
  y = pos.offsetY;
  isDrawing = true;
  cursorCommand.x = pos.offsetX;
  cursorCommand.y = pos.offsetY;
  canvas.dispatchEvent(toolChangeEvent);
});

canvas?.addEventListener("mousemove", (pos: MouseEvent) => {
  if (isDrawing) {
    //holder.push([x, y, pos.offsetX, pos.offsetY]);
    if (!drawEmote) {
      displayCommand.drag(x, y, pos.offsetX, pos.offsetY, strokeWidth);
    } else {
      stickersCommand.drag(x, y);
      stickersCommand.holder.push(currText);
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
      displayCommand.holder2.push(displayCommand.holder);
    } else {
      stickersCommand.drag(x, y);
      stickersCommand.holder.push(currText);
    }
    isDrawing = false;
    x = 0;
    y = 0;
    displayCommand.holder = [];
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

const clear = document.createElement("button");
clear.innerHTML = "clear";
app.append(clear);
const undoer = document.createElement("button");
undoer.innerHTML = "undo";
app.append(undoer);
const redoer = document.createElement("button");
redoer.innerHTML = "redo";
app.append(redoer);
const thin = document.createElement("button");
thin.innerHTML = "thin";
app.append(thin);
const thick = document.createElement("button");
thick.innerHTML = "thick";
app.append(thick);
const emote1 = document.createElement("button");
emote1.innerHTML = "💀";
app.append(emote1);
const emote2 = document.createElement("button");
emote2.innerHTML = "👊";
app.append(emote2);
const emote3 = document.createElement("button");
emote3.innerHTML = "🧠";
app.append(emote3);

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
};
thin.addEventListener("mouseenter", () => {});
thick.onclick = () => {
  drawEmote = false;
  strokeWidth = 5;
};
emote1.onclick = () => {
  drawEmote = true;
  currText = "💀";
};
emote2.onclick = () => {
  drawEmote = true;
  currText = "👊";
};
emote3.onclick = () => {
  drawEmote = true;
  currText = "🧠";
};
function drawLine(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  lineWidth: number
) {
  context.strokeStyle = "black";
  context.lineWidth = lineWidth;
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}
function clearCanvas(context: CanvasRenderingContext2D) {
  context.fillRect(0, 0, 256, 256);
  for (let i = 0; i < displayCommand.holder2.length; i++) {
    redoCommand.holder2.push(displayCommand.holder2[i]);
  }
  displayCommand.holder2 = [];
}
function undo() {
  if (displayCommand.holder2.length > 0) {
    redoCommand.holder2.push(displayCommand.holder2.pop());
    canvas?.dispatchEvent(drawChangeEvent);
  }
}

function redo() {
  if (redoCommand.holder2.length > 0) {
    displayCommand.holder2.push(redoCommand.holder2.pop());
    canvas?.dispatchEvent(drawChangeEvent);
  }
}
