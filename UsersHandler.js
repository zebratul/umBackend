const jwt = require("jsonwebtoken");

class UsersHandler {
    constructor(User) {
        this.User = User;
    }

    async getUsers(req, res) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            const users = await this.User.findAll();
            res.status(200).json(users);
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

            const result = await this.User.update({ status: 'blocked' }, { where: { id: ids } });
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

            const result = await this.User.update({ status: 'active' }, { where: { id: ids } });
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

            const result = await this.User.destroy({ where: { id: ids } });
            console.log(`Users with IDs ${ids} have been deleted.`);
            res.sendStatus(200);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
}

module.exports = UsersHandler;
