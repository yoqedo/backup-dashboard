import { useState, useEffect } from "react";
import { Timer, HardDrive, FolderOpenDot } from "lucide-react";

function App() {
  // setz die grösse der Folders
  const [size, setSize] = useState(null);
  // setzt die letzte Zeit
  const [lastScan, setLastScan] = useState(null);

  // überprüft ob animation läuft wenn ja.. wenn nein...
  const [isScanning, setIsScanning] = useState(false);

  const [backupTarget, setBackupTarget] = useState(null);

  const [progress, setProgress] = useState(0);

  /* Wenn backup erledigt mit check setzen */
  const [backupDone, setBackupDone] = useState(false);

  // 1. setz die gesamtgrösse
  // 2. setzt die letzte scanzeit
  // 3. Überprüft ob der scan läuft oder nicht
  // 4. setzt die animationszeit
  async function handleBackup() {
    setIsScanning(true);

    const start = Date.now();

    // 1. Scan durchführen (wie bisher)
    const files = await window.backupAPI.getFolderSize();
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    setSize(totalSize);
    setLastScan(new Date());

    // 2. Backup-Ziel prüfen (NICHT automatisch öffnen!)
    if (!backupTarget) {
      setIsScanning(false);
      alert("Bitte zuerst ein Backup Ziel auswählen.");
      return;
    }

    // 3. Backup starten (ZIP)
    const result = await window.backupAPI.startBackup(backupTarget);

    // 4. Mindestdauer der Animation einhalten
    const elapsed = Date.now() - start;
    const minDuration = 3000;
    const remaining = minDuration - elapsed;

    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }

    setIsScanning(false);

    // 5. Erfolg anzeigen
    if (result.success) {
      setBackupDone(true);
      setTimeout(() => setBackupDone(false), 2000);
    }
  }
  /* ************************************* */
  /* Hier endet die Handle Backup Funktion */
  /* ************************************* */

  useEffect(() => {
    window.backupAPI.onBackupProgress((msg) => {
      setProgress(msg.progress / msg.total);
    });
  }, []);

  /* Backupziel auswählen */
  async function selectBackupTarget() {
    const folder = await window.backupAPI.chooseBackupFolder();
    if (!folder) return;

    setBackupTarget(folder);
  }

  // Formatiert den wert von
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / 1024 / 1024).toFixed(1) + " MB";
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB";
  }

  // Formatiert das Datum
  function formatDateTime(date) {
    return date.toLocaleString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="w-full h-full bg-black/40 backdrop-blur-4xl border border-white/30 rounded-xl p-6 overflow-hidden">
      <div className="bg-[#b9d5ff] rounded-lg border border-blue-500 flex py-2 pl-2">
        <div className="bg-[#2b80ff] w-12 h-12 rounded-lg flex items-center justify-center">
          <HardDrive color="white" />
        </div>
        <div className="flex flex-col pl-2">
          <div className="font-semibold text-[#1772fa]">BACKUP GRÖSSE</div>
          <div className="text-black text-lg font-semibold">
            {formatSize(size)}
          </div>
        </div>
      </div>
      <div className="bg-[#c886ff] rounded-lg border border-violet-500 flex py-2 pl-2 my-2">
        <div className="bg-[#ad48ff] w-12 h-12 rounded-lg flex items-center justify-center">
          <Timer color="white" />
        </div>
        <div className="flex flex-col pl-2">
          <div className="font-semibold text-[#9e29fe]">LETZTES BACKUP</div>
          <div className="text-black">
            {lastScan === null ? "Noch nie" : formatDateTime(lastScan)}
          </div>
        </div>
      </div>
      <div
        onClick={selectBackupTarget}
        className="bg-gray-800 p-2 rounded-lg cursor-pointer no-drag mb-2 flex items-center hover:bg-gray-700"
      >
        <div className="bg-amber-300 p-1 rounded-lg">
          <FolderOpenDot />
        </div>
        <div className="pl-2">
          <div className="text-xs text-gray-400">BACKUP ZIEL</div>
          <div className="text-white text-xs">
            {backupTarget || "z.B C:\ backup"}
          </div>
        </div>
      </div>

      {/* <button
        onClick={handleBackup}
        disabled={isScanning}
        className={`
    w-full bg-blue-500 py-2 rounded-lg text-white no-drag 
    hover:bg-blue-700 cursor-pointer
    disabled:opacity-70 disabled:cursor-default
    flex items-center justify-center gap-2
    ${isScanning ? "progress-fill" : ""}
  `}
      >
        {isScanning && (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        )}

        {isScanning ? "Scanne..." : "Start Backup"}
      </button> */}

      <button
        onClick={handleBackup}
        disabled={isScanning}
        className={`
    w-full py-2 rounded-lg text-white no-drag flex items-center justify-center gap-2
    ${isScanning ? "bg-blue-500" : backupDone ? "bg-green-600" : "bg-blue-500"}
  `}
      >
        {isScanning && (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        )}

        {isScanning
          ? "Scanne..."
          : backupDone
            ? "✔ Erfolgreich"
            : "Start Backup"}
      </button>

      {/* Fortschrittsbalken */}
      {/* {isScanning && (
        <div className="w-full h-2 bg-gray-700 rounded mt-2 overflow-hidden">
          <div
            className="h-2 bg-blue-500 transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )} */}
    </div>
  );
}

export default App;
