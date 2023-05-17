const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const TimeLogger = require('./TimeLogger');

class LoginHandler {
    constructor(User) {
        this.User = User;
        this.timeLogger = new TimeLogger(User);
    }

    async handle(req, res) {
        const { email, password } = req.body;
    
        try {
            const user = await this.User.findOne({ where: { email }, attributes: ['id', 'password', 'name', 'email', 'last_login_time', 'registration_time', 'status'] });
    
            if (!user) {
                console.log(`User ${email} not found.`);
                res.status(401).json({ error: 'Invalid email or password.' });
                return;
            }
    
            if (user.status === 'blocked') {
                console.log(`User ${email} is blocked.`);
                res.status(401).json({ error: 'Account blocked.', message: 'Your account has been blocked. Please contact support for assistance.' });
                return;
            }
    
            const passwordMatch = await bcrypt.compare(password, user.password);
    
            if (!passwordMatch) {
                console.log(`Invalid password for user ${email}.`);
                res.status(401).json({ error: 'Invalid email or password.' });
                return;
            }
    
            console.log(`User ${email} logged in.`);
    
            await this.timeLogger.logTime(user.id);
    
            const token = jwt.sign({ email }, process.env.JWT_SECRET);

            user.password = undefined;
    
            res.status(200).json({ token, user });
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
    
}

module.exports = LoginHandler;
