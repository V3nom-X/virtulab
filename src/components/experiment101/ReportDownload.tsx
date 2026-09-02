import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { experiment101List } from "@/data/experiment101Data";
import { useExperiment101Records } from "@/hooks/useExperiment101Progress";
import { buildReportRows, exportReportCSV, exportReportPDF } from "@/utils/experiment101Report";

const ids = experiment101List.map((e) => e.id);

/**
 * "Download report" control — exports the learner's Experiment 101 progress and
 * quiz results as a PDF or CSV. Works fully offline: everything is generated in
 * the browser from locally stored records.
 */
export function ReportDownload({
  variant = "outline",
  className,
}: {
  variant?: "outline" | "secondary" | "default";
  className?: string;
}) {
  const { user } = useAuth();
  const { records } = useExperiment101Records(ids);

  const learnerName =
    (user?.user_metadata?.full_name as string | undefined) || user?.email || "Guest learner";

  const run = (format: "pdf" | "csv") => {
    try {
      const rows = buildReportRows(records);
      if (format === "pdf") exportReportPDF(rows, { learnerName });
      else exportReportCSV(rows, { learnerName });
      toast.success(`Report downloaded as ${format.toUpperCase()}`);
    } catch {
      toast.error("Could not generate the report. Please try again.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className={className}>
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Download report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover">
        <DropdownMenuItem onClick={() => run("pdf")}>
          <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
          PDF report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run("csv")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden="true" />
          CSV spreadsheet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
