import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer Token

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
};

const authorizeSeller = (req, res, next) => {
    if (req.user.role !== "seller") {
        return res.status(403).json({ success: false, message: "Forbidden: Sellers only" });
    }
    next();
};
const authorizeBuyer = (req, res, next) => {
    if (req.user.role !== "buyer") {
        return res.status(403).json({ success: false, message: "Forbidden: Buyers only" });
    }
    next();
};

export { authenticate, authorizeSeller, authorizeBuyer };
