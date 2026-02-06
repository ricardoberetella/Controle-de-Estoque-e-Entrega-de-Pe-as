
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11).toUpperCase();
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export const sortTaskIds = (aId: string, bId: string): number => {
  const extractNum = (s: string) => parseInt(s.replace(/\D/g, '')) || 0;
  const numA = extractNum(aId);
  const numB = extractNum(bId);
  if (numA !== numB) return numA - numB;
  return aId.localeCompare(bId);
};

export const sortAlphabetically = (a: string, b: string): number => {
  return a.localeCompare(b, 'pt-BR');
};
