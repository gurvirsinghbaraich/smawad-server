import cookieParser from "cookie-parser";
import express from "express";
import session from "express-session";
import { apiRouter } from "./routes";
import { getPrismaClient } from "./utils/getPrismaClient";

// Initalizing the server instance.
const app = express();
const PORT = process.env.PORT || 2238;

// Middleware to accept data from POST requests
app.use(express.json());

// Middleware to parse cookies from the requests
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware to handle the session
app.use(
  session({
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET!,
    resave: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// Loading all the api rotues.
app.use(apiRouter);

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
