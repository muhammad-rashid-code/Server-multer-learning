import express from "express";
import "dotenv/config";
import morgan from "morgan";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import File from "./models/fileModel.js";

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const { MONGO_URI, PORT } = process.env;

// Ensure the 'uploads' directory exists
const uploadsDir = path.join(__dirname, "uploads");

// Function to create the uploads directory if it doesn't exist
const ensureUploadsDirExists = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true }); // Create the directory recursively
    console.log("Uploads directory created:", uploadsDir);
  }
};

// Call the function to ensure the directory exists
ensureUploadsDirExists();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    ensureUploadsDirExists(); // Ensure the directory exists before saving the file
    cb(null, uploadsDir); // Store files in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Append the file extension
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

app.use(morgan("dev"));
app.use(cors({ origin: "*" })); // Allow all origins (update in production)
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(uploadsDir));

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("===== DB connected =====");
  })
  .catch((error) => {
    console.log("===== DB connection failed =====\n" + error);
  });

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// File upload endpoint
app.post("/profile", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Construct the file URL
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    // Save file info to MongoDB
    const newFile = new File({
      filename: req.file.filename,
      fileUrl: fileUrl,
    });

    await newFile.save();

    res.status(200).json({
      message: "File uploaded successfully",
      fileUrl: fileUrl,
      fileId: newFile._id, // Returning the MongoDB ID of the file
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
