const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dyxyw5ez5",
  api_key: "231118471317322",
  api_secret: "-wmYLgMtnmQXRJ0e7AeUIExV_tc",
});

async function upload() {
  try {
    const result = await cloudinary.uploader.upload(
      "D:/DADN/Anh/NguyenVuQuocAn_UIA.jpg",
      {
        folder: "stranger",
      },
    );

    console.log(result.public_id);
    console.log(result.secure_url);
  } catch (err) {
    console.log(err);
  }
}

upload();
