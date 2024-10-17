import "./style.css";

interface displayable {
  display(context: CanvasRenderingContext2D): void;
}
let strokeWidth: number = 1;
class markerLines {
  holder: number[][] = [];
  holder2: number[][][] = [];
  constructor() {}
  drag(x: number, y: number, x2: number, y2: number, lineWidth: number): void {
    this.holder.push([x, y, x2, y2, lineWidth]);
  }
  display(context: CanvasRenderingContext2D) {
    if (!isDrawing) {
      context.fillRect(0, 0, 256, 256);
      for (let i = 0; i < displayCommand.holder2.length; i++) {
        for (let j = 0; j < displayCommand.holder2[i].length; j++) {
          drawLine(
            ctx,
            displayCommand.holder2[i][j][0],
            displayCommand.holder2[i][j][1],
            displayCommand.holder2[i][j][2],
            displayCommand.holder2[i][j][3],
            displayCommand.holder2[i][j][4]
          );
        }
      }
    } else {
      context.fillRect(0, 0, 256, 256);
      for (let k = 0; k < cursorCommand.holder.length; k++) {
        drawLine(
          ctx,
          cursorCommand.holder[k][0],
          cursorCommand.holder[k][1],
          cursorCommand.holder[k][2],
          cursorCommand.holder[k][3],
          cursorCommand.holder[k][4]
        );
      }
      for (let i = 0; i < displayCommand.holder2.length; i++) {
        for (let j = 0; j < displayCommand.holder2[i].length; j++) {
          drawLine(
            context,
            displayCommand.holder2[i][j][0],
            displayCommand.holder2[i][j][1],
            displayCommand.holder2[i][j][2],
            displayCommand.holder2[i][j][3],
            displayCommand.holder2[i][j][4]
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
const displayCommand: markerLines = new markerLines();
const cursorCommand: markerLines = new markerLines();
const redoCommand: markerLines = new markerLines();
canvas?.addEventListener(
  "drawChange",
  () => {
    displayCommand.display(ctx);
  },
  false
);
canvas?.addEventListener("mousedown", (pos: MouseEvent) => {
  redoCommand.holder = [];
  x = pos.offsetX;
  y = pos.offsetY;
  isDrawing = true;
});

canvas?.addEventListener("mousemove", (pos: MouseEvent) => {
  if (isDrawing) {
    //holder.push([x, y, pos.offsetX, pos.offsetY]);
    cursorCommand.drag(x, y, pos.offsetX, pos.offsetY, strokeWidth);
    canvas.dispatchEvent(drawChangeEvent);
    x = pos.offsetX;
    y = pos.offsetY;
  }
});

canvas?.addEventListener("mouseup", (pos: MouseEvent) => {
  if (isDrawing) {
    cursorCommand.drag(x, y, pos.offsetX, pos.offsetY, strokeWidth);
    displayCommand.holder2.push(cursorCommand.holder);
    isDrawing = false;
    canvas.dispatchEvent(drawChangeEvent);
    x = 0;
    y = 0;
    cursorCommand.holder = [];
  }
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
