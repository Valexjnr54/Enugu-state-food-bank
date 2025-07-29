import multer from "multer";

const storage = multer.diskStorage({
    destination: function (request, response, callback) {
        callback(null, './public/uploads/');
    },
    filename: function (request, file, callback) {
        callback(null, Date.now() + '-' + file.originalname);
    }
});

export const upload = multer({ storage });

// Allow unlimited images under the field name 'galleries'
export const galleries = upload.array('galleries');
