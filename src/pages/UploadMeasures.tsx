import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Upload, Map } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProfileModal } from "@/components/ProfileModal";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  extractZipContents,
  parseExcelFromZip,
  normalizeExcelRow,
  findImageInZip,
  checkImageMetadata
} from "@/utils/uploadUtils";
import { UploadDropZone } from "@/components/upload/UploadDropZone";
import { UploadProgressBar } from "@/components/upload/UploadProgressBar";
import { UploadStats } from "@/components/upload/UploadStats";
import * as toGeoJSON from "@tmcw/togeojson";

interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: "queue" | "sending" | "error" | "complete";
}

type UploadStats = {
  total: number;
  queue: number;
  uploaded: number;
  errors: number;
  sending: number;
};

export default function UploadMeasures() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { inspectionId } = useParams<{ inspectionId?: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'measures' | 'trace'>('measures');

  // Measure upload statistics
  const [uploadStats, setUploadStats] = useState<UploadStats>({
    total: 0,
    queue: 0,
    uploaded: 0,
    errors: 0,
    sending: 0,
  });

  // Upload progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentProcessing, setCurrentProcessing] = useState<string>('');

  // ─── KML / Trace upload state ───────────────────────────────────────────────
  const [isKmlDragging, setIsKmlDragging] = useState(false);
  const [isKmlUploading, setIsKmlUploading] = useState(false);
  const [kmlProgress, setKmlProgress] = useState(0);
  const [kmlCurrentProcessing, setKmlCurrentProcessing] = useState('');
  const [kmlStats, setKmlStats] = useState<UploadStats>({
    total: 0,
    queue: 0,
    uploaded: 0,
    errors: 0,
    sending: 0,
  });

  // ─── ZIP (measures) handlers ────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processZipFile = async (file: File, inspectionId?: string): Promise<{ error: string | null; stats?: UploadStats }> => {
    try {
      console.log(`Processing ZIP file: ${file.name}`);

      // Extract ZIP contents
      const { zipContent, excelFiles, imageFiles } = await extractZipContents(file);

      console.log("📦 ZIP File Contents:");
      console.log("=".repeat(50));
      console.log(`📊 Excel files found: ${excelFiles.length}`);
      console.log(`🖼️ Image files found: ${imageFiles.length}`);

      // Validate exactly one Excel file
      if (excelFiles.length === 0) {
        console.error(`❌ ERROR: No Excel file found in ${file.name}`);
        return { error: "No Excel file (.xlsx or .xls) found in the ZIP file. Please ensure your ZIP contains exactly one Excel file." };
      }

      if (excelFiles.length > 1) {
        console.error(`❌ ERROR: Multiple Excel files found in ${file.name}`);
        return { error: `Multiple Excel files found (${excelFiles.length}). Please ensure your ZIP contains exactly one Excel file.` };
      }

      console.log(`✅ Excel file: ${excelFiles[0]}`);
      console.log("=".repeat(50));

      // Parse the Excel file
      console.log("📊 Parsing Excel file...");
      try {
        const { jsonData, sheetName } = await parseExcelFromZip(zipContent, excelFiles[0]);

        // Normalize all rows
        const normalizedData = jsonData.map(normalizeExcelRow);

        console.log("📊 Excel Parsing Results:");
        console.log("=".repeat(50));
        console.log(`Sheet name: ${sheetName}`);
        console.log(`Total rows: ${jsonData.length}`);
        console.log("=".repeat(50));

        // Update stats immediately
        setUploadStats({
          total: normalizedData.length,
          queue: normalizedData.length,
          uploaded: 0,
          errors: 0,
          sending: 0,
        });

        if (!inspectionId) {
          console.warn("⚠️ No inspection ID provided - skipping database insert");
          return { error: null };
        }

        console.log("\n💾 Inserting data into Supabase...");

        setIsUploading(true);
        let insertedCount = 0;
        const failedRows: Array<{ registroNum: any; error: string }> = [];

        for (let i = 0; i < normalizedData.length; i++) {
          const row = normalizedData[i];
          setCurrentProcessing(`Processing registro ${row.registroNum} (${i + 1}/${normalizedData.length})`);

          try {
            const imagesToUpload: { blob: Blob; fileName: string; type: string }[] = [];

            if (row.images && row.images.length > 0) {
              for (const imageObj of row.images) {
                try {
                  const { entry } = findImageInZip(zipContent, imageObj.value);
                  if (entry) {
                    const blob = await entry.async('blob');
                    const meta = await checkImageMetadata(blob);
                    (imageObj as any).type = meta.isThermal ? 'thermal' : 'optical';
                    imagesToUpload.push({
                      blob,
                      fileName: imageObj.value,
                      type: meta.isThermal ? 'thermal' : 'optical'
                    });
                  }
                } catch (e) {
                  console.error(`Error analyzing image ${imageObj.value}`, e);
                }
              }
            }

            const { error } = await supabase
              .from('inspection_measure')
              .upsert({
                inspection_id: inspectionId,
                registro_num: row.registroNum,
                data_criacao: row.dataCriacao,
                data_atualizacao: row.dataAtualizacao,
                inspetor: row.inspetor,
                regional: row.regional,
                subestacao: row.subestacao,
                alimentador: row.alimentador,
                estrutura: row.estrutura,
                ativo: row.ativo,
                localizacao: row.localizacao,
                latitude: row.latitude,
                longitude: row.longitude,
                altitude: row.altitude,
                x: row.x,
                y: row.y,
                zone: row.zone,
                tag: row.tag,
                diagnostico: row.diagnostico,
                cod_anomalia: row.codAnomalia,
                anomalia: row.anomalia,
                tipo_anomalia: row.tipoAnomalia,
                severidade: row.severidade,
                temp1_c: row.temp1C,
                temp_minima_c: row.tempMinimaC,
                delta_temp_c: row.deltaTempC,
                ac_da_temp1_c: row.acDaTemp1C,
                corrente_maxima_a: row.correnteMaximaA,
                corrente_na_inspecao_a: row.correnteNaInspecaoA,
                vel_do_ar_na_inspecao_ms: row.velDoArNaInspecaoMs,
                num_imagens: row.numImagens,
                images: row.images,
              }, { onConflict: 'inspection_id,registro_num' });

            if (error) {
              failedRows.push({ registroNum: row.registroNum, error: error.message });
            } else {
              insertedCount++;
              if (imagesToUpload.length > 0) {
                for (const { blob, fileName } of imagesToUpload) {
                  try {
                    const storagePath = `inspection_${inspectionId}/registro_${row.registroNum}/${fileName}`;
                    await supabase.storage
                      .from('inspection-measure-images')
                      .upload(storagePath, blob, {
                        contentType: blob.type || 'image/jpeg',
                        upsert: true,
                      });
                  } catch (imageError: any) {
                    console.error(`❌ Error uploading image ${fileName}:`, imageError?.message);
                  }
                }
              }
            }
          } catch (err: any) {
            failedRows.push({ registroNum: row.registroNum, error: err?.message || 'Unknown error' });
          }

          const currentProgress = Math.round(((i + 1) / normalizedData.length) * 100);
          setUploadProgress(currentProgress);
          setUploadStats({
            total: normalizedData.length,
            queue: normalizedData.length - (i + 1),
            uploaded: insertedCount,
            errors: failedRows.length,
            sending: 0,
          });
        }

        // Update last_measure_date
        if (insertedCount > 0 && inspectionId) {
          await supabase
            .from('inspections')
            .update({ last_measure_date: new Date().toISOString().split('T')[0] })
            .eq('id_unico', inspectionId);
        }

        setIsUploading(false);
        setCurrentProcessing('');

        if (failedRows.length === 0) {
          toast.success(`Successfully uploaded ${insertedCount} measures!`);
          if (inspectionId) {
            setTimeout(() => navigate(`/distribution/measures/${inspectionId}`), 1000);
          }
        } else {
          toast.warning(`Uploaded ${insertedCount} measures. ${failedRows.length} failed.`);
        }

        return {
          error: null,
          stats: { total: normalizedData.length, queue: 0, uploaded: insertedCount, errors: failedRows.length, sending: 0 }
        };

      } catch (parseError: any) {
        return { error: parseError.message || "Failed to parse Excel file." };
      }

    } catch (error) {
      return { error: "Failed to read ZIP file. Please ensure it's a valid ZIP archive." };
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);

    for (const file of droppedFiles) {
      if (file.name.toLowerCase().endsWith('.zip')) {
        const result = await processZipFile(file, inspectionId);
        if (result.error) {
          toast.error(result.error, { duration: 5000 });
          return;
        }
        if (result.stats) setUploadStats(result.stats);
      }
    }

    const newFiles: UploadFile[] = droppedFiles.map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: file.name,
      size: file.size,
      status: "queue" as const,
    }));
    setFiles([...files, ...newFiles]);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      for (const file of selectedFiles) {
        if (file.name.toLowerCase().endsWith('.zip')) {
          const result = await processZipFile(file, inspectionId);
          if (result.error) {
            toast.error(result.error, { duration: 5000 });
            return;
          }
          if (result.stats) setUploadStats(result.stats);
        }
      }

      const newFiles: UploadFile[] = selectedFiles.map((file, idx) => ({
        id: `${Date.now()}-${idx}`,
        name: file.name,
        size: file.size,
        status: "queue" as const,
      }));
      setFiles([...files, ...newFiles]);
    }
  };

  const handleClear = () => {
    setFiles([]);
    setUploadStats({ total: 0, queue: 0, uploaded: 0, errors: 0, sending: 0 });
    setUploadProgress(0);
    setIsUploading(false);
    setCurrentProcessing('');
  };

  // ─── KML / Trace handlers ────────────────────────────────────────────────────

  const processKmlFile = async (file: File): Promise<{ error: string | null }> => {
    if (!file.name.toLowerCase().endsWith('.kml')) {
      return { error: "Only .kml files are accepted for traces." };
    }
    if (!inspectionId) {
      return { error: "No inspection ID — cannot upload trace." };
    }

    setIsKmlUploading(true);
    setKmlProgress(10);
    setKmlCurrentProcessing(`Parsing ${file.name}…`);
    setKmlStats({ total: 1, queue: 1, uploaded: 0, errors: 0, sending: 1 });

    try {
      // 1. Read KML text and parse to GeoJSON
      const text = await file.text();
      const doc = new DOMParser().parseFromString(text, 'text/xml');
      const geoJson = toGeoJSON.kml(doc);
      setKmlProgress(60);

      // 2. Insert row in inspection_traces (store GeoJSON directly — no storage bucket needed)
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      setKmlCurrentProcessing(`Saving trace record…`);
      const { error: dbError } = await supabase
        .from('inspection_traces')
        .insert({
          inspection_id: inspectionId,
          file_name: file.name,
          file_path: '',           // no storage bucket — GeoJSON is stored in kml_geojson column
          upload_date: today,
          kml_geojson: geoJson,
        });

      if (dbError) {
        console.error('DB insert error:', dbError);
        return { error: `Database error: ${dbError.message}` };
      }

      setKmlProgress(100);
      setKmlStats({ total: 1, queue: 0, uploaded: 1, errors: 0, sending: 0 });

      // Redirect to measures page after successful upload
      if (inspectionId) {
        setTimeout(() => {
          navigate(`/distribution/measures/${inspectionId}`);
        }, 1000);
      }

      return { error: null };

    } catch (err: any) {
      console.error('KML processing error:', err);
      return { error: err?.message || 'Failed to process KML file.' };
    } finally {
      setIsKmlUploading(false);
      setKmlCurrentProcessing('');
    }
  };

  const handleKmlDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsKmlDragging(true);
  };

  const handleKmlDragLeave = () => setIsKmlDragging(false);

  const handleKmlDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsKmlDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    for (const file of droppedFiles) {
      if (file.name.toLowerCase().endsWith('.kml')) {
        const result = await processKmlFile(file);
        if (result.error) {
          toast.error(result.error, { duration: 5000 });
          setKmlStats(s => ({ ...s, errors: s.errors + 1, sending: 0, queue: 0 }));
        } else {
          toast.success(`Trace "${file.name}" uploaded successfully!`);
        }
      }
    }
  };

  const handleKmlFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      for (const file of selectedFiles) {
        if (file.name.toLowerCase().endsWith('.kml')) {
          const result = await processKmlFile(file);
          if (result.error) {
            toast.error(result.error, { duration: 5000 });
            setKmlStats(s => ({ ...s, errors: s.errors + 1, sending: 0, queue: 0 }));
          } else {
            toast.success(`Trace "${file.name}" uploaded successfully!`);
          }
        }
      }
    }
  };

  const handleKmlClear = () => {
    setKmlStats({ total: 0, queue: 0, uploaded: 0, errors: 0, sending: 0 });
    setKmlProgress(0);
    setIsKmlUploading(false);
    setKmlCurrentProcessing('');
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <main className="flex-1 lg:ml-60 transition-all duration-300">
        <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <DashboardHeader />

          <div className="space-y-6">
            {/* Show inspection ID if present */}
            {inspectionId && (
              <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Uploading for Inspection
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-mono">
                      ID: {inspectionId}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* ── Tab Switcher ──────────────────────────────────────────── */}
            <Card className="p-1 flex gap-1 w-fit">
              <button
                onClick={() => setActiveTab('measures')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === 'measures'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
              >
                <Upload className="h-4 w-4" />
                Measures <span className="text-xs opacity-70">.zip</span>
              </button>
              <button
                onClick={() => setActiveTab('trace')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === 'trace'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
              >
                <Map className="h-4 w-4" />
                GPS Trace <span className="text-xs opacity-70">.kml</span>
              </button>
            </Card>

            {/* ── Active panel ──────────────────────────────────────────── */}
            {activeTab === 'measures' ? (
              <div className="space-y-4">
                <UploadDropZone
                  isDragging={isDragging}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onFileSelect={handleFileInput}
                  inputId="measure-file-input"
                  title="Upload Thermographic Measures (.zip)"
                  accept=".zip"
                  acceptLabel="Only .zip files are accepted (must contain one Excel sheet + images)"
                />
                <UploadProgressBar
                  isVisible={isUploading}
                  currentProcessing={currentProcessing}
                  progress={uploadProgress}
                />
                <UploadStats stats={uploadStats} onClear={handleClear} />
              </div>
            ) : (
              <div className="space-y-4">
                <UploadDropZone
                  isDragging={isKmlDragging}
                  onDragOver={handleKmlDragOver}
                  onDragLeave={handleKmlDragLeave}
                  onDrop={handleKmlDrop}
                  onFileSelect={handleKmlFileInput}
                  inputId="kml-file-input"
                  title="Upload GPS Trace (.kml)"
                  accept=".kml"
                  acceptLabel="Only .kml files are accepted (Google Earth / GPS trace format)"
                  icon={<Map className="mx-auto h-12 w-12 text-green-500 mb-4" />}
                />
                <UploadProgressBar
                  isVisible={isKmlUploading}
                  currentProcessing={kmlCurrentProcessing}
                  progress={kmlProgress}
                />
                <UploadStats stats={kmlStats} onClear={handleKmlClear} />
              </div>
            )}
          </div>

          <footer className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>{t('copyright')}</div>
            <div>{t('version')}</div>
          </footer>
        </div>
      </main>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
