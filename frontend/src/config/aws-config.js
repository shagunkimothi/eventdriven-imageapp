/**
 * AWS & Backend Configuration
 * 
 * Target AWS architecture configuration.
 * Values can be overridden with Vite environment variables.
 */

export const AWS_CONFIG = {
  // Live API is the normal application path. Mock modules remain available for isolated development.
  USE_MOCK: false,

  // Target AWS Region
  region: import.meta.env.VITE_AWS_REGION || 'ap-south-1',

  // Amazon Cognito User Pool Configuration
  cognito: {
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'ap-south-1_Y7ZjWvE1e',
    clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '6cv9heljeq63h9hdbvc6car5o',
  },

  // Amazon API Gateway Endpoint
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://pj8prscl4l.execute-api.ap-south-1.amazonaws.com/Prod',
  },

  // Amazon S3 Storage Configuration
  storage: {
    rawBucket: import.meta.env.VITE_S3_RAW_BUCKET || 'serverless-raw-images',
    processedBucket: import.meta.env.VITE_S3_PROCESSED_BUCKET || 'serverless-optimized-images',
    cloudFrontDomain: import.meta.env.VITE_CLOUDFRONT_DOMAIN || '',
  },
};
