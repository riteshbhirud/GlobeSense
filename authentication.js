const jwt = require('jsonwebtoken');

function generateAccessToken(user) {
    const payload = {
      username: user.username//,
      //email: user.email
    };
    
    const secret = process.env.JWT_SECRET_KEY;
    const options = { expiresIn: 20 };
  
    return jwt.sign(payload, secret, options);
}

function verifyAccessToken(token) {
    const secret = process.env.JWT_SECRET_KEY;
  
    try {
      const decoded = jwt.verify(token, secret);
      return { success: true, data: decoded };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

function generateRefreshToken(user) {
const payload = {
    username: user.username
    //email: user.email
};

const secret = process.env.REFRESH_SECRET_KEY;
const options = { expiresIn: 60 };

return jwt.sign(payload, secret, options);
}



function verifyRefreshToken(token) {
    const secret = process.env.REFRESH_SECRET_KEY;
  
    try {
      const decoded = jwt.verify(token, secret);
      console.log("DECODED:",decoded)
      return { success: true, data: decoded };
    } catch (error) {
        console.log("UNSUCCESSFUL DECODING")
      return { success: false, error: error.message };
    }
}
  

module.exports = {
    generateAccessToken,
    verifyAccessToken,
    generateRefreshToken,
    verifyRefreshToken
};

