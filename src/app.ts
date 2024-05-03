import express from "express";
import { getPrismaClient } from "./utils/getPrismaClient";

// Initalizing the server instance.
const app = express();
const PORT = process.env.PORT || 2238;

// Connected to the database.
getPrismaClient()
  .$connect()
  .then(() => {
    // Once the connection to the database is sucessful, start the server on @PORT
    app.listen(PORT, () => {
      console.log(`Server is running on PORT: [::]:${PORT}`);
    });
  })
  .catch((error: Error) => {
    // Logging the error to the console, as the connection to the database was not successful.
    console.log(error.message);
  });
