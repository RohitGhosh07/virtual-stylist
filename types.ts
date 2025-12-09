export enum OutfitStyle {
  CASUAL = 'Casual',
  BUSINESS = 'Business',
  NIGHT_OUT = 'Night Out'
}

export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

export interface OutfitResult {
  style: OutfitStyle;
  imageUrl: string | null;
  status: GenerationStatus;
  error?: string;
}

export interface ImageUploadState {
  file: File | null;
  previewUrl: string | null;
  base64: string | null;
}