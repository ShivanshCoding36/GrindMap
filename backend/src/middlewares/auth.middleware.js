import jwt from "jsonwebtoken";
import { AppError, ERROR_CODES } from "../utils/appError.js";

export const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id };

      next();
    } catch (error) {
      return next(new AppError("Not authorized, token failed", 401, ERROR_CODES.INVALID_TOKEN));
    }
  } else {
    return next(new AppError("Not authorized, no token", 401, ERROR_CODES.INVALID_TOKEN));
  }
};
