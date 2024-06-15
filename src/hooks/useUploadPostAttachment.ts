import { useContext } from "react";
import { ImagesContext } from "../providers/ImagesProvider";

export default function useUploadPostAttachment() {
  const imagesContext = useContext(ImagesContext);
  if (!imagesContext)
    throw new Error(
      "Missing ImagesContext: useUploadPostAttachment must only be invoked within ImagesProvider",
    );
  return imagesContext.uploadPostAttachment;
}
