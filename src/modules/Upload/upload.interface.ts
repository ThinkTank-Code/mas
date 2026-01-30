export interface IUploadResult {
    url: string;
    publicId: string;
    fileName: string;
    format: string;
    width: number;
    height: number;
    size: number;
    uploadedAt: Date;
}

export interface IMultipleUploadResult {
    files: IUploadResult[];
    totalFiles: number;
}
