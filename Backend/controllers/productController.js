const Product = require('../models/Product');
const User = require('../models/User');

// Create the product with the product details
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      price,
      quantity,
    } = req.body;

    const ownerId = req.user._id;

    // Checking if the product with the same details already exists for the user
    const existingProduct = await Product.findOne({
      name,
      category,
      description,
      price,
      quantity,
      ownerId,
    });

    if (existingProduct) {
      return res.status(400).json({ error: 'Product already added' });
    }

    // Create a new product if it doesn't already exist
    const newProduct = new Product({
      name,
      category,
      description,
      price,
      quantity,
      ownerId,
    });

    await newProduct.save();

    await User.findByIdAndUpdate(ownerId, {
      $addToSet: { categories: category },
      $push: { products: newProduct._id },
    });

    res.json({ message: 'Product created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

//Displaying all the products created by user
exports.getUserProducts = async (req, res) => {
  try {
    const userProducts = await Product.find({ ownerId: req.user._id });

    const productCount = userProducts.length;

    if (productCount === 0) {
      return res.json({ message: 'No products added till now' });
    } else if(productCount >=1){
    res.json({ products: userProducts, count: productCount });  
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete the product after checking the ownerId of owner who created that product using the productId
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const ownerId = req.user._id;

    const product = await Product.findOneAndDelete({ _id: productId, ownerId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await User.findByIdAndUpdate(ownerId, { $pull: { products: productId } });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update the product info after checking the ownerId of owner who created that product using the productId
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const ownerId = req.user._id;

    const {
      name,
      category,
      description,
      price,
      quantity,
    } = req.body;

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, ownerId },
      { name, category, description, price, quantity },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};