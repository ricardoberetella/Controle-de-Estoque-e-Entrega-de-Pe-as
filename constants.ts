
import { Part, Student } from './types';

export const CLASSES = [
  'Turma A - Manhã',
  'Turma B - Manhã',
  'Turma A - Tarde',
  'Turma B - Tarde'
];

export const INITIAL_PARTS: Part[] = [
  { id: 'T1', code: '1003198', name: 'Tarefa 1', targetQuantity: 70 },
  { id: 'T2', code: '1003197', name: 'Tarefa 2', targetQuantity: 70 },
  { id: 'T5A', code: '1001583', name: 'Tarefa 5A', targetQuantity: 170 },
  { id: 'T5B', code: '1014521', name: 'Tarefa 5B', targetQuantity: 70 },
  { id: 'T6/9', code: '1001584', name: 'Tarefa 6/9', targetQuantity: 140 },
  { id: 'T7', code: '1020433', name: 'Tarefa 7', targetQuantity: 110 },
  { id: 'T10', code: '1020430', name: 'Tarefa 10', targetQuantity: 70 },
  { id: 'T11', code: '1012117', name: 'Tarefa 11', targetQuantity: 70 },
  { id: 'T13', code: '1001614', name: 'Tarefa 13', targetQuantity: 190 },
  { id: 'T14', code: '1020421', name: 'Tarefa 14', targetQuantity: 40 },
  { id: 'T15', code: '1014525', name: 'Tarefa 15', targetQuantity: 65 },
  { id: 'T19', code: '1014526', name: 'Tarefa 19', targetQuantity: 75 },
  { id: 'T21', code: '1014527', name: 'Tarefa 21', targetQuantity: 80 },
  { id: 'T22', code: '1014528', name: 'Tarefa 22', targetQuantity: 90 },
  { id: 'T23', code: '1014529', name: 'Tarefa 23', targetQuantity: 20 },
  { id: 'T25', code: '1014530', name: 'Tarefa 25', targetQuantity: 30 },
];

export const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Guilherme André Costa', class: 'Turma B - Tarde' },
  { id: '2', name: 'João Gabriel Pontes', class: 'Turma B - Tarde' },
  { id: '3', name: 'Leonardo C. Silva', class: 'Turma B - Tarde' },
  { id: '4', name: 'Mateus Fernando Queiroz', class: 'Turma B - Tarde' },
  { id: '5', name: 'Nicolas Ianili', class: 'Turma B - Tarde' },
  { id: '6', name: 'Renan Oliverio Domingos', class: 'Turma B - Tarde' },
  { id: '7', name: 'Rivair Sales Neto', class: 'Turma B - Tarde' },
  { id: '8', name: 'Sara Machado dos Santos', class: 'Turma B - Tarde' },
  { id: '9', name: 'Guilherme Almeida de Lima', class: 'Turma B - Tarde' },
  { id: '10', name: 'Júlio Cesar Volpe', class: 'Turma B - Tarde' },
  { id: '11', name: 'Kael Henrique da Silva', class: 'Turma B - Tarde' },
  { id: '12', name: 'Nicollas D. G. de Oliveira', class: 'Turma B - Tarde' },
];
