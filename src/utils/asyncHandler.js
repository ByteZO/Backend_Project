export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      return await fn(req, res, next);
    } catch (error) {
      return res.status(error.code || 500).json({
        success: false,
        message: error.message,
      });
    }
  };
};






//anOther way to write this
// export const asyncHandler = (fn) => {
//   return (req, res, next) => {
//     Promise.resolve(fn(req, res, next)).catch((error) => next(error));
//   };
// };
