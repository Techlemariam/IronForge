"use client";

import { useState } from "react";
import { uploadToStravaAction } from "@/actions/integrations/strava";
import ForgeButton from "@/components/ui/ForgeButton";
import ForgeCard from "@/components/ui/ForgeCard";
import ForgeInput from "@/components/ui/ForgeInput";
import { Loader2, UploadCloud, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function StravaUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [uploadId, setUploadId] = useState<number | null>(null);

  async function handleUpload(formData: FormData) {
    setIsUploading(true);
    setUploadStatus("idle");

    try {
      const result = await uploadToStravaAction(formData);

      if (result.success && result.uploadId) {
        setUploadStatus("success");
        setUploadId(result.uploadId);
        toast.success(`Upload started! ID: ${result.uploadId}`);
      } else {
        setUploadStatus("error");
        toast.error(result.error || "Upload failed");
      }
    } catch {
      setUploadStatus("error");
      toast.error("An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <ForgeCard className="w-full max-w-md mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 border-b border-forge-border pb-4">
        <UploadCloud className="w-6 h-6 text-magma" />
        <h2 className="text-xl font-bold uppercase tracking-widest text-magma">
          Messenger Tower
        </h2>
      </div>

      <form action={handleUpload} className="space-y-6">
        <div className="space-y-2">
          <ForgeInput
            label="Select .fit or .gpx file"
            id="file-upload"
            name="file"
            type="file"
            accept=".fit,.gpx,.tcx"
            required
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-forge-800 file:text-magma hover:file:bg-forge-700 cursor-pointer"
          />
        </div>

        <ForgeButton
          type="submit"
          disabled={isUploading}
          variant="magma"
          fullWidth
          className="flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Transmitting...
            </>
          ) : (
            "Upload to Strava"
          )}
        </ForgeButton>

        {uploadStatus === "success" && (
          <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg flex items-start gap-3 text-green-400 text-sm animate-fade-in">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Transmission Successful</p>
              <p>Upload ID: {uploadId}. Check your Strava feed shortly.</p>
            </div>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-3 text-red-400 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Transmission Failed</p>
              <p>
                The signal was lost. Please check your connection and try again.
              </p>
            </div>
          </div>
        )}
      </form>
    </ForgeCard>
  );
}
