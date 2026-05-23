export interface Leader {
  id: string;
  name: string;
  colors: string[]; // up to 2
  imageUrl: string;
  altImageUrl?: string;
  createdAt: string;
}
