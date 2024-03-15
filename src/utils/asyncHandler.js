export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      res.status(error.code || 500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

//anOther way to write this

// const asyncHandler = (fn)=>{
//     (req , res, next )=>{
//         Promise.resolve(fn(req,res,next)).catch((error)=>{
//             next(error)
//         })
//     }
// }
