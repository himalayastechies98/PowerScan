import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
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

interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: "queue" | "sending" | "error" | "complete";
}

export default function UploadMeasures() {
  const { t } = useTranslation();
  const { inspectionId } = useParams<{ inspectionId?: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Measure upload statistics
  const [uploadStats, setUploadStats] = useState({
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processZipFile = async (file: File, inspectionId?: string): Promise<{ error: string | null; stats?: { total: number; queue: number; uploaded: number; errors: number; sending: number } }> => {
    try {
      console.log(`Processing ZIP file: ${file.name}`);

      // Extract ZIP contents
      const { zipContent, excelFiles, imageFiles } = await extractZipContents(file);

      console.log("� ZIP File Contents:");
      console.log("=".repeat(50));
      console.log(`📊 Excel files found: ${excelFiles.length}`);
      console.log(`🖼️ Image files found: ${imageFiles.length}`);

      // Validate exactly one Excel file
      if (excelFiles.length === 0) {
        console.error(`❌ ERROR: No Excel file found in ${file.name}`);
        console.log("=".repeat(50));
        return { error: "No Excel file (.xlsx or .xls) found in the ZIP file. Please ensure your ZIP contains exactly one Excel file." };
      }

      if (excelFiles.length > 1) {
        console.error(`❌ ERROR: Multiple Excel files found in ${file.name}`);
        console.error("Excel files:", excelFiles);
        console.log("=".repeat(50));
        return { error: `Multiple Excel files found (${excelFiles.length}). Please ensure your ZIP contains exactly one Excel file.` };
      }

      // Success - exactly one Excel file
      console.log(`✅ Excel file: ${excelFiles[0]}`);
      console.log("=".repeat(50));

      // Parse the Excel file
      console.log("📊 Parsing Excel file...");
      try {
        const { jsonData, sheetName } = await parseExcelFromZip(zipContent, excelFiles[0]);

        // Normalize all rows
        const normalizedData = jsonData.map(normalizeExcelRow);

        // Log results
        console.log("📊 Excel Parsing Results:");
        console.log("=".repeat(50));
        console.log(`Sheet name: ${sheetName}`);
        console.log(`Total rows: ${jsonData.length}`);
        console.log("\n🔄 Normalized Data:");
        console.log("One fully mapped object:");
        console.log(JSON.stringify(normalizedData[0], null, 2));
        console.log("=".repeat(50));

        // Update stats immediately - show items in queue
        setUploadStats({
          total: normalizedData.length,
          queue: normalizedData.length,
          uploaded: 0,
          errors: 0,
          sending: 0,
        });

        // Insert into Supabase
        if (!inspectionId) {
          console.warn("⚠️ No inspection ID provided - skipping database insert");
          return { error: null };
        }

        console.log("\n💾 Inserting data into Supabase...");
        console.log("=".repeat(50));

        setIsUploading(true);
        let insertedCount = 0;
        const failedRows: Array<{ registroNum: any; error: string }> = [];

        for (let i = 0; i < normalizedData.length; i++) {
          const row = normalizedData[i];

          // Update current processing status
          setCurrentProcessing(`Processing registro ${row.registroNum} (${i + 1}/${normalizedData.length})`);

          try {
            // 1. Prepare images and check metadata BEFORE insertion
            const imagesToUpload: { blob: Blob; fileName: string; type: string }[] = [];

            if (row.images && row.images.length > 0) {
              for (const imageObj of row.images) {
                try {
                  const { entry, path } = findImageInZip(zipContent, imageObj.value);
                  if (entry) {
                    const blob = await entry.async('blob');
                    const meta = await checkImageMetadata(blob);

                    // Add type to the image object that will be saved to DB
                    // (This modifies the object in the row.images array)
                    (imageObj as any).type = meta.isThermal ? 'thermal' : 'optical';

                    console.log(`🖼️ Image Analysis: ${imageObj.value} is ${meta.isThermal ? 'THERMAL 🔥' : 'OPTICAL 📷'} (${meta.make} ${meta.model})`);

                    imagesToUpload.push({
                      blob,
                      fileName: imageObj.value,
                      type: meta.isThermal ? 'thermal' : 'optical'
                    });
                  } else {
                    console.warn(`⚠️ Image not found in ZIP: ${imageObj.value}`);
                  }
                } catch (e) {
                  console.error(`Error analyzing image ${imageObj.value}`, e);
                }
              }
            }

            // 2. Insert into Supabase (now includes image types)
            const { error } = await supabase
              .from('inspection_measure')
              .insert({
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
                images: row.images, // Updated with types
              });

            if (error) {
              failedRows.push({
                registroNum: row.registroNum,
                error: error.message
              });
              console.error(`❌ Failed to insert row ${row.registroNum}:`, error.message);
            } else {
              insertedCount++;

              // 3. Upload images to Supabase Storage (using prepared blobs)
              if (imagesToUpload.length > 0) {
                console.log(`📤 Uploading ${imagesToUpload.length} images for registro ${row.registroNum}...`);

                for (const { blob, fileName, type } of imagesToUpload) {
                  try {
                    // Create storage path
                    const storagePath = `inspection_${inspectionId}/registro_${row.registroNum}/${fileName}`;

                    // Upload to Supabase Storage
                    const { error: uploadError } = await supabase.storage
                      .from('inspection-measure-images')
                      .upload(storagePath, blob, {
                        contentType: blob.type || 'image/jpeg',
                        upsert: true,
                      });

                    if (uploadError) {
                      console.error(`❌ Failed to upload image ${fileName}:`, uploadError.message);
                    } else {
                      console.log(`✅ Uploaded: ${storagePath} (${type})`);
                    }
                  } catch (imageError: any) {
                    console.error(`❌ Error processing image ${fileName}:`, imageError?.message || imageError);
                  }
                }
              }
            }
          } catch (err: any) {
            failedRows.push({
              registroNum: row.registroNum,
              error: err?.message || 'Unknown error'
            });
            console.error(`❌ Exception inserting row ${row.registroNum}:`, err);
          }

          // Update progress and stats in real-time
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

        // Reset uploading state
        setIsUploading(false);
        setCurrentProcessing('');

        console.log("=".repeat(50));
        console.log(`✅ Successfully inserted: ${insertedCount} rows`);
        console.log(`❌ Failed to insert: ${failedRows.length} rows`);

        if (failedRows.length > 0) {
          console.log("\nFailed rows:");
          console.table(failedRows);
        }

        console.log("=".repeat(50));

        // Show toast notification
        if (failedRows.length === 0) {
          toast.success(`Successfully uploaded ${insertedCount} measures!`);
        } else {
          toast.warning(`Uploaded ${insertedCount} measures. ${failedRows.length} failed.`);
        }

        // Return upload statistics
        return {
          error: null,
          stats: {
            total: normalizedData.length,
            queue: 0,
            uploaded: insertedCount,
            errors: failedRows.length,
            sending: 0,
          }
        };

      } catch (parseError) {
        console.error("Error parsing Excel file:", parseError);
        return { error: "Failed to parse Excel file. Please ensure it's a valid Excel file." };
      }

      return { error: null };

    } catch (error) {
      console.error("Error processing ZIP file:", error);
      return { error: "Failed to read ZIP file. Please ensure it's a valid ZIP archive." };
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);

    // Process ZIP files
    for (const file of droppedFiles) {
      if (file.name.toLowerCase().endsWith('.zip')) {
        const result = await processZipFile(file, inspectionId);
        if (result.error) {
          toast.error(result.error, {
            duration: 5000,
          });
          return;
        }
        if (result.stats) {
          setUploadStats(result.stats);
        }
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

      // Process ZIP files
      for (const file of selectedFiles) {
        if (file.name.toLowerCase().endsWith('.zip')) {
          const result = await processZipFile(file, inspectionId);
          if (result.error) {
            toast.error(result.error, {
              duration: 5000,
            });
            return;
          }
          if (result.stats) {
            setUploadStats(result.stats);
          }
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
    setUploadStats({
      total: 0,
      queue: 0,
      uploaded: 0,
      errors: 0,
      sending: 0,
    });
    setUploadProgress(0);
    setIsUploading(false);
    setCurrentProcessing('');
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

            <Tabs defaultValue="vehicle" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="vehicle">Vehicle Thermographic Measures / Traces</TabsTrigger>
                <TabsTrigger value="drone">Drone Thermographic Measures</TabsTrigger>
              </TabsList>

              <TabsContent value="vehicle" className="space-y-4">
                <UploadDropZone
                  isDragging={isDragging}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onFileSelect={handleFileInput}
                  inputId="vehicle-file-input"
                  title="You are uploading thermographic measures / traces"
                />
              </TabsContent>

              <TabsContent value="drone" className="space-y-4">
                <UploadDropZone
                  isDragging={isDragging}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onFileSelect={handleFileInput}
                  inputId="drone-file-input"
                  title="You are uploading drone thermographic measures"
                />
              </TabsContent>
            </Tabs>

            {/* Upload Progress */}
            <UploadProgressBar
              isVisible={isUploading}
              currentProcessing={currentProcessing}
              progress={uploadProgress}
            />

            {/* Upload Status */}
            <UploadStats stats={uploadStats} onClear={handleClear} />
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
