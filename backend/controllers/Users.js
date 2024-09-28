import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db/index.js";

import config from "../config/Database.js";

export const getUsers = async (req, res) => {
  try {
    const users = await db.query(`SELECT * FROM users`);
    res.json(users[0]);
  } catch (error) {
    console.log(error);
  }
};

export const getUser = async (req, res) => {
  try {
    const users = await db.query(`SELECT * FROM users WHERE id = ?`, [
      req.userId,
    ]);

    res.json(users[0]);
  } catch (error) {
    console.log(error);
  }
};


export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  var role = "USER"
  if(req.body.role=="USER" || req.body.role=="ADMIN" ){
    role = req.body.role
  }else{
    res.status(400).json({ success: false, message:"Invalid role" });
  }
  const checkIfUserExist = `SELECT * FROM users WHERE username = ?`;
  const checkValues = [username];
  const checkIfUserExistResponse = await db.query(
    checkIfUserExist,
    checkValues
  );

  if (checkIfUserExistResponse[0].length > 0) {
    const message = "UserName already exists";
    res.status(201).json({ success: false, message });
  } else {
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    try {
      const registerUserQuery = `
    INSERT INTO users (username, email, password, role)
    VALUES ?
    `;

      const response = await db.query(registerUserQuery, [
        [[username, email, hashPassword, role]],
      ]);

      res.status(201).json({ success: true });
    } catch (error) {
      console.log(error);
    }
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const getLoginUserQuery = `
        SELECT id, email, username,password
        FROM users
        WHERE username = ?
        `;
    const getLoginUserQueryParams = [username];
    const user = await db.query(getLoginUserQuery, getLoginUserQueryParams);

    const match = await bcrypt.compare(password, user[0][0].password);
    if (!match) return res.status(400).json({ msg: "Wrong Password" });
    const userId = user[0][0].userId;
    const email = user[0][0].email;
    const accessToken = jwt.sign(
      { userId, username, email },
      config.secrets.accessTokenSecret,
      {
        expiresIn: "1d",
      }
    );

    res.json({ success: true, accessToken });
  } catch (error) {
    console.log("err", error);
    res.status(401).json({ msg: "Invalid User" });
  }
};
