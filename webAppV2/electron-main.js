const { app, BrowserWindow } = require("electron");
const path = require("path");
app.disableHardwareAcceleration()

let win;

function createWindow() {
  const win = new BrowserWindow({
    width: 960,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "./dist/cropped-logo.ico")
  });
  win.loadFile("./dist/index.html");
  return win;
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      win = createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});