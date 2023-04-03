const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const TimeLogger = require('./TimeLogger');

class LoginHandler {
    constructor(pool) {
        this.pool = pool;
        this.timeLogger = new TimeLogger(pool);
    }

    async handle(req, res) {
        const { email, password } = req.body;

        try {
            const query = {
                text: 'SELECT * FROM userbase WHERE email = $1',
                values: [email],
          };

          const result = await this.pool.query(query);

          if (result.rows.length === 0) {
              console.log(`User ${email} not found.`);
              res.status(401).json({ error: 'Invalid email or password.' });
              return;
          }

          const user = result.rows[0];

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

          res.status(200).json({ token });
        } catch (error) {
          console.log(error);
          res.sendStatus(500);
        }
    }
}

module.exports = LoginHandler;
