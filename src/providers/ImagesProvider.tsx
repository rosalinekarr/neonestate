import { ReactNode, createContext, useState } from "react";
import { useFirebaseApp } from "../hooks";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { cropImage, scaleImage } from "../utils";

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
    const blob = await cropImage(file, 144, 144);
    if (blob === null) throw new Error("Unable to process image");
    await uploadBytes(ref(storage, path), blob, { contentType: "image/png" });
    return path;
  }

  async function uploadPostAttachment(file: File) {
    if (!ACCEPTABLE_ATTACHMENT_FILE_TYPES.includes(file.type))
      throw new Error("Unsupported file type");
    const storage = getStorage(app);
    const path = `attachments/${crypto.randomUUID()}`;
    const blob = await scaleImage(file, 640);
    if (blob === null) throw new Error("Unable to process image");
    await uploadBytes(ref(storage, path), blob, { contentType: "image/png" });
    return path;
  }

  async function uploadRoomBackground(file: File) {
    if (!ACCEPTABLE_BACKGROUND_FILE_TYPES.includes(file.type))
      throw new Error("Unsupported file type");
    const storage = getStorage(app);
    const path = `backgrounds/${crypto.randomUUID()}`;
    const blob = await scaleImage(file, 1024);
    if (blob === null) throw new Error("Unable to process image");
    await uploadBytes(ref(storage, path), blob, { contentType: "image/png" });
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
