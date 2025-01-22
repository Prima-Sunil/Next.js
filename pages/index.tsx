/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { Upload, Download, File as FileIcon } from "lucide-react";

interface FileState {
  file: File | null;
  preview?: string;
  uploadProgress: number;
}

interface UploadResponse {
  success: boolean;
  message: string;
  url?: string;
}
const UploadArea = ({
  onFileSelect,
}: {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
    <div className="flex flex-col items-center justify-center pt-5 pb-6">
      <Upload className="w-10 h-10 mb-3 text-gray-400" />
      <p className="mb-2 text-sm text-gray-500">
        <span className="font-semibold">Click to upload</span> or drag and drop
      </p>
      <p className="text-xs text-gray-500">Any file type (MAX. 10MB)</p>
    </div>
    <input
      type="file"
      className="hidden"
      onChange={onFileSelect}
      accept="*/*"
    />
  </label>
);

const FilePreview = ({ file }: { file: File }) => (
  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
    <FileIcon className="w-5 h-5 text-blue-500" />
    <span className="text-sm text-blue-700 font-medium">{file.name}</span>
    <span className="text-xs text-blue-500">
      ({(file.size / 1024 / 1024).toFixed(2)} MB)
    </span>
  </div>
);

export default function FileUploadDownload() {
  const [fileState, setFileState] = useState<FileState>({
    file: null,
    uploadProgress: 0,
  });
  const [isLoading, setIsLoading] = useState({
    upload: false,
    download: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFileState({
        file: e.target.files[0],
        uploadProgress: 0,
      });
    }
  };

  // const handleUpload = async () => {
  //   if (!fileState.file) {
  //     return;
  //   }

  //   setIsLoading((prev) => ({ ...prev, upload: true }));
  //   const formData = new FormData();
  //   formData.append("file", fileState.file);

  //   try {
  //     const response = await axios.post<UploadResponse>(
  //       "/api/upload",
  //       formData,
  //       {
  //         headers: { "Content-Type": "multipart/form-data" },
  //         onUploadProgress: (progressEvent) => {
  //           const progress = progressEvent.total
  //             ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
  //             : 0;
  //           setFileState((prev) => ({ ...prev, uploadProgress: progress }));
  //         },
  //       }
  //     );

  //     if (response.data.success) {
  //       alert("File uploaded successfully!");
  //       setFileState({ file: null, uploadProgress: 0 });
  //     }
  //   } catch (error) {
  //     const errorMessage =
  //       error instanceof AxiosError
  //         ? error.response?.data?.message || "Upload failed"
  //         : "An unexpected error occurred";
  //     alert(errorMessage);
  //   } finally {
  //     setIsLoading((prev) => ({ ...prev, upload: false }));
  //   }
  // };



  const handleUpload = async () => {
    if (!fileState.file) {
      return;
    }
  
    setIsLoading((prev) => ({ ...prev, upload: true }));
    const formData = new FormData();
    formData.append('file', fileState.file);
  
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setFileState((prev) => ({ ...prev, uploadProgress: progress }));
        },
      });
  
      if (response.data.success) {
        alert('File uploaded successfully!');
        console.log('File URL:', response.data.url); // S3 File URL
        setFileState({ file: null, uploadProgress: 0 });
      }
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || 'Upload failed'
          : 'An unexpected error occurred';
      alert(errorMessage);
    } finally {
      setIsLoading((prev) => ({ ...prev, upload: false }));
    }
  };

  
  const handleDownload = async () => {
    setIsLoading((prev) => ({ ...prev, download: true }));

    try {
      const response = await axios.get("/api/download", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "dowanloaded_file");
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Download failed"
          : "An unexpected error occurred";
      alert(errorMessage);
    } finally {
      setIsLoading((prev) => ({ ...prev, download: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          File Upload and Download
        </h1>

        <div className="mb-8 space-y-6">
          <UploadArea onFileSelect={handleFileChange} />

          {fileState.file && <FilePreview file={fileState.file} />}

          {fileState.uploadProgress > 0 && fileState.uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${fileState.uploadProgress}%` }}
              />
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!fileState.file || isLoading.upload}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium
              ${
                !fileState.file || isLoading.upload
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
              } 
              transition-colors`}
          >
            <Upload className="w-5 h-5" />
            {isLoading.upload
              ? `Uploading ${fileState.uploadProgress}%`
              : "Upload File"}
          </button>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={isLoading.download}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium
            ${
              isLoading.download
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 active:bg-green-700"
            } 
            transition-colors`}
        >
          <Download className="w-5 h-5" />
          {isLoading.download ? "Downloading..." : "Download File"}
        </button>
      </div>
    </div>
  );
}
