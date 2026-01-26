import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'test_secret';

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (token) {
            let decodedData;

            decodedData = jwt.verify(token, secret);

            req.userId = decodedData?.id;
            req.userRole = decodedData?.role;
        } else {
            return res.status(401).json({ message: "No token provided." });
        }

        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Invalid token." });
    }
}

export default auth;
