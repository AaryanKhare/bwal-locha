// import multer from 'multer';

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './public/temp')
//     },
//     filename: function (req, file, cb) {
//         //todo - for users 
//         //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//       cb(null, file.originalname)
//     }
//   })
  
// export const upload = multer({ storage: storage })

import multer from "multer";
import fs from "fs"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        const path = "./public/temp"
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true })
        }
        return cb(null, path)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

// Create the multer instance
export const upload = multer({ storage: storage });