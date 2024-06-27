import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {  // cb is callback only i.e () => {}
      cb(null, './public/temp')   // Directory to store files uploaded by user
    },
    filename: function (req, file, cb) {    // Naming convention for files
      cb(null, file.originalname)
    }
  })
  
 export const upload = multer({ 
    storage,
})