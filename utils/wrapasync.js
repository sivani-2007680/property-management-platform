function wrapAsync(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

class ExpressError extends Error {
    constructor(status = 500, message = "Something went wrong") {
        super(message);
        this.status = status;
    }
}

module.exports = { wrapAsync, ExpressError };