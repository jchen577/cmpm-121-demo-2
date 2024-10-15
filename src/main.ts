import "./style.css";

//const APP_NAME = "Hello";
const app = document.querySelector<HTMLDivElement>("#app")!;

//document.title = APP_NAME;
//app.innerHTML = APP_NAME;

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
canvas?.addEventListener("mousedown", (pos: MouseEvent) => {
  x = pos.offsetX;
  y = pos.offsetY;
  isDrawing = true;
});

canvas?.addEventListener("mousemove", (pos: MouseEvent) => {
  if (isDrawing) {
    drawLine(ctx, x, y, pos.offsetX, pos.offsetY);
    x = pos.offsetX;
    y = pos.offsetY;
  }
});

canvas?.addEventListener("mouseup", (pos: MouseEvent) => {
  if (isDrawing) {
    drawLine(ctx, x, y, pos.offsetX, pos.offsetY);
    x = 0;
    y = 0;
    isDrawing = false;
  }
});

const clear = document.createElement("button");
clear.innerHTML = "clear";
app.append(clear);

clear.onclick = () => {
  clearCanvas(ctx);
};

function drawLine(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}
function clearCanvas(context: CanvasRenderingContext2D) {
  context.fillRect(0, 0, 256, 256);
}
