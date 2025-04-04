import jwt from "jsonwebtoken";
const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    const decode =  jwt.verify(token, process.env.SECRET_KEY);
    if (!decode) {
      //invalid token
      return res.status(401).json({
        success: false,
        message: "invalid token",
      });
    }
    req.id = decode.userId;
    next();
  } catch (error) {
    console.log(error);
  }
};
export default isAuthenticated