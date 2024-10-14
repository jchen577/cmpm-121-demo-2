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

ctx.fillStyle = "white";
ctx.fillRect(10, 10, 256, 256);
