import React from 'react';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-6 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span className="text-slate-400 font-medium">Serverless Image Optimization & Analysis</span>
          <span className="hidden sm:inline text-slate-600"> — S3 • SQS • Lambda • DynamoDB • Rekognition • Bedrock</span>
        </div>
        <div>
          <span>B.Tech Capstone Project • Shagun Kimothi</span>
        </div>
      </div>
    </footer>
  );
};
