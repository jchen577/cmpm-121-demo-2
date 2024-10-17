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
    context.fillText("+", this.x - 8, this.y + 10);
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
const drawChangeEvent = new Event("drawChange");
const toolChangeEvent = new Event("toolMoved");
const displayCommand: markerLines = new markerLines();
const cursorCommand: cursor = new cursor();
const redoCommand: markerLines = new markerLines();
canvas?.addEventListener(
  "drawChange",
  () => {
    displayCommand.display(ctx);
    cursorCommand.display(ctx);
  },
  false
);
canvas?.addEventListener(
  "toolMoved",
  () => {
    displayCommand.display(ctx);
    cursorCommand.display(ctx);
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
    displayCommand.drag(x, y, pos.offsetX, pos.offsetY, strokeWidth);
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
    displayCommand.drag(x, y, pos.offsetX, pos.offsetY, strokeWidth);
    displayCommand.holder2.push(displayCommand.holder);
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
  cursorCommand.x = pos.offsetX;
  cursorCommand.y = pos.offsetY;
  canvas.dispatchEvent(toolChangeEvent);
});
canvas?.addEventListener("mouseout", (pos: MouseEvent) => {
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
  strokeWidth = 1;
};
thick.onclick = () => {
  strokeWidth = 5;
};

function drawLine(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  lineWidth: number
) {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = lineWidth;
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
