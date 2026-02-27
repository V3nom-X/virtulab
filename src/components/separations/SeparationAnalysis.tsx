import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SeparationAnalysisProps {
  experimentId: string;
}

const analysisData: Record<string, { headers: string[]; rows: string[][] }> = {
  evaporation: {
    headers: ["Time (min)", "Temperature (°C)", "Liquid Volume (%)", "Observations"],
    rows: [
      ["0", "25", "100", "Clear salt solution"],
      ["2", "50", "85", "Bubbles begin to form"],
      ["4", "80", "60", "Steady evaporation, steam visible"],
      ["6", "100", "30", "Rapid boiling, salt concentration high"],
      ["8", "100", "5", "Mostly salt crystals remaining"],
      ["10", "100", "0", "White salt residue, all water evaporated"],
    ],
  },
  crystallization: {
    headers: ["Time (min)", "Temperature (°C)", "Crystal Size", "Observations"],
    rows: [
      ["0", "90", "None", "Hot saturated solution, clear blue"],
      ["3", "70", "Tiny", "First nucleation points appear"],
      ["6", "50", "Small", "Small crystals forming on walls"],
      ["9", "35", "Medium", "Crystal growth visible, solution lighter"],
      ["12", "25", "Large", "Well-formed blue crystals"],
      ["15", "20", "Large", "Complete crystallization, mother liquor clear"],
    ],
  },
  "simple-distillation": {
    headers: ["Time (min)", "Temperature (°C)", "Distillate (mL)", "Observations"],
    rows: [
      ["0", "25", "0", "Heating begins"],
      ["3", "60", "0", "Bubbles forming"],
      ["5", "100", "5", "Boiling, vapour entering condenser"],
      ["8", "100", "15", "Steady distillation"],
      ["10", "100", "25", "Distillate collecting, salt visible"],
      ["12", "100", "30", "Distillation complete, salt residue"],
    ],
  },
  "fractional-distillation": {
    headers: ["Time (min)", "Temperature (°C)", "Fraction", "Observations"],
    rows: [
      ["0", "25", "—", "Heating begins"],
      ["4", "78", "Ethanol", "First fraction (ethanol) distilling"],
      ["7", "78", "Ethanol", "Ethanol collection continues"],
      ["9", "82", "Mixture", "Transition zone, impure fraction"],
      ["12", "100", "Water", "Second fraction (water) distilling"],
      ["15", "100", "Water", "Water collection complete"],
    ],
  },
  sublimation: {
    headers: ["Time (min)", "Temperature (°C)", "Vapour Amount", "Observations"],
    rows: [
      ["0", "25", "None", "Mixture in dish, funnel placed"],
      ["2", "80", "Slight", "White fumes beginning to appear"],
      ["4", "120", "Moderate", "Steady sublimation, vapour rising"],
      ["6", "150", "Heavy", "Strong sublimation, crystals on funnel"],
      ["8", "150", "Decreasing", "Most NH₄Cl sublimed"],
      ["10", "150", "None", "Sand remains, crystals collected from funnel"],
    ],
  },
  "solvent-extraction": {
    headers: ["Time (min)", "Action", "Layer Status", "Observations"],
    rows: [
      ["0", "Add mixture", "Mixed", "Oil and water combined in funnel"],
      ["1", "Shake", "Emulsion", "Vigorous mixing of liquids"],
      ["3", "Settle", "Separating", "Two layers beginning to form"],
      ["5", "Settle", "Clear layers", "Oil on top, water below, clear interface"],
      ["6", "Open tap", "Draining", "Lower water layer draining"],
      ["7", "Close tap", "Separated", "Oil remaining in funnel, water collected"],
    ],
  },
  chromatography: {
    headers: ["Dye Colour", "Distance (cm)", "Solvent Front (cm)", "Rf Value"],
    rows: [
      ["Red", "2.4", "8.0", "0.30"],
      ["Blue", "4.4", "8.0", "0.55"],
      ["Yellow", "6.0", "8.0", "0.75"],
    ],
  },
};

export const SeparationAnalysis = ({ experimentId }: SeparationAnalysisProps) => {
  const data = analysisData[experimentId];
  if (!data) return <p className="text-muted-foreground">Analysis data not available.</p>;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Observation Table</h3>
      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {data.headers.map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row, i) => (
              <TableRow key={i}>
                {row.map((cell, j) => (
                  <TableCell key={j}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {experimentId === "chromatography" && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-1">Rf Value Formula:</p>
          <p className="text-sm text-muted-foreground font-mono">
            Rf = Distance moved by substance ÷ Distance moved by solvent front
          </p>
        </div>
      )}
    </div>
  );
};
