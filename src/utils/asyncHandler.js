const ashyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(req, res, next).catch((err) => next(err));
  };
};

// another way to do this with try catch
// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(`${error.code}|| 500`).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
export { ashyncHandler };
