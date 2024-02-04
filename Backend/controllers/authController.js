const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BlacklistToken = require('../models/BlacklistToken');

//Sign Up or Register Controller
exports.signup = async (req, res) => {
  try {
    const {
      businessName,
      username,
      email,
      password,
      address,
      phoneNumber,
    } = req.body;

    const newUser = new User({
      businessName,
      username,
      email,
      //Hashing password before adding it to Database
      password: await bcrypt.hash(password, 10),
      address,
      phoneNumber,
    });

    await newUser.save();

    res.json({ message: 'User registered successfully' });
    
  } catch (error) {
    if (error.name === 'ValidationError' && error.errors) {
      // Check if the error is related to same email or username
      if (error.errors.email && error.errors.email.kind === 'unique') {
        return res.status(400).json({ message: 'Email already exists.' });
      } 
      else if (error.errors.username && error.errors.username.kind === 'unique') {
        return res.status(400).json({ message: 'Username already exists.' });
      }
    }
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: { $regex: new RegExp("^" + email.toLowerCase(), "i") } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Setting the token used for authorization with expiry of 1 hour
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.header('Authorization', `Bearer ${token}`).json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Updating the info like business info and other user info
exports.updateInfo = async (req, res) => {
  try {
    const {businessName, username, email, address, phoneNumber, businessType } = req.body;

    // If the user is not defined
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user._id);

    user.businessName = businessName || user.businessName;
    user.businessType = businessType || user.businessType
    user.username = username || user.username;
    user.email = email || user.email;
    user.address = address || user.address;
    user.phoneNumber = phoneNumber || user.phoneNumber;

    await user.save();

    res.json({ message: 'User information updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Logout by deleting the token from header 
exports.logout = async (req, res) => {
  try {
    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({ message: 'Access Denied' });
    }

    const tokenValue = token.replace('Bearer ', '');

    // Check if the token is already blacklisted
    const isTokenBlacklisted = await BlacklistToken.exists({ token: tokenValue });

    if (isTokenBlacklisted) {
      return res.status(401).json({ message: 'Token already blacklisted' });
    }
    // Adding the token in blacklist for further security
    await BlacklistToken.create({ token: tokenValue });

    res.removeHeader('Authorization');

    res.json({ message: 'Logout successful' });
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};