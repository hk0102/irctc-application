import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db/index.js";

import config from "../config/Database.js";

export const addTrains = async (req, res) => {
    try {
      // Get the current user ID from the request object (assuming it was added by your verifyToken middleware)
      const { userId } = req;
      console.log("userId", userId);
  
      // Check if the user is an admin
      const users = await db.query(`SELECT * FROM users WHERE id = ? AND role = 'ADMIN'`, [
        userId,
      ]);

      console.log("user", users)
  
      if (users.length === 0) {
        return res.status(401).json({ message: "Unauthorized user" });
      }
  
      // Extract train details from the request body
      const { trainName, trainNumber, totalSeats, sourceStation, destinationStation } = req.body;
  
      if (!trainName || !trainNumber || !totalSeats || !sourceStation || !destinationStation) {
        return res.status(400).json({ message: "All fields (trainName, trainNumber, totalSeats, sourceStation, destinationStation) are required" });
      }
  
      // Add the new train into the trains table
      const [result] = await db.query(
        `INSERT INTO trains (trainName, trainNumber, totalSeats, availableSeats, sourceStation, destinationStation) VALUES (?, ?, ?, ?, ?, ?)`,
        [trainName, trainNumber, totalSeats, totalSeats, sourceStation, destinationStation] // availableSeats initialized to totalSeats
      );
  
      // Return success response
      res.status(201).json({ message: "Train added successfully", trainId: result.insertId });
    } catch (err) {
      console.error("Error adding train:", err);
      res.status(500).json({ message: "Server error while adding train" });
    }
  };



export const getSeatAvailability = async (req, res) => {
    try {
      // Extract source and destination from request query
      const { sourceStation, destinationStation } = req.query;
  
      // Validate input
      if (!sourceStation || !destinationStation) {
        return res.status(400).json({ message: "Please provide both sourceStation and destinationStation." });
      }
  
      // Query to get all trains between the given source and destination stations
      const query = `
        SELECT id, trainName, trainNumber, totalSeats, availableSeats, sourceStation, destinationStation
        FROM trains
        WHERE sourceStation = ? AND destinationStation = ? AND availableSeats > 0;
      `;
  
      // Execute the query
      const [trains] = await db.query(query, [sourceStation, destinationStation]);
  
      // If no trains are found, return a message
      if (trains.length === 0) {
        return res.status(404).json({ message: "No trains found for the given route." });
      }

      console.log("train", trains)

      let response = []

      for(var i=0; i<trains.length;i++){
        response.push({
            "trainName": trains[i].trainName,
        "trainNumber": trains[i].trainNumber,
        "availableSeats": trains[i].availableSeats,
        })

      }

      // Return the list of trains with their availability
      res.status(200).json({
        "trains": response

      });
    } catch (err) {
      console.error("Error fetching trains:", err);
      res.status(500).json({ message: "Server error while fetching trains." });
    }
  };
  

  export const bookSeat = async (req, res) => {
    console.log("req body", req.body);
   // console.log(`Request body - ${JSON.stringify(req.body)}`);
    const { username, trainNumber } = req.body;
  
    if (!username || !trainNumber) {
        return res.status(400).json({ message: "Please provide both username and trainNumber." });
      }
  

      let connection;
    try {   
      connection = await db.getConnection();
      // Start transaction to ensure consistency
      await connection.beginTransaction();
      
      const userQuery = `SELECT id FROM users WHERE username = ?`;
      const [userResult] = await connection.query(userQuery, [username]);
  
      if (userResult.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "User not found." });
      }

      const userId = userResult[0].id;
      // Lock the row to prevent other transactions from modifying it

      const trainQuery = `SELECT id, availableSeats FROM trains WHERE trainNumber = ? FOR UPDATE`;
    const [trainResult] = await connection.query(trainQuery, [trainNumber]);

    if (trainResult.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Train not found." });
    }

      const availableSeats = trainResult[0].availableSeats;
      const trainId = trainResult[0].id;
      if (availableSeats <= 0) {
        await connection.rollback();
        return res.status(400).json({ message: "No available seats on this train." });
      }
  
      // Assign a seat number (e.g., current available seat number)
      const seatNumber = availableSeats;
  
      // Update the available seats in the train
      const updateSeatsQuery = `UPDATE trains SET availableSeats = availableSeats - 1 WHERE id = ?`;
      await connection.query(updateSeatsQuery, [trainId]);
  
      // Insert booking details into userJourneyDetails table
      const bookingQuery = `INSERT INTO userJourneyDetails (userId, trainId, seatNumber) VALUES (?, ?, ?)`;
      await connection.query(bookingQuery, [userId, trainId, seatNumber]);
  
      // Commit the transaction
      await connection.commit();
  
      res.status(201).json({
        message: "Seat booked successfully!",
        seatNumber
      });
    } catch (err) {
      console.error("Error booking seat:", err);
  
      // Rollback the transaction in case of an error
      await connection.rollback();
      res.status(500).json({ message: "Server error while booking seat." });
    }
    finally {
      // Release the connection back to the pool
      if (connection) await connection.release();
    }
  };
  