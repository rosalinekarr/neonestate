export async function scaleImage(
  file: File,
  scaledWidth: number,
): Promise<Blob | null> {
  const { promise, resolve } = Promise.withResolvers<Blob | null>();
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    const scaleFactor = scaledWidth / image.width;

    canvas.width = scaledWidth;
    canvas.height = scaleFactor * image.height;

    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) return;
    canvasContext.drawImage(
      image,
      0,
      0,
      image.width,
      image.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    canvas.toBlob(resolve, "image/png");
  };
  image.src = URL.createObjectURL(file);
  return promise;
}

export async function cropImage(
  file: File,
  scaledWidth: number,
  scaledHeight: number,
): Promise<Blob | null> {
  const { promise, resolve } = Promise.withResolvers<Blob | null>();
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) return;

    if (image.width > image.height) {
      canvasContext.drawImage(
        image,
        (image.width - image.height) / 2,
        0,
        image.height,
        image.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    } else {
      canvasContext.drawImage(
        image,
        0,
        (image.height - image.width) / 2,
        image.width,
        image.width,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    }

    canvas.toBlob(resolve, "image/png");
  };
  image.src = URL.createObjectURL(file);
  return promise;
}
