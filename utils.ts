
export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR');
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};
