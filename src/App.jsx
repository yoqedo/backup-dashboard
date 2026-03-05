import { useState } from "react";
import { Timer, HardDrive } from "lucide-react";

function App() {
  function onClick() {
    // da muss dein code sein
    console.log("von onclick funktion");
  }

  return (
    <div className="w-full h-full bg-black/40 backdrop-blur-3xl border border-white/30 rounded-xl p-6 overflow-hidden">
      <div className="bg-[#b9d5ff] rounded-lg border border-blue-500 flex py-2 pl-2">
        <div className="bg-[#2b80ff] w-12 h-12 rounded-lg flex items-center justify-center">
          <HardDrive color="white" />
        </div>
        <div className="flex flex-col pl-2">
          <div className="font-semibold text-[#1772fa]">BACKUP GRÖSSE</div>
          <div className="text-black text-lg font-semibold">150 MB</div>
        </div>
      </div>
      <div className="bg-[#c886ff] rounded-lg border border-violet-500 flex py-2 pl-2 my-2">
        <div className="bg-[#ad48ff] w-12 h-12 rounded-lg flex items-center justify-center">
          <Timer color="white" />
        </div>
        <div className="flex flex-col pl-2">
          <div className="font-semibold text-[#9e29fe]">LETZTES BACKUP</div>
          <div className="text-black">Datum</div>
        </div>
      </div>
      <button
        onClick={onClick}
        className="w-full bg-blue-500 py-2 rounded-lg text-white"
      >
        start Backup
      </button>
    </div>
  );
}

export default App;
