import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import { MAX_IMAGE_SIZE_BYTES } from "@artify/shared";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export type ImageVariants = {
  master: VariantInfo;
  web: VariantInfo;
  thumbnail: VariantInfo;
};

export type VariantInfo = {
  filename: string;
  url: string;
  size: number;
};

export class ImageService {
  // static MAX_ORIGINAL_BYTES = 30 * 1024 * 1024; // 30 MB
  static MASTER_MAX_DIM = 4000;
  static WEB_MAX_WIDTH = 1200;
  static WEB_MAX_HEIGHT = 1600;
  static THUMB_SIZE = 300;

  static async processPainting(buffer: Buffer): Promise<ImageVariants> {
    const id = randomUUID();

    const master = await this.generateMaster(buffer, id);

    const [web, thumbnail] = await Promise.all([
      this.generateWeb(master.buffer, id),
      this.generateThumbnail(master.buffer, id),
    ]);

    return {
      master: master.info,
      web: web.info,
      thumbnail: thumbnail.info,
    };
  }

  private static async generateMaster(buffer: Buffer, id: string) {
    const metadata = await sharp(buffer).metadata();

    let sharpBase = this.createBaseSharp(buffer);

    if (metadata.hasAlpha) {
      sharpBase = sharpBase.flatten({ background: "#ffffff" });
    }

    const needsCompression = buffer.length > MAX_IMAGE_SIZE_BYTES;

    let masterBuffer: Buffer;

    if (needsCompression) {
      masterBuffer = await this.resizeToMax(sharpBase, this.MASTER_MAX_DIM)
        .jpeg({
          quality: 95,
          chromaSubsampling: "4:4:4",
        })
        .toBuffer();
    } else {
      masterBuffer = await sharpBase
        .jpeg({
          quality: 95,
          chromaSubsampling: "4:4:4",
        })
        .toBuffer();
    }

    const filename = `${id}-master.jpg`;
    const info = await this.saveVariant(filename, masterBuffer);

    return { buffer: masterBuffer, info };
  }

  private static generateWeb(masterBuffer: Buffer, id: string) {
    return this.generateVariant(masterBuffer, id, {
      suffix: "web",
      width: this.WEB_MAX_WIDTH,
      height: this.WEB_MAX_HEIGHT,
      quality: 85,
    });
  }

  private static generateThumbnail(masterBuffer: Buffer, id: string) {
    return this.generateVariant(masterBuffer, id, {
      suffix: "thumb",
      width: this.THUMB_SIZE,
      height: this.THUMB_SIZE,
      quality: 75,
    });
  }

  // -------------------------------------------------------------
  // INTERNAL
  // -------------------------------------------------------------

  private static async generateVariant(
    inputBuffer: Buffer,
    id: string,
    options: {
      suffix: string;
      width: number;
      height: number;
      quality: number;
    }
  ) {
    const { suffix, width, height, quality } = options;

    const outputBuffer = await sharp(inputBuffer)
      .resize({
        width,
        height,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality })
      .toBuffer();

    const filename = `${id}-${suffix}.jpg`;
    const info = await this.saveVariant(filename, outputBuffer);

    return { buffer: outputBuffer, info };
  }

  private static createBaseSharp(buffer: Buffer) {
    return sharp(buffer).rotate().removeAlpha();
  }

  private static resizeToMax(sharpInstance: sharp.Sharp, max: number) {
    return sharpInstance.resize({
      width: max,
      height: max,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  private static async saveVariant(filename: string, buffer: Buffer) {
    const filePath = path.join(UPLOADS_DIR, filename);
    await fs.writeFile(filePath, buffer);

    return {
      filename,
      url: `/uploads/${filename}`,
      size: buffer.length,
    };
  }
}
