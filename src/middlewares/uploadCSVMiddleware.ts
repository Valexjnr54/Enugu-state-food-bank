// middlewares/uploadCSV.ts
import multer from "multer";

const storage = multer.memoryStorage();

export const uploadCSV = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.csv$/)) {
      return cb(new Error("Only CSV files are allowed"));
    }
    cb(null, true);
  },
}).single("file");
