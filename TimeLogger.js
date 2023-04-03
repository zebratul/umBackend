class TimeLogger {
    constructor(User) {
        this.User = User;
    }

    async logTime(userId) {
        try {
            await this.User.update({ last_login_time: new Date() }, { where: { id: userId } });
            console.log("User login time updated successfully.");
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = TimeLogger;
