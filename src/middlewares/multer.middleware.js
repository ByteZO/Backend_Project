import multer from "multer";

// this is a storge method middleware to seve the file in temp and also changing it's name in filename config all this in this method and it's helps in file uplaod !!! down there is it's config ....
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});

export const upload = multer({ storage: storage });
