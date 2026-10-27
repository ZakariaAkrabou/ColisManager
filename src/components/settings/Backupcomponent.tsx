import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Download,
  Trash2,
  Database,
  RotateCcw,
  Edit3,
  FileCheck,
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
    const defaultName = `backup_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}_${new Date().toTimeString().slice(0, 8).replace(/:/g, "")}`;
    const { value: customName } = await Swal.fire({
      title: t("backup.create") || "Create Backup",
      text: t("backup.description") || "Enter an optional custom name for this backup:",
      input: "text",
      inputValue: defaultName,
      inputLabel: t("backup.customName") || "Backup name",
      showCancelButton: true,
      confirmButtonText: t("backup.create") || "Create",
      cancelButtonText: t("common.cancel") || "Cancel",
      confirmButtonColor: "#E26D28",
      cancelButtonColor: "#6B7280",
      customClass: { popup: "rounded-2xl" },
      inputValidator: (value) => {
        if (value && /[\/\\:*?"<>|]/.test(value)) {
          return "Caractères invalides (/ \\ : * ? \" < > |)";
        }
        return null;
      },
    });

    if (customName === undefined) return; // user cancelled

    setLoading(true);

    try {
      const resultPath = await invoke<string>("create_backup");
      const generatedFileName = resultPath.split(/[\\/]/).pop() || "";

      let finalName = generatedFileName;
      if (customName && customName.trim() && generatedFileName) {
        try {
          finalName = await invoke<string>("rename_backup", {
            oldName: generatedFileName,
            newName: customName.trim(),
          });
        } catch (renameErr) {
          console.warn("Could not rename automatically:", renameErr);
        }
      }

      await loadBackups();

      Swal.fire({
        title: t("backup.success"),
        text: `${t("backup.createSuccess")}\n${finalName}`,
        icon: "success",
        confirmButtonColor: "#E26D28",
        customClass: { popup: "rounded-2xl" },
      });
    } catch (err) {
      console.error("BACKUP ERROR:", err);
      Swal.fire({
        title: t("backup.error"),
        text: String(err),
        icon: "error",
        confirmButtonColor: "#E26D28",
        customClass: { popup: "rounded-2xl" },
      });
    } finally {
      setLoading(false);
    }
  };

  const renameBackupFile = async (backup: string) => {
    const baseName = backup.replace(/\.db$/, "");
    const { value: newName } = await Swal.fire({
      title: t("backup.renameTitle") || "Renommer la sauvegarde",
      input: "text",
      inputValue: baseName,
      inputLabel: t("backup.renamePlaceholder") || "Nouveau nom",
      showCancelButton: true,
      confirmButtonText: t("common.save") || "Enregistrer",
      cancelButtonText: t("common.cancel") || "Annuler",
      confirmButtonColor: "#E26D28",
      cancelButtonColor: "#6B7280",
      customClass: { popup: "rounded-2xl" },
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "Le nom ne peut pas être vide";
        }
        if (value.trim() === baseName) {
          return "Le nouveau nom doit être différent";
        }
        if (/[\/\\:*?"<>|]/.test(value)) {
          return "Caractères invalides (/ \\ : * ? \" < > |)";
        }
        return null;
      },
    });

    if (!newName) return;

    try {
      setLoading(true);
      await invoke("rename_backup", {
        oldName: backup,
        newName: newName.trim(),
      });
      await loadBackups();
      Swal.fire({
        title: t("backup.success"),
        text: t("backup.renameSuccess") || "Sauvegarde renommée avec succès",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: t("backup.error"),
        text: String(err),
        icon: "error",
        confirmButtonColor: "#E26D28",
        customClass: { popup: "rounded-2xl" },
      });
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
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      customClass: { popup: "rounded-2xl" },
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      await invoke("restore_backup_file", {
        fileName: backup,
      });

      Swal.fire({
        title: t("backup.success"),
        text: t("backup.restoreSuccess"),
        icon: "success",
        confirmButtonColor: "#E26D28",
        customClass: { popup: "rounded-2xl" },
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: t("backup.error"),
        text: String(err),
        icon: "error",
        confirmButtonColor: "#E26D28",
        customClass: { popup: "rounded-2xl" },
      });
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
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      customClass: { popup: "rounded-2xl" },
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      await invoke("delete_backup", {
        fileName: backup,
      });

      await loadBackups();

      Swal.fire({
        title: t("backup.deleted"),
        text: t("backup.deleteSuccess"),
        icon: "success",
        confirmButtonColor: "#E26D28",
        customClass: { popup: "rounded-2xl" },
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: t("backup.error"),
        text: String(err),
        icon: "error",
        confirmButtonColor: "#E26D28",
        customClass: { popup: "rounded-2xl" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Database size={18} className="text-brand-orange" />
              {t("backup.existingBackups")}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              {t("backup.description")}
            </p>
          </div>

          <button
            onClick={createBackup}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-orange-500/20 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Download size={15} />
            {t("backup.create")}
          </button>
        </div>

        <div className="mt-6">
          {backups.length === 0 ? (
            <div className="text-center py-10 px-4 border border-dashed border-gray-200 dark:border-slate-700/60 rounded-2xl">
              <FileCheck size={32} className="mx-auto text-gray-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                {t("backup.noBackups")}
              </p>
            </div>
          ) : (
            <div className="grid gap-2.5">
              {backups.map((backup) => (
                <div
                  key={backup}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50/70 dark:bg-slate-800/40 hover:bg-orange-50/30 dark:hover:bg-slate-800/80 border border-gray-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-slate-700 rounded-xl transition-all duration-200 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-100/70 dark:bg-orange-950/40 text-brand-orange flex items-center justify-center shrink-0">
                      <Database size={15} />
                    </div>
                    <span className="text-xs font-mono font-semibold text-gray-700 dark:text-slate-200 truncate" title={backup}>
                      {backup}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    {/* Rename Button */}
                    <button
                      onClick={() => renameBackupFile(backup)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all duration-150 cursor-pointer shadow-xs active:scale-95"
                      title={t("backup.rename") || "Renommer"}
                    >
                      <Edit3 size={13} />
                      <span className="hidden md:inline">{t("backup.rename") || "Renommer"}</span>
                    </button>

                    {/* Restore Button */}
                    <button
                      onClick={() => restoreBackupFile(backup)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white transition-all duration-150 cursor-pointer shadow-xs active:scale-95"
                      title={t("backup.restore")}
                    >
                      <RotateCcw size={13} />
                      <span className="hidden md:inline">{t("backup.restore")}</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteBackup(backup)}
                      className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white transition-all duration-150 cursor-pointer shadow-xs active:scale-95"
                      title={t("backup.delete")}
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