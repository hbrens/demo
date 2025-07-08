import { create } from 'zustand'

// 初始图片 URL 列表
const initialImageUrls = [
  'http://127.0.0.1:8080/b67a7d25bacfb81a32e568696f9f694c.jpg',
  'http://127.0.0.1:8080/0f04af422502a40b6c8dc19d53d1f348.jpg',
  'http://127.0.0.1:8080/3dd2519cf0d935fa9de4431d4e28d922.jpg',
  'http://127.0.0.1:8080/78c0715fb026991310d1668d7a025623.jpg',
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