
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11).toUpperCase();
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export const sortTaskIds = (aId: string, bId: string): number => {
  const charA = aId.charAt(0).toUpperCase();
  const charB = bId.charAt(0).toUpperCase();

  // Ordem de prioridade de letras: T > D > Outros
  if (charA === 'T' && charB !== 'T') return -1;
  if (charB === 'T' && charA !== 'T') return 1;
  if (charA === 'D' && charB !== 'D') return -1;
  if (charB === 'D' && charA !== 'D') return 1;

  // Se a categoria for a mesma (ex: ambos T ou ambos D), ordena pelo número
  const extractNum = (s: string) => {
    const match = s.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };
  const numA = extractNum(aId);
  const numB = extractNum(bId);

  if (numA !== numB) return numA - numB;
  return aId.localeCompare(bId);
};

export const sortAlphabetically = (a: string, b: string): number => {
  return a.localeCompare(b, 'pt-BR');
};
