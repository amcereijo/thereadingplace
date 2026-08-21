"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Upload } from "lucide-react";
import { parseGoodreadsCsv, type ImportResult } from "@/lib/goodreads";
import { importGoodreadsAction } from "@/app/actions/import";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Card, ErrorMessage, SuccessMessage } from "./ui";

interface GoodreadsImporterProps {
  onImportComplete?: () => void;
  dictionary: Dictionary;
}

interface ImportProgress {
  total: number;
  processed: number;
  imported: number;
  skipped: number;
  errors: number;
}

export function GoodreadsImporter({ onImportComplete, dictionary }: GoodreadsImporterProps) {
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
        setError(dictionary.import.csvError);
        return;
      }

      setIsProcessing(true);

      try {
        const text = await file.text();
        const parseResult = parseGoodreadsCsv(text);
        setResult(parseResult);

        if (parseResult.errors.length > 0 && parseResult.parsedBooks.length === 0) {
          setError(dictionary.import.parseError);
          setIsProcessing(false);
          return;
        }

        const importResult = await importGoodreadsAction(text);

        if (!importResult.success) {
          setError(importResult.error ? translateError(dictionary, importResult.error) : dictionary.import.importError);
          setIsProcessing(false);
          return;
        }

        if (importResult.progress) {
          setProgress(importResult.progress);
        }

        onImportComplete?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : dictionary.import.processError);
      } finally {
        setIsProcessing(false);
      }
    },
    [onImportComplete, dictionary]
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
            {dictionary.import.title}
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            {dictionary.import.subtitle}
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
            {!isProcessing && (
              <Upload className="mx-auto h-8 w-8 text-zinc-400" aria-hidden="true" />
            )}
            <p className="text-sm text-zinc-600">
              {isProcessing
                ? dictionary.import.dropzoneProcessing
                : dictionary.import.dropzoneText}
            </p>
            {!isProcessing && (
              <label className="inline-block cursor-pointer">
                <span className="text-sm font-medium text-teal-700 hover:text-teal-800">
                  {dictionary.import.browse}
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
              <span>{dictionary.import.progress}</span>
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
              {dictionary.import.parseWarnings.replace("{count}", String(result.errors.length))}
            </p>
            <ul className="mt-1 max-h-32 overflow-y-auto text-xs text-amber-700">
              {result.errors.slice(0, 5).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {result.errors.length > 5 && (
                <li>{dictionary.shelf.more.replace("{count}", String(result.errors.length - 5))}</li>
              )}
            </ul>
          </div>
        )}

        {progress && progress.processed === progress.total && (
          <div className="space-y-3">
            <SuccessMessage>
              {dictionary.import.importComplete
                .replace("{imported}", String(progress.imported))
                .replace("{skipped}", String(progress.skipped))
                .replace("{errors}", String(progress.errors))}
            </SuccessMessage>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-1"
            >
              {dictionary.import.goToShelf}
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}

function translateError(dictionary: Dictionary, key: string): string {
  const parts = key.split(".");
  let current: unknown = dictionary;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof current === "string" ? current : key;
}