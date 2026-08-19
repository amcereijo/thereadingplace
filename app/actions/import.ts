"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/lib/auth";
import { parseGoodreadsCsv } from "@/lib/goodreads";
import { importBooks, type ImportProgress } from "@/lib/goodreads-import";

export async function importGoodreadsAction(
  csvContent: string
): Promise<{ success: boolean; progress?: ImportProgress; error?: string }> {
  try {
    const user = await requireAppUser();
    const parseResult = parseGoodreadsCsv(csvContent);

    if (parseResult.errors.length > 0 && parseResult.parsedBooks.length === 0) {
      return {
        success: false,
        error: "import.parseError",
      };
    }

    const progress = await importBooks(
      parseResult.parsedBooks,
      user.id
    );

    revalidatePath("/");
    revalidatePath("/to-read");
    revalidatePath("/reading");
    revalidatePath("/read");
    revalidatePath("/abandoned");

    return { success: true, progress };
  } catch {
    return {
      success: false,
      error: "import.importError",
    };
  }
}