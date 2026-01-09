import api, { getTokens } from '@/lib/api';
import axios from 'axios';
import type {
  CreateUploadRequest,
  CreatePdfUploadRequest,
  Upload,
  UploadSummary,
  UploadsResponse,
  Flashcard,
  KeyFlashcardsResponse,
  TopKeyPointsResponse,
  PaginatedChunksResponse,
  PaginatedFlashcardsResponse,
  ChunkDetail,
  SubmitDifficultyRequest,
  SubmitDifficultyResponse,
  PracticeStats
} from '@/types';

export const uploadService = {
  async createUpload(data: CreateUploadRequest): Promise<Upload> {
    const response = await api.post<Upload>('/uploads', data);
    return response.data;
  },

  async createPdfUpload(data: CreatePdfUploadRequest): Promise<Upload> {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.title) {
      formData.append('title', data.title);
    }

    // Use raw axios for file upload to avoid default Content-Type: application/json header
    const { accessToken } = getTokens();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    const response = await axios.post<Upload>(`${baseUrl}/uploads/pdf`, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Don't set Content-Type - let browser set multipart/form-data with boundary
      },
    });
    return response.data;
  },

  async getDownloadUrl(uploadId: string): Promise<string> {
    const response = await api.get<{ downloadUrl: string }>(`/uploads/${uploadId}/download`);
    return response.data.downloadUrl;
  },

  async getUploads(page: number = 1, limit: number = 10, status?: string): Promise<UploadsResponse> {
    const response = await api.get<UploadsResponse>('/uploads', {
      params: { page, limit, status },
    });
    return response.data;
  },

  async getUpload(uploadId: string): Promise<Upload> {
    const response = await api.get<Upload>(`/uploads/${uploadId}`);
    return response.data;
  },

  // Lightweight endpoint - doesn't load all chunks/flashcards
  async getUploadSummary(uploadId: string): Promise<UploadSummary> {
    const response = await api.get<UploadSummary>(`/uploads/${uploadId}/summary`);
    return response.data;
  },

  async deleteUpload(uploadId: string): Promise<void> {
    await api.delete(`/uploads/${uploadId}`);
  },

  async getFlashcards(uploadId: string): Promise<Flashcard[]> {
    const response = await api.get<{ flashcards: Flashcard[] }>(`/uploads/${uploadId}/flashcards`);
    return response.data.flashcards;
  },

  async getPaginatedFlashcards(uploadId: string, page: number = 1, limit: number = 10, chunkIndex?: number): Promise<PaginatedFlashcardsResponse> {
    const response = await api.get<PaginatedFlashcardsResponse>(`/uploads/${uploadId}/flashcards/paginated`, {
      params: { page, limit, chunkIndex }
    });
    return response.data;
  },

  async getKeyFlashcards(uploadId: string, cardsPerChunk: number = 2): Promise<KeyFlashcardsResponse> {
    const response = await api.get<KeyFlashcardsResponse>(`/uploads/${uploadId}/flashcards/key`, {
      params: { cardsPerChunk }
    });
    return response.data;
  },

  async getTopKeyPoints(uploadId: string, pointsPerChunk: number = 2, page: number = 1, limit: number = 3): Promise<TopKeyPointsResponse> {
    const response = await api.get<TopKeyPointsResponse>(`/uploads/${uploadId}/keypoints/top`, {
      params: { pointsPerChunk, page, limit }
    });
    return response.data;
  },

  async getPaginatedChunks(uploadId: string, page: number = 1, limit: number = 5): Promise<PaginatedChunksResponse> {
    const response = await api.get<PaginatedChunksResponse>(`/uploads/${uploadId}/chunks`, {
      params: { page, limit }
    });
    return response.data;
  },

  async getChunkDetail(uploadId: string, chunkIndex: number): Promise<ChunkDetail> {
    const response = await api.get<ChunkDetail>(`/uploads/${uploadId}/chunks/${chunkIndex}`);
    return response.data;
  },

  async getRandomFlashcard(uploadId: string, excludeAttempted: boolean = false): Promise<Flashcard> {
    const response = await api.get<Flashcard>(`/uploads/${uploadId}/flashcards/random`, {
      params: { excludeAttempted },
    });
    return response.data;
  },

  async submitDifficulty(uploadId: string, data: SubmitDifficultyRequest): Promise<SubmitDifficultyResponse> {
    const response = await api.post<SubmitDifficultyResponse>(`/uploads/${uploadId}/practice/difficulty`, data);
    return response.data;
  },

  async getPracticeStats(uploadId: string): Promise<PracticeStats> {
    const response = await api.get<PracticeStats>(`/uploads/${uploadId}/practice/stats`);
    return response.data;
  },

  async getGlobalPracticeStats(): Promise<PracticeStats> {
    const response = await api.get<PracticeStats>('/practice/stats');
    return response.data;
  },
};

export default uploadService;
