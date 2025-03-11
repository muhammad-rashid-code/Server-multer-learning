import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt`
);

const File = mongoose.model("File", fileSchema);

export default File;
