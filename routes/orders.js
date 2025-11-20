const express = require("express");
const router = express.Router();

const { syncOrders, getOrderById, getOrdersCSV } = require("../controllers/ordersController");


router.post("/sync", syncOrders);
router.get("/csv", getOrdersCSV);
router.get("/:id", getOrderById);
module.exports = router;
