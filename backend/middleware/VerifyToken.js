import jwt from "jsonwebtoken";
import config from "../config/Database.js";
import db from "../db/index.js";


export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, config.secrets.accessTokenSecret, async(err, decoded) => {
    if (err) return res.sendStatus(403);
    
    // decoded contains username and email, not userId
    const { username, email } = decoded;

    console.log("useraname, email", decoded)

    const users = await db.query(`SELECT id FROM users WHERE username = ? AND email = ?`, [
      username, email
    ]);

    if(users.length==0){
      return res.sendStatus(403); // User not found
    }


    const userId = users[0][0].id; // Assuming id is present in results

    req.userId = userId; // Add userId to the request object
    next();


  });
};