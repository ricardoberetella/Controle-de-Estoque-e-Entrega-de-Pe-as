
export const generateId = () => Math.random().toString(36).substring(2, 9).toUpperCase();

export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
};
