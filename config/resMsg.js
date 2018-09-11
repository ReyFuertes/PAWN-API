var response = {
  error: {
    success: false,
    status: 401,
    message: "An error occurred while processing request."
  },
  success: (k, v) => {
    return { success: true, k: v };
  }
};
module.exports = response;
