const errorController = {};

errorController.triggerError = (req, res, next) => {
    try {
        throw new Error("This is a test error");
    } catch (error) {
        next(error);
    }
};

module.exports = errorController
