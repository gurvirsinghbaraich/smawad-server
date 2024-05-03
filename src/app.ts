import express from "express";

// Initalizing the server instance.
const app = express();

// Starting the server
const PORT = process.env.PORT || 2238;
app.listen(PORT, () => {
  console.log(`Server is running on PORT: [::]:${PORT}`);
});
