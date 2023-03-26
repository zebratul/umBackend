const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require('dotenv').config();

const RegisterHandler = require("./RegisterHandler");
const LoginHandler = require("./LoginHandler");
const UsersHandler = require("./UsersHandler");

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 5000;

        this.app.use(express.json());
        this.app.use(cors());

        this.pool = new Pool({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            ssl: {
                rejectUnauthorized: false,
            },
      });

      this.pool.connect((error) => {
          if (error) {
              console.log(error);
          } else {
              console.log("Connected to PostgreSQL database.");
          }
      });

      this.registerHandler = new RegisterHandler(this.pool);
      this.loginHandler = new LoginHandler(this.pool);
      this.usersHandler = new UsersHandler(this.pool);
      this.app.post("/register", this.registerHandler.handle.bind(this.registerHandler));
      this.app.post("/login", this.loginHandler.handle.bind(this.loginHandler));
      this.app.get("/users", this.authenticate.bind(this), this.usersHandler.getUsers.bind(this.usersHandler));
      this.app.put("/users/block", this.authenticate.bind(this), this.usersHandler.blockUsers.bind(this.usersHandler));
      this.app.put("/users/unblock", this.authenticate.bind(this), this.usersHandler.unblockUsers.bind(this.usersHandler));
      this.app.delete("/users", this.authenticate.bind(this), this.usersHandler.deleteUsers.bind(this.usersHandler));

      this.app.listen(this.port, () => {
          console.log(`Server started on port ${this.port}.`);
      });
    }

    authenticate(req, res, next) {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (token == null) {
            return res.sendStatus(401);
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log(err);
            return res.sendStatus(403);
        }

        req.user = user;
        next();
      });
    }
}

new Server();