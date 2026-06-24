import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Download,
  Trash2,
  Database,
} from "lucide-react";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

export default function BackupSettings() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState<string[]>([]);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const data = await invoke<string[]>("get_backups");
      setBackups(data);
    } catch (err) {
      console.error("LOAD BACKUPS ERROR:", err);
    }
  };

  const createBackup = async () => {
    setLoading(true);

    try {
      const result = await invoke<string>("create_backup");

      await loadBackups();

      Swal.fire(
        t("backup.success"),
        `${t("backup.createSuccess")}\n${result}`,
        "success"
      );
    } catch (err) {
      console.error("BACKUP ERROR:", err);
      Swal.fire(t("backup.error"), String(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const restoreBackupFile = async (backup: string) => {
    const result = await Swal.fire({
      title: t("backup.restoreConfirm"),
      text: backup,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t("backup.restore"),
      cancelButtonText: t("common.cancel"),
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      await invoke("restore_backup_file", {
        fileName: backup,
      });

      Swal.fire(
        t("backup.success"),
        t("backup.restoreSuccess"),
        "success"
      );
    } catch (err) {
      console.error(err);
      Swal.fire(t("backup.error"), String(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteBackup = async (backup: string) => {
    const result = await Swal.fire({
      title: t("backup.deleteConfirm"),
      text: backup,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("backup.delete"),
      cancelButtonText: t("common.cancel"),
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      await invoke("delete_backup", {
        fileName: backup,
      });

      await loadBackups();

      Swal.fire(
        t("backup.deleted"),
        t("backup.deleteSuccess"),
        "success"
      );
    } catch (err) {
      console.error(err);
      Swal.fire(t("backup.error"), String(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 border border-gray-200 rounded-xl dark:border-slate-800">
       

        <div className="flex flex-wrap gap-3">
          <button
            onClick={createBackup}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-brand-orangen text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            <Download size={16} />
            {t("backup.create")}
          </button>
        </div>

        <div className="mt-8">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Database size={18} />
            {t("backup.existingBackups")}
          </h4>

          {backups.length === 0 ? (
            <div className="text-sm text-gray-500 p-4 border border-gray-200 rounded-lg dark:border-slate-800">
              {t("backup.noBackups")}
            </div>
          ) : (
            <div className="space-y-2">
              {backups.map((backup) => (
                <div
                  key={backup}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg dark:border-slate-800"
                >
                  <span className="text-sm font-medium break-all">
                    {backup}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => restoreBackupFile(backup)}
                      className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      {t("backup.restore")}
                    </button>

                    <button
                      onClick={() => deleteBackup(backup)}
                      className="p-2 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}