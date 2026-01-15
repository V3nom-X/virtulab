interface DataPoint {
  time: number;
  [key: string]: number;
}

interface ExportOptions {
  simulationType: string;
  parameters?: Record<string, number | string>;
}

export function exportToJSON(data: DataPoint[], options: ExportOptions): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const exportData = {
    metadata: {
      simulationType: options.simulationType,
      exportedAt: new Date().toISOString(),
      dataPoints: data.length,
      duration: data.length > 0 ? data[data.length - 1].time : 0
    },
    parameters: options.parameters || {},
    data: data
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${options.simulationType}_data_${Date.now()}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
export function exportToCSV(data: DataPoint[], options: ExportOptions): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get all keys from the first data point
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(key => {
        const value = row[key];
        return typeof value === 'number' ? value.toFixed(4) : value;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${options.simulationType}_data_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generatePDFReport(data: DataPoint[], options: ExportOptions): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Calculate statistics
  const stats: Record<string, { min: number; max: number; avg: number }> = {};
  const keys = Object.keys(data[0]).filter(k => k !== 'time');
  
  keys.forEach(key => {
    const values = data.map(d => d[key]).filter(v => !isNaN(v));
    stats[key] = {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length
    };
  });

  // Generate HTML content for PDF
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${options.simulationType} Simulation Report</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      color: #333;
    }
    h1 {
      color: #14b8a6;
      border-bottom: 2px solid #14b8a6;
      padding-bottom: 10px;
    }
    h2 {
      color: #555;
      margin-top: 30px;
    }
    .header-info {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .header-info p {
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    th {
      background: #14b8a6;
      color: white;
    }
    tr:nth-child(even) {
      background: #f9f9f9;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .stat-card {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-card .label {
      font-size: 12px;
      color: #666;
    }
    .stat-card .value {
      font-size: 18px;
      font-weight: bold;
      color: #14b8a6;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>📊 ${formatSimulationType(options.simulationType)} Simulation Report</h1>
  
  <div class="header-info">
    <p><strong>Simulation Type:</strong> ${formatSimulationType(options.simulationType)}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Data Points:</strong> ${data.length}</p>
    <p><strong>Duration:</strong> ${data.length > 0 ? data[data.length - 1].time.toFixed(2) : 0} seconds</p>
  </div>

  ${options.parameters ? `
  <h2>Simulation Parameters</h2>
  <table>
    <tr>
      <th>Parameter</th>
      <th>Value</th>
    </tr>
    ${Object.entries(options.parameters).map(([key, value]) => `
    <tr>
      <td>${formatParameterName(key)}</td>
      <td>${typeof value === 'number' ? value.toFixed(2) : value}</td>
    </tr>
    `).join('')}
  </table>
  ` : ''}

  <h2>Statistical Summary</h2>
  ${keys.map(key => `
  <h3>${formatParameterName(key)}</h3>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="label">Minimum</div>
      <div class="value">${stats[key].min.toFixed(4)}</div>
    </div>
    <div class="stat-card">
      <div class="label">Maximum</div>
      <div class="value">${stats[key].max.toFixed(4)}</div>
    </div>
    <div class="stat-card">
      <div class="label">Average</div>
      <div class="value">${stats[key].avg.toFixed(4)}</div>
    </div>
  </div>
  `).join('')}

  <h2>Data Sample (First 20 Points)</h2>
  <table>
    <tr>
      ${Object.keys(data[0]).map(key => `<th>${formatParameterName(key)}</th>`).join('')}
    </tr>
    ${data.slice(0, 20).map(row => `
    <tr>
      ${Object.values(row).map(val => `<td>${typeof val === 'number' ? val.toFixed(4) : val}</td>`).join('')}
    </tr>
    `).join('')}
  </table>

  <div class="footer">
    <p>Generated by ScienceKit Physics Simulator</p>
    <p>This report was automatically generated from simulation data.</p>
  </div>

  <script class="no-print">
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
  `;

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

function formatSimulationType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatParameterName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}
