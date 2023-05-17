const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { Sequelize, DataTypes } = require("sequelize");
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

        this.sequelize = new Sequelize({
            dialect: "postgres",
            protocol: "postgres",
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                }
            },
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        this.User = this.sequelize.define('user', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            last_login_time: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            registration_time: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            createdat: {
                type: DataTypes.DATE,
                field: 'createdat',
            },
            updatedat: {
                type: DataTypes.DATE,
                field: 'updatedat',
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
            }
        }, {
            tableName: 'userbase',
            timestamps: false
        });
        

        this.sequelize.authenticate().then(() => {
            console.log("Connected to PostgreSQL database.");
        }).catch(error => {
            console.log(error);
        });

        this.registerHandler = new RegisterHandler(this.User);
        this.loginHandler = new LoginHandler(this.User);
        this.usersHandler = new UsersHandler(this.User);
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
