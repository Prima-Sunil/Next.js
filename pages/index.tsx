/* eslint-disable @typescript-eslint/no-unused-vars */
import React  ,{ useRef,useState } from "react";
import axios, { AxiosError } from "axios";
import { Upload, Download, File as FileIcon ,Folder} from "lucide-react";

interface FileState {
  file: File | null;
  folder?:FileList | null;
  preview?: string;
  uploadProgress: number;
  type: 'file' | 'folder';
}

interface UploadResponse {
  success: boolean;
  message: string;
  url?: string;   
  urls?: string[];
}


// const UploadArea = ({
//   onFileSelect,
// }: {
//   onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
// }) => (
//   <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
//     <div className="flex flex-col items-center justify-center pt-5 pb-6">
//       <Upload className="w-10 h-10 mb-3 text-gray-400" />
//       <p className="mb-2 text-sm text-gray-500">
//         <span className="font-semibold">Click to upload</span> or drag and drop
//       </p>
//       <p className="text-xs text-gray-500">Any file type (MAX. 10MB)</p>
//     </div>
//     <input
//       type="file"
//       className="hidden"
//       onChange={onFileSelect}
//       accept="*/*"
//     />
//   </label>
// );

// const FilePreview = ({ file }: { file: File }) => (
//   <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
//     <FileIcon className="w-5 h-5 text-blue-500" />
//     <span className="text-sm text-blue-700 font-medium">{file.name}</span>
//     <span className="text-xs text-blue-500">
//       ({(file.size / 1024 / 1024).toFixed(2)} MB)
//     </span>
//   </div>
// );

export default function FileUploadDownload() {
  const [fileState, setFileState] = useState<FileState>({
    file: null,
    folder: null,
    uploadProgress: 0,
    type: 'file',
  });
  const [isLoading, setIsLoading] = useState({
    upload: false,
    download: false,
  });
  const folderInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFileState({
        file: e.target.files[0],
        folder: null,
        uploadProgress: 0,
        type: 'file',
      });
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileState({
        file: null,
        folder: e.target.files,
        uploadProgress: 0,
        type: 'folder'
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
    if (!fileState.file && !fileState.folder) {
      return;
    }
  
    setIsLoading((prev) => ({ ...prev, upload: true }));
    const formData = new FormData();
    // formData.append('file', fileState.file);
  
    try {
      if (fileState.type === 'file' && fileState.file) {
        // Single file upload to S3
        formData.append('file', fileState.file);
        const response = await axios.post('/api/upload-file', formData, {
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
          console.log('File URL:', response.data.url);
        }
      } else if (fileState.type === 'folder' && fileState.folder) {
        // Folder upload to S3 with multiple files
        Array.from(fileState.folder).forEach((file, index) => {
          formData.append('files', file, file.webkitRelativePath || file.name);
        });

        const response = await axios.post('/api/upload-folder', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setFileState((prev) => ({ ...prev, uploadProgress: progress }));
          },
        });

        if (response.data.success) {
          alert(`Folder uploaded successfully! ${response.data.urls?.length} files uploaded.`);
          console.log('Uploaded File URLs:', response.data.urls);
        }
      }

      // Reset state after successful upload
      setFileState({ file: null, folder: null, uploadProgress: 0, type: 'file' });
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
  const triggerFolderInput = () => {
    folderInputRef.current?.click();
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          File and Folder Upload
        </h1>

        <div className="mb-8 space-y-6">
          <div className="flex gap-4">
            <label 
              className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => setFileState(prev => ({ ...prev, type: 'file' }))}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileIcon className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Upload File</span>
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="*/*"
              />
            </label>

            <label 
              className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={triggerFolderInput}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Folder className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Upload Folder</span>
                </p>
              </div>
              <input
                type="file"
                ref={folderInputRef}
                className="hidden"
                onChange={handleFolderChange}
                multiple
                data-webkitdirectory
                // directory
              />
            </label>
          </div>

          {fileState.file && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <FileIcon className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-blue-700 font-medium">{fileState.file.name}</span>
              <span className="text-xs text-blue-500">
                ({(fileState.file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}

          {fileState.folder && (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Folder className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-700 font-medium">
                {fileState.folder.length} file(s) selected
              </span>
            </div>
          )}
{/* no change */}
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
            disabled={(!fileState.file && !fileState.folder) || isLoading.upload}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium
              ${
                (!fileState.file && !fileState.folder)|| isLoading.upload
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
              } 
              transition-colors`}
          >
            <Upload className="w-5 h-5" />
            {isLoading.upload
              ? `Uploading ${fileState.uploadProgress}%`
              : `Upload ${fileState.type === 'file' ? 'File' : 'Folder'}`}
          </button>
        </div>


{/* nochange */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

     
         {/* dowanload button */}
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
