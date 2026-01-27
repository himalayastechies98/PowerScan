import * as XLSX from "xlsx";
import JSZip from "jszip";
import ExifReader from "exifreader";

/**
 * Normalizes a single Excel row into a structured object
 */
export const normalizeExcelRow = (row: any) => {
    const getValue = (key: string) => {
        const value = row[key];
        if (value === undefined || value === null || value === '') {
            return null;
        }
        return value;
    };

    // Collect images from Imagem 1-2 columns
    const images: { name: string; value: string }[] = [];
    for (let i = 1; i <= 2; i++) {
        const imageKey = `Imagem ${i}`;
        const imageValue = getValue(imageKey);
        if (imageValue !== null) {
            images.push({
                name: `Imagem${i}`,
                value: imageValue as string
            });
        }
    }

    return {
        dataCriacao: getValue('Data Criação'),
        dataAtualizacao: getValue('Data Atualização'),
        registroNum: getValue('Registro Num.'),
        inspetor: getValue('Inspetor'),
        regional: getValue('Regional'),
        subestacao: getValue('Subestação'),
        alimentador: getValue('Alimentador'),
        estrutura: getValue('Estrutura'),
        ativo: getValue('Ativo'),
        localizacao: getValue('Localização'),
        latitude: getValue('Latitude'),
        longitude: getValue('Longitude'),
        altitude: getValue('Altitude'),
        x: getValue('X'),
        y: getValue('Y'),
        zone: getValue('Zone'),
        tag: getValue('Tag'),
        diagnostico: getValue('Diagnóstico'),
        codAnomalia: getValue('Cód.Anomalia'),
        anomalia: getValue('Anomalia'),
        tipoAnomalia: getValue('Tipo Anomalia'),
        severidade: getValue('Severidade'),
        temp1C: getValue('Temp.1 °C'),
        tempMinimaC: getValue('Temp.Mínima °C'),
        deltaTempC: getValue('Delta T °C'),
        acDaTemp1C: getValue('AC da Temp.1 °C'),
        correnteMaximaA: getValue('Corrente Máxima A'),
        correnteNaInspecaoA: getValue('Corrente na Inspeção A'),
        velDoArNaInspecaoMs: getValue('Vel. do Ar na Inspeção m/s'),
        numImagens: getValue('Num. Imagens'),
        images: images,
    };
};

/**
 * Extracts and validates ZIP contents
 */
export const extractZipContents = async (file: File) => {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);

    const excelExtensions = ['.xlsx', '.xls'];
    const imageExtensions = ['.jpg', '.jpeg', '.png'];

    const excelFiles: string[] = [];
    const imageFiles: string[] = [];

    zipContent.forEach((relativePath, zipEntry) => {
        if (zipEntry.dir) return;

        const lowerPath = relativePath.toLowerCase();

        if (excelExtensions.some(ext => lowerPath.endsWith(ext))) {
            excelFiles.push(relativePath);
        } else if (imageExtensions.some(ext => lowerPath.endsWith(ext))) {
            imageFiles.push(relativePath);
        }
    });

    return { zipContent, excelFiles, imageFiles };
};

/**
 * Parses Excel file from ZIP
 */
export const parseExcelFromZip = async (
    zipContent: JSZip,
    excelFileName: string
) => {
    const excelZipEntry = zipContent.file(excelFileName);

    if (!excelZipEntry) {
        throw new Error('Failed to extract Excel file from ZIP');
    }

    const excelArrayBuffer = await excelZipEntry.async("arraybuffer");
    const workbook = XLSX.read(excelArrayBuffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    return { jsonData, sheetName: firstSheetName };
};

/**
 * Finds image in ZIP by filename (ignoring directory path)
 */
/**
 * Finds image in ZIP by filename (ignoring directory path)
 */
export const findImageInZip = (
    zipContent: JSZip,
    imageFileName: string
): { entry: JSZip.JSZipObject | null; path: string } => {
    let imageZipEntry: JSZip.JSZipObject | null = null;
    let actualImagePath = '';

    zipContent.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir) {
            const fileName = relativePath.split('/').pop();
            if (fileName === imageFileName) {
                imageZipEntry = zipEntry;
                actualImagePath = relativePath;
            }
        }
    });

    return { entry: imageZipEntry, path: actualImagePath };
};

/**
 * Checks image metadata to determine if it's a thermal image
 */
export const checkImageMetadata = async (blob: Blob): Promise<{ isThermal: boolean; make?: string; model?: string }> => {
    try {
        const arrayBuffer = await blob.arrayBuffer();
        const tags = ExifReader.load(arrayBuffer);

        // Check for FLIR make or model
        const make = tags['Make']?.description;
        const model = tags['Model']?.description;
        const cameraModel = tags['Camera Model']?.description; // Sometimes stored here

        const isFlir =
            (make && make.toUpperCase().includes('FLIR')) ||
            (model && model.toUpperCase().includes('FLIR')) ||
            (cameraModel && cameraModel.toUpperCase().includes('FLIR'));

        // Also check for specific thermal tags if Make/Model is missing or ambiguous
        // 'RawThermalImage' is a common tag in FLIR radiometric JPEGs
        // However, ExifReader might parse it differently. 
        // We'll rely mainly on Make/Model for now as it's the most robust standard indicator.

        return {
            isThermal: !!isFlir,
            make: make || '',
            model: model || cameraModel || ''
        };
    } catch (e) {
        console.warn("Failed to read EXIF data", e);
        return { isThermal: false };
    }
};
