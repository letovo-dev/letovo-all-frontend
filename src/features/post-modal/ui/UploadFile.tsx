import React, { useCallback } from 'react';

const UploadFile = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setFile(event.target.files ? event.target.files[0] : null);
    setStatus('');
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus('Please select a file');
      return;
    }

    setIsUploading(true);
    setStatus('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost/upload/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer 5261aa7439b988c0f93d38f676e3bfd2a070ddd64bf174282f37cfa3348320e9',
        },
        body: formData,
        // Note: rejectUnauthorized is not directly supported in browser fetch
        // You may need to handle SSL verification on the server side
      });

      const data = await response.json();
      if (response.ok) {
        setStatus(`Upload successful: ${JSON.stringify(data)}`);
      } else {
        setStatus(`Upload failed: ${response.status} ${JSON.stringify(data)}`);
      }
    } catch (error) {
      setStatus(`Request failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container">
      <h2>File Upload</h2>
      <input type="file" onChange={handleFileChange} disabled={isUploading} />
      <button onClick={handleUpload} disabled={isUploading || !file}>
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
      {status && (
        <div className={`status ${status.includes('failed') ? 'error' : 'success'}`}>{status}</div>
      )}
    </div>
  );
};

export default UploadFile;
