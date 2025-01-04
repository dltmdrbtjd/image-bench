import sharp from "sharp";
import { performance } from "perf_hooks";

interface ImageConfig {
  quality: number;
  format: keyof sharp.FormatEnum;
  inputDir: string;
  outputDir: string;
}

interface ResizeOptions {
  width?: number;
  height?: number;
}

const CONFIG: ImageConfig = {
  quality: 80,
  format: "webp",
  inputDir: "../assets",
  outputDir: "../output/sharp",
};

const IMAGE_FILES = Array.from({ length: 6 }, (_, i) => `${i + 1}.jpg`);

async function processImage(
  fileName: string,
  options: ResizeOptions = {}
): Promise<void> {
  const inputPath = `${CONFIG.inputDir}/${fileName}`;
  const outputFileName = fileName.replace(".jpg", ".webp");
  const outputPath = `${CONFIG.outputDir}/${outputFileName}`;

  const startTime = performance.now();

  try {
    const image = sharp(inputPath);
    const { width, height } = await image.metadata();

    if (!width || !height) {
      throw new Error(`메타데이터 누락: ${fileName}`);
    }

    const aspectRatio = width / height;
    const resizeOptions = getResizeOptions(options, aspectRatio);

    await image
      .resize(resizeOptions)
      .toFormat(CONFIG.format, { quality: CONFIG.quality })
      .toFile(outputPath);

    console.log(
      `${fileName} 처리 완료: ${(performance.now() - startTime).toFixed(2)}ms`
    );
  } catch (error) {
    console.error(`${fileName} 처리 실패:`, error);
    throw error;
  }
}

function getResizeOptions(
  { width, height }: ResizeOptions,
  aspectRatio: number
) {
  if (width && height) return { width, height };
  if (width) return { width, height: Math.round(width / aspectRatio) };
  if (height) return { width: Math.round(height * aspectRatio), height };
  return {};
}

async function main() {
  const totalStart = performance.now();

  try {
    await Promise.all(IMAGE_FILES.map((file) => processImage(file)));
    console.log(
      `전체 처리 완료: ${(performance.now() - totalStart).toFixed(2)}ms`
    );
  } catch (error) {
    console.error("이미지 처리 중 오류 발생:", error);
    process.exit(1);
  }
}

main();
