/**
 * Realistic Mock Data for Serverless Image Optimization & Analysis Platform
 * Used when AWS_CONFIG.USE_MOCK is true for local development and demonstration.
 */

export const INITIAL_MOCK_IMAGES = [
  {
    id: "img-7f89b1c2-901a",
    userId: "user-shagun-01",
    filename: "mountain-summit-hdr.jpg",
    originalName: "mountain-summit-hdr.jpg",
    status: "OPTIMIZED", // PENDING, PROCESSING, OPTIMIZED, FAILED
    uploadedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 17.5).toISOString(),
    rawUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=100",
    processedUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=70",
    dimensions: {
      original: { width: 3840, height: 2160 },
      optimized: { width: 1920, height: 1080 },
    },
    metrics: {
      originalSizeBytes: 4892400, // ~4.66 MB
      optimizedSizeBytes: 712300,  // ~695 KB
      savedBytes: 4180100,
      reductionPercentage: 85.4,
      originalFormat: "JPEG",
      targetFormat: "WEBP",
      processingDurationMs: 840,
    },
    optimizationSettings: {
      format: "WEBP",
      quality: 82,
      resizeMaxDimension: 1920,
      preserveExif: false,
    },
    aiAnalysis: {
      rekognition: {
        labels: [
          { name: "Mountain", confidence: 99.8, category: "Nature" },
          { name: "Snow", confidence: 98.4, category: "Weather" },
          { name: "Outdoors", confidence: 97.9, category: "Environment" },
          { name: "Peak", confidence: 96.2, category: "Nature" },
          { name: "Alpine", confidence: 91.5, category: "Landscape" },
          { name: "Sky", confidence: 89.1, category: "Nature" },
        ],
        model: "Amazon Rekognition Image 2024",
      },
      bedrock: {
        description: "A sweeping, snow-capped alpine mountain peak under a clear azure sky, illuminated by crisp morning sunlight.",
        modelId: "amazon.nova-2-lite-v1:0",
        promptTokens: 142,
        generatedTokens: 28,
      },
    },
  },
  {
    id: "img-3b44e8d1-120f",
    userId: "user-shagun-01",
    filename: "cyberpunk-street-night.png",
    originalName: "cyberpunk-street-night.png",
    status: "OPTIMIZED",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 64.2).toISOString(),
    rawUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=100",
    processedUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=70",
    dimensions: {
      original: { width: 4096, height: 2730 },
      optimized: { width: 2048, height: 1365 },
    },
    metrics: {
      originalSizeBytes: 8420100, // ~8.03 MB (heavy PNG)
      optimizedSizeBytes: 980400,  // ~957 KB (lossy WebP)
      savedBytes: 7439700,
      reductionPercentage: 88.3,
      originalFormat: "PNG",
      targetFormat: "WEBP",
      processingDurationMs: 1120,
    },
    optimizationSettings: {
      format: "WEBP",
      quality: 85,
      resizeMaxDimension: 2048,
      preserveExif: false,
    },
    aiAnalysis: {
      rekognition: {
        labels: [
          { name: "City", confidence: 99.4, category: "Urban" },
          { name: "Neon", confidence: 98.7, category: "Lighting" },
          { name: "Night", confidence: 98.1, category: "Time" },
          { name: "Street", confidence: 95.8, category: "Urban" },
          { name: "Rain", confidence: 84.6, category: "Weather" },
        ],
        model: "Amazon Rekognition Image 2024",
      },
      bedrock: {
        description: "Vibrant neon reflections shimmering on wet asphalt along a bustling futuristic metropolitan avenue at twilight.",
        modelId: "amazon.nova-2-lite-v1:0",
        promptTokens: 130,
        generatedTokens: 24,
      },
    },
  },
  {
    id: "img-9c21a304-45de",
    userId: "user-shagun-01",
    filename: "product-headphone-studio.jpg",
    originalName: "product-headphone-studio.jpg",
    status: "OPTIMIZED",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 179).toISOString(),
    rawUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=100",
    processedUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=70",
    dimensions: {
      original: { width: 3000, height: 2000 },
      optimized: { width: 1500, height: 1000 },
    },
    metrics: {
      originalSizeBytes: 3120000, // ~2.97 MB
      optimizedSizeBytes: 460000,  // ~449 KB
      savedBytes: 2660000,
      reductionPercentage: 85.2,
      originalFormat: "JPEG",
      targetFormat: "JPEG",
      processingDurationMs: 650,
    },
    optimizationSettings: {
      format: "JPEG",
      quality: 80,
      resizeMaxDimension: 1500,
      preserveExif: false,
    },
    aiAnalysis: {
      rekognition: {
        labels: [
          { name: "Headphones", confidence: 99.9, category: "Electronics" },
          { name: "Audio", confidence: 97.4, category: "Technology" },
          { name: "Gadget", confidence: 94.2, category: "Product" },
          { name: "Minimalist", confidence: 88.0, category: "Style" },
        ],
        model: "Amazon Rekognition Image 2024",
      },
      bedrock: {
        description: "Studio product shot of sleek over-ear wireless headphones centered on an unblemished warm backdrop.",
        modelId: "amazon.nova-2-lite-v1:0",
        promptTokens: 125,
        generatedTokens: 21,
      },
    },
  },
  {
    id: "img-5a12d99e-88bc",
    userId: "user-shagun-01",
    filename: "coastal-drone-shot.jpg",
    originalName: "coastal-drone-shot.jpg",
    status: "PROCESSING",
    uploadedAt: new Date(Date.now() - 1000 * 30).toISOString(),
    rawUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    processedUrl: null,
    thumbnailUrl: null,
    dimensions: {
      original: { width: 4000, height: 3000 },
      optimized: null,
    },
    metrics: {
      originalSizeBytes: 5600000,
      optimizedSizeBytes: null,
      savedBytes: null,
      reductionPercentage: null,
      originalFormat: "JPEG",
      targetFormat: "WEBP",
      processingDurationMs: null,
    },
    optimizationSettings: {
      format: "WEBP",
      quality: 80,
      resizeMaxDimension: 2048,
    },
    aiAnalysis: null,
  },
  {
    id: "img-e4129b01-3311",
    userId: "user-shagun-01",
    filename: "corrupt-file-sample.bin",
    originalName: "corrupt-file-sample.jpg",
    status: "FAILED",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    rawUrl: null,
    processedUrl: null,
    thumbnailUrl: null,
    error: "Pillow UnidentifiedImageError: Cannot identify image file. Sent to SQS Dead Letter Queue (DLQ).",
    dimensions: {
      original: { width: 0, height: 0 },
      optimized: null,
    },
    metrics: {
      originalSizeBytes: 124000,
      optimizedSizeBytes: 0,
      savedBytes: 0,
      reductionPercentage: 0,
      originalFormat: "UNKNOWN",
      targetFormat: "WEBP",
      processingDurationMs: null,
    },
    aiAnalysis: null,
  }
];

export const MOCK_USER = {
  id: "user-shagun-01",
  username: "shagun.kimothi",
  email: "shagun@example.com",
  name: "Shagun Kimothi",
  institution: "B.Tech Computer Science",
  role: "Cloud Architect & Developer",
  avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=shagun",
};
