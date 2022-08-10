require("dotenv").config();
const express = require("express");
var cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());
const paymasters = require("./paymasters");
app.use("/paymasters", paymasters);
module.exports = app;
