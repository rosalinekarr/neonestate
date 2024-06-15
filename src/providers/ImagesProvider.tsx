import { ReactNode, createContext, useState } from "react";
import { useFirebaseApp } from "../hooks";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const ACCEPTABLE_ATTACHMENT_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
const ACCEPTABLE_AVATAR_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTABLE_BACKGROUND_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

interface ImagesProviderProps {
  children: ReactNode;
}

export interface ImagesContext {
  fetchImage: (path: string) => Promise<void>;
  images: Record<string, string>;
  uploadAvatar: (file: File) => Promise<string>;
  uploadPostAttachment: (file: File) => Promise<string>;
  uploadRoomBackground: (file: File) => Promise<string>;
}

export const ImagesContext = createContext<ImagesContext | null>(null);

export default function ImagesProvider({ children }: ImagesProviderProps) {
  const app = useFirebaseApp();
  const [images, setImages] = useState<Record<string, string>>({});

  async function fetchImage(path: string) {
    if (images[path]) return;
    const storage = getStorage(app);
    try {
      const fetchedUrl = await getDownloadURL(ref(storage, path));
      setImages((prevImages) => ({
        ...prevImages,
        [path]: fetchedUrl,
      }));
    } catch (e: any) {
      if (e["code"] !== "storage/object-not-found") throw e;
    }
  }

  async function uploadAvatar(file: File) {
    if (!ACCEPTABLE_AVATAR_FILE_TYPES.includes(file.type))
      throw new Error("Unsupported file type");
    const storage = getStorage(app);
    const path = `avatars/${crypto.randomUUID()}`;
    await uploadBytes(ref(storage, path), file, { contentType: file.type });
    return path;
  }

  async function uploadPostAttachment(file: File) {
    if (!ACCEPTABLE_ATTACHMENT_FILE_TYPES.includes(file.type))
      throw new Error("Unsupported file type");
    const storage = getStorage(app);
    const path = `attachments/${crypto.randomUUID()}`;
    await uploadBytes(ref(storage, path), file, { contentType: file.type });
    return path;
  }

  async function uploadRoomBackground(file: File) {
    if (!ACCEPTABLE_BACKGROUND_FILE_TYPES.includes(file.type))
      throw new Error("Unsupported file type");
    const storage = getStorage(app);
    const path = `backgrounds/${crypto.randomUUID()}`;
    await uploadBytes(ref(storage, path), file, { contentType: file.type });
    return path;
  }

  return (
    <ImagesContext.Provider
      value={{
        fetchImage,
        images,
        uploadAvatar,
        uploadPostAttachment,
        uploadRoomBackground,
      }}
    >
      {children}
    </ImagesContext.Provider>
  );
}
