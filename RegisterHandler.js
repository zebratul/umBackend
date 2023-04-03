const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const TimeLogger = require('./TimeLogger');

class RegisterHandler {
    constructor(User) {
        this.User = User;
        this.timeLogger = new TimeLogger(User);
    }

    async getUserByEmail(email) {
        try {
            const user = await this.User.findOne({ where: { email } });
            return user;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async handle(req, res) {
        const { name, email, password } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        try {
            const newUser = await this.User.create({
                name,
                email,
                password: hash,
                registration_time: new Date(),
                status: "active"
            });

            console.log("User registered successfully.");

            await this.timeLogger.logTime(newUser.id);

            const token = jwt.sign({ email }, process.env.JWT_SECRET);

            res.status(200).json({ token });
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
}

module.exports = RegisterHandler;
