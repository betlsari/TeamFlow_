const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const labelController = require("../controllers/labelController");

router.use(authMiddleware);

router.delete("/:id", labelController.deleteLabel);

module.exports = router;