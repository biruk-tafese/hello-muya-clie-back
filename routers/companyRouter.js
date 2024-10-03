const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); 
  }
});

const upload = multer({ storage });

// Define routes
router.post('/register', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'license', maxCount: 3 }]), companyController.addingClient);
router.get("/getCompany",companyController.getCompany)
router.delete("/delete/:id",companyController.deleteCompany)
module.exports = router;
