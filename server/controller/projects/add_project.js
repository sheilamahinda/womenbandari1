const fs = require("fs");
const path = require("path");
const cloudinary = require("../../cloudinary.config.js");
const resourcesModel = require("../../models/resources.js");

const controlAddProject = async (req, res) => {
  try {
    const localFilePath = path.join(__dirname, "../../public/uploads", req.file.filename);

    // Upload to Cloudinary
    const cloudUpload = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "raw", // because it's a PDF
      folder: "pdf_resources",
    });

    const uploadedFile = {
      data: fs.readFileSync(localFilePath),
      name: req.file.originalname,
      cloudinaryName: cloudUpload.secure_url,
      ContentType: req.file.mimetype,
    };

    const newProject = new resourcesModel({
      title: req.body.title,
      subtitle: req.body.subtitle,
      instructor: req.body.instructor,
      file: uploadedFile,
    });

    await newProject.save();

    // Optional: delete local file after upload
    fs.unlinkSync(localFilePath);

    const resources = await resourcesModel.find({});

    return res.status(200).json({
      message: "File uploaded successfully",
      success: true,
      resources,
    });
  } catch (error) {
    console.error("Error while uploading the file:", error.message);
    return res.status(500).json({
      message: "Error uploading the file",
      success: false,
    });
  }
};

module.exports = controlAddProject;



// const fs = require("fs");
// const path = require("path");
// const resourcesModel = require("../../models/resources.js");

// const controlAddProject = async (req, res) => {
//   try {
//     const uploadedFile = {
//       data: fs.readFileSync(
//         path.join(__dirname, "../../public/uploads", req.file.filename)
//       ),
//       name: req.file.filename,
//       contentType: req.file.mimetype,
//     };

//     const newProject = new resourcesModel({
//       title: req.body.title,
//       subtitle: req.body.subtitle,
//       instructor: req.body.instructor,
//       file: uploadedFile,
//     });

//     await newProject.save();

//     const resources = await resourcesModel.find({});

//     return res.status(200).json({
//       message: "File uploaded successfully",
//       success: true,
//       resources,
//     });
//   } catch (error) {
//     console.error("Error while uploading the file:", error.message);
//     return res.status(500).json({
//       message: "Error uploading the file",
//       success: false,
//     });
//   }
// };

// module.exports = controlAddProject;
