import { useState } from 'react';
import axios from 'axios';
import { Upload, Download, File as FileIcon } from 'lucide-react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('File uploaded successfully.');
      console.log(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      const response = await axios.get('/api/download', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'downloaded-file.txt');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('File download failed.');
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          File Upload and Download
        </h1>

        {/* File Upload Section */}
        <div className="mb-8 space-y-6">
          <div className="relative">
            <label 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
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
                onChange={handleFileChange}
              />
            </label>
          </div>

          {file && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <FileIcon className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-blue-700 font-medium">
                {file.name}
              </span>
              <span className="text-xs text-blue-500">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium
              ${!file || uploading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'} 
              transition-colors`}
          >
            <Upload className="w-5 h-5" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* File Download Section */}
        <div>
          <button
            onClick={handleDownload}
            disabled={downloadLoading}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium
              ${downloadLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 active:bg-green-700'} 
              transition-colors`}
          >
            <Download className="w-5 h-5" />
            {downloadLoading ? 'Downloading...' : 'Download File'}
          </button>
        </div>
      </div>
    </div>
  );
}