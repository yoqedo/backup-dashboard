import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { Worker } from "worker_threads";
import { dialog } from "electron";

/* const isDev = process.env.NODE_ENV !== "development"; */

// 1) Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// 🔥 WICHTIG: global definieren
let mainWindow;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  // 🔥 WICHTIG: win → mainWindow
  mainWindow = new BrowserWindow({
    width: 320,
    height: 100,
    transparent: true,
    frame: false,
    vibrancy: "acrylic",
    visualEffectState: "active",
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  /*   if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
 */
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // UI messen und Fenster anpassen
  mainWindow.webContents.on("did-finish-load", async () => {
    const size = await mainWindow.webContents.executeJavaScript(`
      ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight
      })
    `);

    mainWindow.setContentSize(size.width, size.height);
  });
}

app.whenReady().then(createWindow);

// 1) Folder-Scan Worker
ipcMain.handle("get-folder-size", () => {
  return new Promise((resolve, reject) => {
    const desktop = app.getPath("desktop");
    const documents = app.getPath("documents");

    const worker = new Worker(path.join(__dirname, "modules/folderWorker.js"), {
      workerData: [desktop, documents],
    });

    worker.on("message", resolve);
    worker.on("error", reject);
  });
});

/* Ordner wählen wo man das Backup macht */
ipcMain.handle("choose-backup-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
  });

  if (result.canceled) return null;

  return result.filePaths[0];
});

// 2) ZIP-Worker mit Progress
ipcMain.handle("start-backup", (_, targetFolder) => {
  return new Promise((resolve, reject) => {
    const desktop = app.getPath("desktop");
    const documents = app.getPath("documents");

    const worker = new Worker(path.join(__dirname, "modules/zipWorker.js"), {
      workerData: {
        targetFolder,
        sources: [desktop, documents],
      },
    });

    worker.on("message", (msg) => {
      if (msg.progress !== undefined) {
        mainWindow.webContents.send("backup-progress", msg);
      } else {
        resolve(msg);
      }
    });

    worker.on("error", reject);
  });
});
