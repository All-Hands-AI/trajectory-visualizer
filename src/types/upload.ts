// Types for uploaded content

export interface JsonlUploadContent {
  jsonlContent: string;
  fileType: 'jsonl';
}

export interface TrajectoryUploadContent {
  trajectoryData: any; // This could be more specific based on your trajectory format
  fileType: 'trajectory';
  trajectory?: any; // For backward compatibility
}

export type UploadContent = {
  content: JsonlUploadContent | TrajectoryUploadContent;
};