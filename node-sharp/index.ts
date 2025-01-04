import sharp from "sharp";
import fs from "fs";
import { performance } from "perf_hooks";

const imagePath = [
  "../assets/1.jpg",
  "../assets/2.jpg",
  "../assets/3.jpg",
  "../assets/4.jpg",
  "../assets/5.jpg",
  "../assets/6.jpg",
];

const outputPath = "../output/sharp";

const start = performance.now();

async function processImage(imagePath: string, w?: number, h?: number) {
  const fileName =
    imagePath.split("/").pop()?.replace(".jpg", ".webp") || "output.webp";
  const fullOutputPath = `${outputPath}/${fileName}`;

  const originalImage = sharp(imagePath);
  const imageFile = fs.readFileSync(imagePath);
  const metadata = await originalImage.metadata();
  const { width, height } = metadata;
  const image = sharp(imageFile);

  if (!width || !height) {
    throw new Error("Image metadata is missing");
  }

  const aspectRatio = width / height;

  if (w && h) {
    await image
      .resize(w, h)
      .toFormat("webp", { quality: 80 })
      .toFile(fullOutputPath);
  } else if (w) {
    await image
      .resize(w, Math.round(w / aspectRatio))
      .toFormat("webp", { quality: 80 })
      .toFile(fullOutputPath);
  } else if (h) {
    await image
      .resize(Math.round(h * aspectRatio), h)
      .toFormat("webp", { quality: 80 })
      .toFile(fullOutputPath);
  } else {
    await image.toFormat("webp", { quality: 80 }).toFile(fullOutputPath);
  }

  const end = performance.now();
  console.log(`Sharp 처리 시간: ${imagePath} ${(end - start).toFixed(2)} ms`);
}

async function processAllImages() {
  try {
    await Promise.all(imagePath.map((path) => processImage(path)));
    console.log("모든 이미지 처리 완료");
  } catch (error) {
    console.error("이미지 처리 중 오류 발생:", error);
  }
}

processAllImages();
