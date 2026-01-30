import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, Check, AlertCircle, X, FileText, Table } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type DataType = 'students' | 'teachers' | 'parents' | 'classes' | 'attendance' | 'marks';
type FileFormat = 'excel' | 'csv' | 'pdf';

const dataTypes: { id: DataType; label: string; icon: React.ElementType }[] = [
  { id: 'students', label: 'Students', icon: Table },
  { id: 'teachers', label: 'Teachers', icon: Table },
  { id: 'parents', label: 'Parents', icon: Table },
  { id: 'classes', label: 'Classes', icon: Table },
  { id: 'attendance', label: 'Attendance', icon: Table },
  { id: 'marks', label: 'Marks', icon: Table },
];

const formatOptions: { id: FileFormat; label: string; icon: React.ElementType }[] = [
  { id: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
  { id: 'csv', label: 'CSV', icon: FileText },
  { id: 'pdf', label: 'PDF', icon: FileText },
];

const ImportExportScreen = () => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [selectedDataType, setSelectedDataType] = useState<DataType>('students');
  const [selectedFormat, setSelectedFormat] = useState<FileFormat>('excel');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Simulate preview data
      setPreviewData([
        { name: 'John Doe', email: 'john@example.com', status: 'Valid' },
        { name: 'Jane Smith', email: 'jane@example.com', status: 'Valid' },
        { name: 'Bob Wilson', email: 'invalid-email', status: 'Error: Invalid email' },
      ]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    toast.success(`Successfully imported ${selectedDataType} data`);
    setFile(null);
    setPreviewData(null);
  };

  const handleExport = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    toast.success(`${selectedDataType} data exported as ${selectedFormat.toUpperCase()}`);
  };

  const handleDownloadTemplate = () => {
    toast.success(`Template for ${selectedDataType} downloaded`);
  };

  return (
    <div className="screen-container px-4">
      <PageHeader
        title="Import / Export"
        subtitle="Manage your data"
        showBack
      />

      {/* Tab Switcher */}
      <div className="flex p-1 bg-secondary rounded-xl mb-6">
        <button
          onClick={() => setActiveTab('import')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all",
            activeTab === 'import' 
              ? "bg-card shadow-sm text-foreground" 
              : "text-muted-foreground"
          )}
        >
          <Upload className="h-4 w-4" />
          Import
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all",
            activeTab === 'export' 
              ? "bg-card shadow-sm text-foreground" 
              : "text-muted-foreground"
          )}
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Data Type Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium text-foreground block mb-3">Select Data Type</label>
        <div className="grid grid-cols-3 gap-2">
          {dataTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedDataType(type.id)}
              className={cn(
                "p-3 rounded-xl border text-center transition-all",
                selectedDataType === type.id 
                  ? "bg-primary/10 border-primary text-primary" 
                  : "bg-card border-border hover:border-primary/50"
              )}
            >
              <type.icon className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'import' ? (
        <>
          {/* File Upload Area */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground block mb-3">Upload File</label>
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                {file ? file.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-muted-foreground">Excel or CSV files (max 10MB)</p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Download Template */}
          <Button
            variant="outline"
            className="w-full mb-6"
            onClick={handleDownloadTemplate}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template for {selectedDataType}
          </Button>

          {/* Preview */}
          {previewData && (
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground block mb-3">
                Data Preview
              </label>
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Name</th>
                        <th className="px-4 py-3 text-left font-medium">Email</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="px-4 py-3">{row.name}</td>
                          <td className="px-4 py-3">{row.email}</td>
                          <td className="px-4 py-3">
                            {row.status === 'Valid' ? (
                              <span className="inline-flex items-center gap-1 text-success">
                                <Check className="h-4 w-4" /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-destructive">
                                <AlertCircle className="h-4 w-4" /> Error
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <Button
            variant="gradient"
            className="w-full"
            onClick={handleImport}
            disabled={!file || isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import Data
              </>
            )}
          </Button>
        </>
      ) : (
        <>
          {/* Format Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground block mb-3">Export Format</label>
            <div className="space-y-2">
              {formatOptions.map(format => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl border transition-all",
                    selectedFormat === format.id 
                      ? "bg-primary/10 border-primary" 
                      : "bg-card border-border hover:border-primary/50"
                  )}
                >
                  <format.icon className={cn(
                    "h-5 w-5",
                    selectedFormat === format.id ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "font-medium",
                    selectedFormat === format.id ? "text-primary" : "text-foreground"
                  )}>
                    {format.label}
                  </span>
                  {selectedFormat === format.id && (
                    <Check className="h-5 w-5 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="gradient"
            className="w-full"
            onClick={handleExport}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export {selectedDataType} as {selectedFormat.toUpperCase()}
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
};

export default ImportExportScreen;
