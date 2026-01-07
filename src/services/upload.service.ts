import api from '@/lib/api';
import type {
  CreateUploadRequest,
  Upload,
  UploadsResponse,
  Flashcard,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  PracticeStats
} from '@/types';

export const uploadService = {
  async createUpload(data: CreateUploadRequest): Promise<Upload> {
    const response = await api.post<Upload>('/uploads', data);
    return response.data;
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

  async deleteUpload(uploadId: string): Promise<void> {
    await api.delete(`/uploads/${uploadId}`);
  },

  async getFlashcards(uploadId: string): Promise<Flashcard[]> {
    const response = await api.get<Flashcard[]>(`/uploads/${uploadId}/flashcards`);
    return response.data;
  },

  async getRandomFlashcard(uploadId: string, excludeAttempted: boolean = false): Promise<Flashcard> {
    const response = await api.get<Flashcard>(`/uploads/${uploadId}/flashcards/random`, {
      params: { excludeAttempted },
    });
    return response.data;
  },

  async submitAnswer(uploadId: string, data: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    const response = await api.post<SubmitAnswerResponse>(`/uploads/${uploadId}/practice/answer`, data);
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
