const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
