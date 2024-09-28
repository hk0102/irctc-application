import express from "express";
import {
  loginUser,
  getUser,
  registerUser
} from "../controllers/Users.js";

import {addTrains, getSeatAvailability, bookSeat, getBookingDetails} from "../controllers/Trains.js"

import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.post('/api/user/register', registerUser);
router.post("/api/user/login", loginUser);

router.post("/api/train/register", verifyToken, addTrains);
router.get("/api/trains/seat/availability", verifyToken, getSeatAvailability);
router.post("/api/train/book/seat", verifyToken, bookSeat);
router.get("/api/train/booking/:bookingId", verifyToken, getBookingDetails);

router.get("/api/user", verifyToken, getUser);


export default router;
