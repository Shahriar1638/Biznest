const verifyAdmin = (userCollection) => {
    return async (req, res, next) => {
      try {
        const email = req.decoded.email;
        const user = await userCollection.findOne({ email });
        
        if (!user || user.role.type !== 'admin') {
          return res.status(403).send({ message: 'Forbidden access: Admin only' });
        }
        
        next();
      } catch (error) {
        res.status(500).send({ message: 'Internal server error during admin verification' });
      }
    };
  };
  
  module.exports = verifyAdmin;
