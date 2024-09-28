

export const verifyAPIKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key']; 
    const adminApiKey = process.env.ADMIN_API_KEY; 
  
    if (!apiKey) {
      return res.status(403).json({ message: "API key is required" });
    }
  
    if (apiKey !== adminApiKey) {
      return res.status(403).json({ message: "Invalid API key" });
    }
  
    next(); // Proceed if API key is valid
  };
  