import express from "express";
import {
  loginUser,
  getUsers,
  viewPosts,
  addPosts,
  getUser,
  registerUser
} from "../controllers/Users.js";

import {addTrains, getSeatAvailability} from "../controllers/Trains.js"

import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.post('/api/user/register', registerUser);
router.post("/api/user/login", loginUser);

router.post("/api/train/register", verifyToken, addTrains);
router.get("/api/trains/seat/availability"
  , verifyToken, getSeatAvailability);

router.get("/api/user", verifyToken, getUser);


export default router;
