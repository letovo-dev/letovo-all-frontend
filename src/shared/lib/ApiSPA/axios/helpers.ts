export const withSuccessHeader = <Response>(successMessage: string, data: Response) => {
  return {
    success: true,
    message: successMessage,
    error: null,
    data,
  };
};

export const withErrorHeader = <Response>(errorMessage: string, data: Response) => {
  return {
    success: false,
    message: null,
    error: errorMessage,
    data,
  };
};
