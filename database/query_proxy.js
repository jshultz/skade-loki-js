async function execute(pool, sql, args) {
    const WorkingResult = new Promise((resolve, reject) => {
        try {
            pool.getConnection((cError, conn) => {
                if (cError) throw cError;
                conn.execute(
                    sql, args, (error, result) => {
                        if (error) throw error;
                        return resolve(result);
                    });
                pool.releaseConnection(conn);
            });
        }
        catch (error) {
            reject(error);
        }
    });
    return WorkingResult;
}

module.exports = execute;