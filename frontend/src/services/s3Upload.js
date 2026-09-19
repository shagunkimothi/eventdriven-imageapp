/**
 * Upload binary file directly to S3 via Presigned PUT URL with progress tracking
 */
export const uploadFileToS3 = (file, presignedUrl, settings, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presignedUrl, true);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("x-amz-meta-output-format", settings.format.toLowerCase());
    xhr.setRequestHeader("x-amz-meta-quality", String(settings.quality));
    xhr.setRequestHeader("x-amz-meta-max-dimension", String(settings.resizeMaxDimension));

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ status: xhr.status });
      } else {
        reject(new Error(`S3 upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during S3 upload. Check S3 CORS configuration."));
    };

    xhr.send(file);
  });
};
