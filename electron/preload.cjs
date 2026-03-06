const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("backupAPI", {
  getFolderSize: () => ipcRenderer.invoke("get-folder-size"),

  /* Öffnet Windows‑Ordnerdialog */
  chooseBackupFolder: () => ipcRenderer.invoke("choose-backup-folder"),
  /* Startet ZIP‑Backup in main */
  startBackup: (targetFolder) =>
    ipcRenderer.invoke("start-backup", targetFolder),
  onBackupProgress: (callback) =>
    ipcRenderer.on("backup-progress", (_, data) => callback(data)),
});
