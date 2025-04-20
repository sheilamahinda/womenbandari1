const fs = require("fs");
const path = require("path");
const cloudinary = require("../../cloudinary.config");
const recordingsModel = require("../../models/recordings");

const controlAddRecording = async (req, res) => {
  try {
    const localFilePath = path.join(__dirname, "../../public/uploads", req.file.filename);

    // Upload video to Cloudinary
    const cloudUpload = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "video",
      folder: "recordings",
    });

    const recordingData = {
      title: req.body.title,
      file: {
        data: fs.readFileSync(localFilePath), // optional: only if you need buffer
        name: req.file.originalname,
        cloudinaryName: cloudUpload.secure_url,
        mimetype: req.file.mimetype,
        filename: req.file.filename,
      },
    };

    const newRecording = new recordingsModel(recordingData);
    await newRecording.save();

    // Optional: delete local file after successful upload
    fs.unlinkSync(localFilePath);

    return res.status(200).json({
      message: "Recording uploaded successfully",
      success: true,
      recording: newRecording,
    });
  } catch (error) {
    console.error("Error uploading recording:", error.message);
    return res.status(500).json({
      message: "Error uploading recording",
      success: false,
    });
  }
};

module.exports = controlAddRecording;



// const recordingsModel = require("../../models/recordings");

// const controlAddRecording = async (req, res) => {
//   try {
//     const { title } = req.body;
//     const file = req.file;

//     if (!file) {
//       return res.status(400).json({ message: "No video file uploaded!" });
//     }

//     // Save video metadata and file path to MongoDB
//     const newRecording = new recordingsModel({
//       title,
//       file: {
//         filename: req.savedFileName,
//         data: file.path, // or store the URL if using cloud storage
//         name: file.originalname,
      
//         mimetype: file.mimetype,
//       },
//     });

//     await newRecording.save();
//     const recordings = await recordingsModel.find({}).sort({ createdAt: -1 });

//     return res.status(201).json({
//       success: true,
//       message: "Video uploaded successfully!",
//       recordings,
//     });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Failed to upload video." });
//   }
// };

// module.exports = controlAddRecording;
