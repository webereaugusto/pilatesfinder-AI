export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content: string;
      }[];
    }[];
  };
}

export interface StudioData {
  rawText: string;
  parsedName?: string;
  parsedAddress?: string;
  parsedPhone?: string;
  parsedWebsite?: string;
  parsedInstagram?: string;
  parsedFacebook?: string;
  parsedDescription?: string;
}

export interface SearchResult {
  studios: StudioData[];
  groundingChunks: GroundingChunk[];
}

export enum SearchStatus {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR
}