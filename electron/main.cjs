const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 320,
    height: 100,
    transparent: true,
    frame: false,
    vibrancy: "acrylic", // Windows 10/11 Fluent Acrylic
    visualEffectState: "active", // macOS Mica/Acrylic
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // UI messen und Fenster anpassen
  win.webContents.on("did-finish-load", async () => {
    const size = await win.webContents.executeJavaScript(`
      ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight
      })
    `);

    win.setContentSize(size.width, size.height);
  });
}

app.whenReady().then(createWindow);
