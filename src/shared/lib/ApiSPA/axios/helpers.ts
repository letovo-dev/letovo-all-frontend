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

export function setDataToLocaleStorage(storageName: string, data: any) {
  if (typeof data === 'string') {
    localStorage.setItem(`${storageName}`, data);
  }
  if (data && typeof data === 'object') {
    localStorage.setItem(`${storageName}`, JSON.stringify(data));
  }
}

export function getDataFromLocaleStorage(storageName: string): any {
  const data = localStorage.getItem(storageName);
  if (data) {
    return JSON.parse(data);
  }
  return null;
}
