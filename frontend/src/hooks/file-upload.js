import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../src/firebase/image';
import { toast } from 'sonner';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file, path) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      toast(`Uploading ${file.name}...`, { duration: 3000 });
      setProgress(0);

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storagePath = `${path}/${fileName}`;
      const storageRef = ref(storage, storagePath);

      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate progress
          const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(prog));
        },
        (error) => {
          console.error('Upload error:', error);
          setUploading(false);
          setProgress(0);
          reject(error);
        },
        async () => {
          try {
            // Get download URL
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            
            setUploading(false);
            setProgress(100);

            resolve({
              url: downloadUrl,
              originalName: file.name,
              fileName: fileName,
              storagePath: storagePath,
              size: file.size,
              type: file.type
            });
          } catch (error) {
            setUploading(false);
            setProgress(0);
            reject(error);
          }
        }
      );
    });
  };

  return { uploadFile, uploading, progress };
};