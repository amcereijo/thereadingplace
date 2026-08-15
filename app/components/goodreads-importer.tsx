"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { parseGoodreadsCsv, type ImportResult } from "@/lib/goodreads";
import { importGoodreadsAction } from "@/app/actions/import";
import { Card, ErrorMessage, SuccessMessage } from "./ui";

interface GoodreadsImporterProps {
  onImportComplete?: () => void;
}

interface ImportProgress {
  total: number;
  processed: number;
  imported: number;
  skipped: number;
  errors: number;
}

export function GoodreadsImporter({ onImportComplete }: GoodreadsImporterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setResult(null);
      setProgress(null);

      if (!file.name.endsWith(".csv")) {
        setError("Please upload a CSV file");
        return;
      }

      setIsProcessing(true);

      try {
        const text = await file.text();
        const parseResult = parseGoodreadsCsv(text);
        setResult(parseResult);

        if (parseResult.errors.length > 0 && parseResult.parsedBooks.length === 0) {
          setError("Failed to parse CSV file. Please check the format.");
          setIsProcessing(false);
          return;
        }

        const importResult = await importGoodreadsAction(text);

        if (!importResult.success) {
          setError(importResult.error || "Failed to import books");
          setIsProcessing(false);
          return;
        }

        if (importResult.progress) {
          setProgress(importResult.progress);
        }

        onImportComplete?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to process file");
      } finally {
        setIsProcessing(false);
      }
    },
    [onImportComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900">
            Import from Goodreads
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            Upload your Goodreads CSV export to import your reading history.
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragging
              ? "border-teal-500 bg-teal-50"
              : "border-zinc-300 hover:border-zinc-400"
          }`}
        >
          <div className="space-y-2">
            <p className="text-sm text-zinc-600">
              {isProcessing
                ? "Processing..."
                : "Drag and drop your CSV file here, or"}
            </p>
            {!isProcessing && (
              <label className="inline-block cursor-pointer">
                <span className="text-sm font-medium text-teal-700 hover:text-teal-800">
                  browse
                </span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-zinc-600">
              <span>Progress</span>
              <span>
                {progress.processed} / {progress.total}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full bg-teal-600 transition-all"
                style={{
                  width: `${(progress.processed / progress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {result && result.errors.length > 0 && (
          <div className="rounded-lg bg-amber-50 p-3">
            <p className="text-sm font-medium text-amber-800">
              {result.errors.length} warning(s) during parse
            </p>
            <ul className="mt-1 max-h-32 overflow-y-auto text-xs text-amber-700">
              {result.errors.slice(0, 5).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {result.errors.length > 5 && (
                <li>... and {result.errors.length - 5} more</li>
              )}
            </ul>
          </div>
        )}

        {progress && progress.processed === progress.total && (
          <div className="space-y-3">
            <SuccessMessage>
              Import complete! {progress.imported} book(s) imported,{" "}
              {progress.skipped} skipped (duplicates), {progress.errors} error(s).
            </SuccessMessage>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-1"
            >
              Go to shelf
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}