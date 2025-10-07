// // routes/uploads.js
// import express from "express";
// import multer from "multer";
// import  storage  from "../firebase/image";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// router.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, error: "No file provided" });
//     }

//     const file = req.file;
//     const timestamp = Date.now();
//     const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
//     const fileName = `${timestamp}_${sanitizedFileName}`;
//     const storageRef = ref(storage, `Wireframe_To_Code/${fileName}`);

//     // Upload file
//     const snapshot = await uploadBytes(storageRef, file.buffer, {
//       contentType: file.mimetype,
//     });

//     // Get download URL
//     const downloadUrl = await getDownloadURL(storageRef);

//     res.json({
//       success: true,
//       data: {
//         url: downloadUrl,
//         originalName: file.originalname,
//         fileName: fileName,
//         storagePath: `Wireframe_To_Code/${fileName}`,
//         size: file.size,
//         type: file.mimetype,
//       },
//     });
//   } catch (error) {
//     console.error("Upload error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// export default router;