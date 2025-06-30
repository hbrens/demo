import { create } from 'zustand'

// 初始图片 URL 列表
const initialImageUrls = [
  'http://127.0.0.1:8080/b67a7d25bacfb81a32e568696f9f694c.jpg',
  'http://127.0.0.1:8080/b67a7d25bacfb81a32e568696f9f694c.jpg',
  'http://127.0.0.1:8080/b67a7d25bacfb81a32e568696f9f694c.jpg',
  'http://127.0.0.1:8080/b67a7d25bacfb81a32e568696f9f694c.jpg',
];

interface ImageViewerStore {
  imageUrls: string[];
  setImageUrls: (urls: string[]) => void;
  addImageUrl: (url: string) => void;
  removeImageUrl: (idx: number) => void;
  resetImageUrls: () => void;
}

export const useImageViewerStore = create<ImageViewerStore>((set) => ({
  imageUrls: initialImageUrls,
  setImageUrls: (urls) => set({ imageUrls: urls }),
  addImageUrl: (url) => set((state) => ({ imageUrls: [...state.imageUrls, url] })),
  removeImageUrl: (idx) => set((state) => ({ imageUrls: state.imageUrls.filter((_, i) => i !== idx) })),
  resetImageUrls: () => set({ imageUrls: initialImageUrls }),
})) 