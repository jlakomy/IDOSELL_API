const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId: { type: Number, unique: true, index: true },
  worth: Number,

  products: [
    {
      productId: Number,
      quantity: Number
    }
  ],

  status: String,

  changeDate: { type: Date, required: true },

  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);
