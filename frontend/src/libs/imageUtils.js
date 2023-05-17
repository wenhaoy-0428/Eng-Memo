export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    /**
     * image.onload is an event handler in JavaScript that is triggered when an image has finished loading.
     * It is a property of the Image object and allows you to specify a function to be executed once the image is
     * fully loaded.
     */
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
  });

/**
 * A function to get cropped image within provided dimension.
 * This function assumes the croppedArea is a square
 * @param {*} imageSrc: The url of original image selected.
 * @param {*} croppedAreaPixels: The square area to crop.
 * @param {*} size: The final dimension of the cropped image.
 * @returns A cropped image with provided dimension.
 * @link Reference: https://codesandbox.io/s/react-easy-crop-demo-with-cropped-output-forked-qt9dqq?file=/src/cropImage.js:2545-2550
 */
export async function getCroppedImg(imageSrc, croppedAreaPixels, size) {
  /**
   * Canvas is a common approach to crop image as
   * 1. it allows you to draw and manipulate images pixel by pixel.
   * 2. it has better performance since canvas operations are generally performed in the GPU
   * 3. canvas is supported on almost all browsers
   */
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  // create image object from image url
  const image = await createImage(imageSrc);
  // setup canvas to be the final size
  canvas.width = size;
  canvas.height = size;

  // draw the cropped region onto the canvas and scale it
  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    size,
    size
  );

  // convert the canvas to image.
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to crop image"));
        return;
      }
      resolve(blob);
    }, "image/jpeg");
  });
}
