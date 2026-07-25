import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { env } from '../config/env';

export interface ProcessedImage {
  imageUrl: string;
  thumbnailUrl: string;
}

export class ImageService {
  private static uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR, 'rooms');

  private static async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      // Directory already exists or created successfully
    }
  }

  public static async processAndSaveRoomImage(
    buffer: Buffer
  ): Promise<ProcessedImage> {
    await this.ensureDirectoryExists();

    const uniqueId = crypto.randomBytes(8).toString('hex');
    const mainFileName = `room-${uniqueId}.webp`;
    const thumbFileName = `room-${uniqueId}-thumb.webp`;

    const mainFilePath = path.join(this.uploadDir, mainFileName);
    const thumbFilePath = path.join(this.uploadDir, thumbFileName);

    // 1. Process High-Res WebP Image (Max width 1920px, 80% quality)
    await sharp(buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .toFormat('webp', { quality: 80 })
      .toFile(mainFilePath);

    // 2. Process Thumbnail WebP Image (400x300 crop, 75% quality)
    await sharp(buffer)
      .resize(400, 300, { fit: 'cover' })
      .toFormat('webp', { quality: 75 })
      .toFile(thumbFilePath);

    return {
      imageUrl: `/uploads/rooms/${mainFileName}`,
      thumbnailUrl: `/uploads/rooms/${thumbFileName}`,
    };
  }

  public static async deleteImageFile(relativeUrl: string): Promise<void> {
    if (!relativeUrl) return;
    try {
      const fileName = path.basename(relativeUrl);
      const filePath = path.join(this.uploadDir, fileName);
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore if file doesn't exist on disk
    }
  }
}
