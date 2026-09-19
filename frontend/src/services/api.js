import { AWS_CONFIG } from '../config/aws-config';

const parseResponse = async (response) => {
  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event('auth:expired'));
      throw new Error('Please log in again');
    }
    const message = data?.error || data?.message || response.statusText;
    throw new Error(`API request failed (${response.status}): ${message}`);
  }

  return data;
};

const authenticatedFetch = (url, options = {}) => {
  const token = localStorage.getItem('opticloud_token');
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, { ...options, headers });
};

const normalizeLabels = (labels) => {
  let parsedLabels = labels;
  if (typeof labels === 'string') {
    try {
      parsedLabels = JSON.parse(labels);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsedLabels)) return [];

  return parsedLabels.map((label) => ({
    ...label,
    confidence: Number(label.confidence ?? 0),
  }));
};

const normalizeOutputFormat = (format) => {
  const normalized = String(format || '').toLowerCase().trim();
  if (normalized === 'jpg') return 'jpeg';
  return ['jpeg', 'png', 'webp'].includes(normalized) ? normalized : null;
};

export const normalizeImage = (item) => {
  const labels = normalizeLabels(item.RekognitionLabels ?? item.rekognitionLabels);
  const status = item.ProcessingStatus || item.processingStatus || 'PENDING';
  const originalSize = Number(item.OriginalSize ?? item.originalSize ?? 0);
  const optimizedSize = Number(item.OptimizedSize ?? item.optimizedSize ?? 0);
  const reduction = Number(item.SizeReductionPercent ?? item.sizeReductionPercent ?? 0);
  const originalFileName = item.OriginalFileName ?? item.originalFileName ?? item.filename;
  const aiCaption = item.AiCaption ?? item.aiCaption ?? null;

  return {
    id: item.ImageId ?? item.imageId ?? item.id,
    filename: originalFileName,
    originalFileName,
    processedFileName: item.ProcessedFileName ?? item.processedFileName ?? null,
    sourceBucket: item.SourceBucket ?? item.sourceBucket ?? null,
    destinationBucket: item.DestinationBucket ?? item.destinationBucket ?? null,
    originalSize,
    optimizedSize,
    sizeReductionPercent: reduction,
    outputFormat: normalizeOutputFormat(item.OutputFormat ?? item.outputFormat),
    quality: Number(item.Quality ?? item.quality ?? 0),
    maxDimension: Number(item.MaxDimension ?? item.maxDimension ?? 0),
    rekognitionLabels: labels,
    aiCaption,
    processingStatus: status,
    uploadTimestamp: item.UploadTimestamp ?? item.uploadTimestamp ?? null,
    originalUrl: item.OriginalImageUrl ?? null,
    processedUrl: item.ProcessedImageUrl ?? null,
    status,
    uploadedAt: item.UploadTimestamp ?? item.uploadTimestamp ?? null,
    metrics: {
      originalSizeBytes: originalSize,
      optimizedSizeBytes: optimizedSize,
      reductionPercentage: reduction,
      savedBytes: Math.max(originalSize - optimizedSize, 0),
    },
    aiAnalysis: {
      rekognition: { labels },
      bedrock: { description: aiCaption },
    },
  };
};

const getImageItems = (data) => {
  if (Array.isArray(data)) return data;
  return data?.Items || data?.items || data?.images || [];
};

export const fetchUserImages = async () => {
  const response = await authenticatedFetch(`${AWS_CONFIG.api.baseUrl}/images`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await parseResponse(response);
  return getImageItems(data).map(normalizeImage);
};

export const getImageDetails = async (imageId) => {
  if (!imageId) throw new Error('Image not found');
  const images = await fetchUserImages();
  const image = images.find((item) => String(item.id) === String(imageId));
  if (!image) throw new Error('Image not found');
  return image;
};

export const requestPresignedUrl = async (file, settings) => {
  const params = new URLSearchParams({
    file_name: file.name,
    output_format: settings.format.toLowerCase(),
    quality: String(settings.quality),
    max_dimension: String(settings.resizeMaxDimension),
  });
  const response = await authenticatedFetch(
    `${AWS_CONFIG.api.baseUrl}/presign?${params.toString()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );
  const data = await parseResponse(response);

  if (!data?.upload_url || !data?.file_name) {
    throw new Error('Presign response did not include upload_url and file_name');
  }

  return {
    uploadUrl: data.upload_url,
    fileName: data.file_name,
  };
};

export const deleteImage = async (imageId) => {
  const response = await authenticatedFetch(`${AWS_CONFIG.api.baseUrl}/images/${encodeURIComponent(imageId)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  return parseResponse(response);
};

export const waitForProcessing = async (fileName, {
  intervalMs = 4000,
  timeoutMs = 120000,
  onStatus,
} = {}) => {
  const deadline = Date.now() + timeoutMs;
  let lastStatus = 'PROCESSING';

  while (Date.now() < deadline) {
    const images = await fetchUserImages();
    const image = images.find((item) =>
      item.originalFileName === fileName || item.filename === fileName
    );

    if (image) {
      lastStatus = image.processingStatus;
      if (onStatus) onStatus(lastStatus);
      if (lastStatus === 'COMPLETED' || lastStatus === 'FAILED') return image;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Processing timed out. Last known status: ${lastStatus}`);
};
