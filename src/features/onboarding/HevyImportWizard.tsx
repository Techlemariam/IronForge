"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { importHevyHistoryAction } from "@/actions/integrations/hevy";
import {
  Upload,
  FileJson,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const HevyImportWizard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [stats, setStats] = useState<{
    count: number;
    dateRange: string;
  } | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [complete, setComplete] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (selected?.type !== "application/json") {
      toast.error("Please upload a valid JSON file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        const workouts = json.workouts || [];

        if (!Array.isArray(workouts)) {
          throw new Error('Invalid format: missing "workouts" array');
        }

        setFile(selected);
        setParsedData(workouts);

        // Calculate stats
        const count = workouts.length;
        const dates = workouts.map((w: any) =>
          new Date(w.start_time).getTime(),
        );
        const minDate = new Date(Math.min(...dates)).toLocaleDateString();
        const maxDate = new Date(Math.max(...dates)).toLocaleDateString();
        setStats({ count, dateRange: `${minDate} - ${maxDate}` });
      } catch (e) {
        toast.error("Failed to parse JSON file");
        console.error(e);
      }
    };
    reader.readAsText(selected);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "application/json": [".json"] },
  });

  const handleImport = async () => {
    if (!parsedData) return;
    setIsUploading(true);

    try {
      // Chunking if necessary? For now send all
      // If huge, we might need to chunk. Let's send in batches of 50.
      const BATCH_SIZE = 50;
      const batches = [];
      for (let i = 0; i < parsedData.length; i += BATCH_SIZE) {
        batches.push(parsedData.slice(i, i + BATCH_SIZE));
      }

      let totalImported = 0;

      for (const batch of batches) {
        await importHevyHistoryAction(batch);
        totalImported += batch.length;
      }

      setComplete(true);
      toast.success(`Successfully imported ${totalImported} workouts!`);
    } catch (e: any) {
      toast.error("Import failed: " + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (complete) {
    return (
      <div className="text-center p-8 bg-zinc-900 border border-emerald-500/20 rounded-xl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </motion.div>
        <h3 className="text-xl font-bold text-white mb-2">Import Complete!</h3>
        <p className="text-zinc-400 mb-6">
          Your legendary history has been inscribed in the archives.
        </p>
        <button
          onClick={() => {
            setFile(null);
            setStats(null);
            setComplete(false);
          }}
          className="text-sm text-emerald-400 hover:text-emerald-300 underline"
        >
          Import another file
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive
              ? "border-magma bg-magma/5"
              : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/50"
            }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-white mb-1">
            {isDragActive
              ? "Drop your legacy here..."
              : "Drag & drop Hevy export (JSON)"}
          </p>
          <p className="text-sm text-zinc-500">or click to browse files</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-zinc-800 rounded-lg">
              <FileJson className="w-6 h-6 text-magma" />
            </div>
            <div>
              <h4 className="text-white font-medium">{file.name}</h4>
              <p className="text-xs text-zinc-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setStats(null);
              }}
              className="ml-auto text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>

          {stats && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-black/20 rounded-lg">
                <div className="text-sm text-zinc-500 mb-1">Workouts Found</div>
                <div className="text-2xl font-bold text-white">
                  {stats.count}
                </div>
              </div>
              <div className="p-4 bg-black/20 rounded-lg">
                <div className="text-sm text-zinc-500 mb-1">Timeline</div>
                <div className="text-lg font-medium text-white">
                  {stats.dateRange}
                </div>
              </div>
            </div>
          )}

          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200/80">
              Missing exercises will be automatically created. Duplicates will
              be skipped based on date and exercise.
            </div>
          </div>

          <button
            onClick={handleImport}
            disabled={isUploading}
            className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Scrolls...
              </>
            ) : (
              "Confirm Import"
            )}
          </button>
        </div>
      )}
    </div>
  );
};
