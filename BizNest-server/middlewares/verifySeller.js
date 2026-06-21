const verifySeller = (userCollection) => {
    return async (req, res, next) => {
      try {
        const email = req.decoded.email;
        const user = await userCollection.findOne({ email });
        
        if (!user || user.role.type !== 'seller') {
          return res.status(403).send({ message: 'Forbidden access: Seller only' });
        }
        
        next();
      } catch (error) {
        res.status(500).send({ message: 'Internal server error during seller verification' });
      }
    };
  };
  
  module.exports = verifySeller;
