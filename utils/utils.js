export const setStorage = (name, data) => {
  localStorage.setItem(name, JSON.stringify(data));
};

export const getStorage = (name) => {
  const data = localStorage.getItem(name);

  if (data) {
    return JSON.parse(data) || [];
  }
};
