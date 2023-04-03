const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const TimeLogger = require('./TimeLogger');

class RegisterHandler {
    constructor(pool) {
        this.pool = pool;
        this.timeLogger = new TimeLogger(pool);
    }
  
    async getUserByEmail(email) {
        const query = {
            text: 'SELECT id FROM userbase WHERE email = $1',
            values: [email],
        };
        
        try {
            const result = await this.pool.query(query);
            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
  
    async handle(req, res) {
        const { name, email, password } = req.body;
    
        const salt = await bcrypt.genSalt(10);

        const hash = await bcrypt.hash(password, salt);
    
        const text =
            "INSERT INTO userbase(name, email, password, registration_time, status) VALUES($1, $2, $3, $4, $5) RETURNING id";
        const values = [name, email, hash, new Date(), "active"];
  
        try {
            const result = await this.pool.query(text, values);
            console.log("User registered successfully.");
    
            const user = await this.getUserByEmail(email);
            const userId = user.id;
            await this.timeLogger.logTime(userId);
    
            const token = jwt.sign({ email }, process.env.JWT_SECRET);
    
            res.status(200).json({ token });
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
      }
    }
  }
  
  module.exports = RegisterHandler;