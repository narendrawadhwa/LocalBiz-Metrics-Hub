const mongoose = require('mongoose');
const BusinessTypeEnum = require('./BusinessTypeEnum');

const userSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String },
  phoneNumber: { type: String },
  businessType: { type: String, enum: Object.values(BusinessTypeEnum), default: BusinessTypeEnum.GENERAL },
  logo: { type: String}, 
  categories: [{ type: String }],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]

});

const User = mongoose.model('User', userSchema);

module.exports = User;
