// modules/zipWorker.js
import { parentPort, workerData } from "worker_threads";
import fs from "fs";
import path from "path";
import archiver from "archiver";

async function createZip({ targetFolder, sources }) {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const timestamp =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0") +
      "_" +
      String(now.getHours()).padStart(2, "0") +
      "-" +
      String(now.getMinutes()).padStart(2, "0");

    const zipPath = path.join(targetFolder, `backup_${timestamp}.zip`);

    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 0 } }); // schnell & gut

    output.on("close", () => resolve({ success: true, zipPath }));
    archive.on("error", reject);

    archive.pipe(output);

    // Fortschritt senden
    archive.on("progress", (data) => {
      parentPort.postMessage({
        progress: data.fs.processedBytes,
        total: data.fs.totalBytes,
      });
    });

    // GANZE ORDNER sichern
    for (const src of sources) {
      const folderName = path.basename(src);
      archive.directory(src, path.basename(src));
    }

    archive.finalize();
  });
}

createZip(workerData)
  .then((result) => parentPort.postMessage(result))
  .catch((err) =>
    parentPort.postMessage({ success: false, error: err.message }),
  );
