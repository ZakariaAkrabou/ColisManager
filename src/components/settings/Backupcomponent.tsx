import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Download, Upload } from "lucide-react";

export default function BackupSettings() {
  const [loading, setLoading] = useState(false);

  const createBackup = async () => {
    setLoading(true);
    try {
      await invoke("create_backup");
      alert("تم إنشاء النسخة الاحتياطية بنجاح");
    } catch (err) {
      console.error(err);
      alert("فشل إنشاء النسخة الاحتياطية");
    } finally {
      setLoading(false);
    }
  };

  const restoreBackup = async () => {
    setLoading(true);
    try {
      await invoke("restore_backup");
      alert("تم استرجاع النسخة بنجاح");
    } catch (err) {
      console.error(err);
      alert("فشل استرجاع النسخة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 border rounded-xl dark:border-slate-800">
        <h3 className="font-bold mb-2">النسخ الاحتياطي</h3>
        <p className="text-sm text-gray-500 mb-4">
          يمكنك حفظ أو استرجاع بيانات التطبيق.
        </p>

        <div className="flex gap-3">
          <button
            onClick={createBackup}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg"
          >
            <Download size={16} />
            إنشاء نسخة
          </button>

          <button
            onClick={restoreBackup}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg"
          >
            <Upload size={16} />
            استرجاع
          </button>
        </div>
      </div>
    </div>
  );
}