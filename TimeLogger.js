class TimeLogger {
    constructor(pool) {
        this.pool = pool;
    }
  
    async logTime(userId) {
        const text = "UPDATE users SET last_login_time = NOW() WHERE id = $1";
        const values = [userId];
    
        try {
            await this.pool.query(text, values);
            console.log("User login time updated successfully.");
        } catch (error) {
            console.log(error);
        }
    }
  }
  
  module.exports = TimeLogger;