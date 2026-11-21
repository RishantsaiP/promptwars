/**
 * Resizes an uploaded image file client-side using an HTML canvas
 * Constrains maximum dimension to <= 1280px and outputs a compressed JPEG data URL.
 */
export async function resizeImageClientSide(file: File, maxDimension: number = 1280): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas 2D context unavailable'));
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Quality 0.82 provides great visual clarity under 500 KB
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

        // Ensure within 5 MB
        const approxBytes = dataUrl.length * 0.75;
        if (approxBytes > 5 * 1024 * 1024) {
          return reject(new Error('Resized image exceeds 5 MB limit. Please select a smaller photo.'));
        }

        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for processing.'));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}
