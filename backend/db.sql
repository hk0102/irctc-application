CREATE TABLE `users` (
  `id` int Unique NOT NULL AUTO_INCREMENT,
  `username` nvarchar(255) NOT NULL,
  `email` varchar(255)  DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','USER') NOT NULL DEFAULT 'USER',
  PRIMARY KEY (`id`)
) ;


CREATE TABLE `trains` (
  `id` int Unique NOT NULL AUTO_INCREMENT,
  `trainName` nvarchar(255) NOT NULL,
  `trainNumber` Int NOT NULL, 
  `totalSeats` Int NOT NULL,
  `availableSeats` INT NOT NULL,
  `sourceStation` nvarchar(255) NOT NULL, 
  `destinationStation` nvarchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ;



CREATE TABLE `userJourneyDetails` (
  `id` int Unique NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `trainId` INT NOT NULL,
  `seatNumber` INT NOT NULL, 
  `bookingDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,   
  PRIMARY KEY (`id`),
  FOREIGN KEY (`trainId`) REFERENCES trains(`id`),
  FOREIGN KEY (`userId`) REFERENCES users(`id`)
);


