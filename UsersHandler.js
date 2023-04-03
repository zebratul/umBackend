const jwt = require("jsonwebtoken");

class UsersHandler {
    constructor(pool) {
        this.pool = pool;
    }

    async getUsers(req, res) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            const result = await this.pool.query("SELECT * FROM userbase");
            res.status(200).json(result.rows);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }

    async blockUsers(req, res) {
        const { ids } = req.body;

        try {
            const token = req.headers.authorization.split(" ")[1];
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

            const text = "UPDATE userbase SET status = 'blocked' WHERE id = ANY($1)";
            const values = [ids];

            const result = await this.pool.query(text, values);
            console.log(`Users with IDs ${ids.join(", ")} have been blocked.`);
            res.sendStatus(200);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }

    async unblockUsers(req, res) {
        const { ids } = req.body;

        try {
            const token = req.headers.authorization.split(" ")[1];
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

            const text = "UPDATE userbase SET status = 'active' WHERE id = ANY($1)";
            const values = [ids];

            const result = await this.pool.query(text, values);
            console.log(`Users with IDs ${ids.join(", ")} have been unblocked.`);
            res.sendStatus(200);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }

    async deleteUsers(req, res) {
        const { ids } = req.body;

        try {
            const token = req.headers.authorization.split(" ")[1];
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

            const text = "DELETE FROM userbase WHERE id = ANY($1)";
            const values = [ids];

            const result = await this.pool.query(text, values);
            console.log(`Users with IDs ${ids} have been deleted.`);
            res.sendStatus(200);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
}

module.exports = UsersHandler;