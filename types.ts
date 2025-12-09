export interface IdolInfo {
  name: string;
  group?: string;
  description: string;
  sourceUrl?: string;
}

export interface PhotoFrame {
  id: number;
  idolImage: string; // Base64
  userImage: string | null; // Base64
}

export enum AppState {
  SETUP = 'SETUP',
  CAPTURE = 'CAPTURE',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT'
}

export interface GeneratedVideo {
  uri: string;
  mimeType: string;
}
