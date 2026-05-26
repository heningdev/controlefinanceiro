import styled, { createGlobalStyle } from 'styled-components';
import 'react-calendar/dist/Calendar.css'; // <-- Import do CSS do calendário

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }

  body {
    background-color: #f4f4f5;
    color: #18181b;
    -webkit-font-smoothing: antialiased;
    overflow-y: auto; /* Garante que a rolagem vertical esteja livre */
  }

  /* Estilização Moderna para a Barra de Rolagem */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: transparent; 
  }
  ::-webkit-scrollbar-thumb {
    background: #d4d4d8;
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #a1a1aa;
  }
`;

export const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  min-height: 100vh; /* NOVO: Permite que o fundo cresça com o conteúdo */
  align-items: start; /* NOVO: Impede que os itens do grid estiquem infinitamente */
`;

export const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .title-group {
    h1 {
      font-size: 1.75rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    p {
      color: #71717a;
      font-size: 0.95rem;
      margin-top: 0.25rem;
    }
  }
`;

export const ExportGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: #ffffff;
  color: #18181b;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f4f4f5;
    border-color: #d4d4d8;
  }
`;

export const FastEntryCard = styled.form`
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const InputGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap; 
`;

export const Input = styled.input`
  flex: ${props => props.$flex || 1};
  padding: 0.75rem 1rem;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

export const Select = styled.select`
  flex: ${props => props.$flex || 1};
  padding: 0.75rem 1rem;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  background-color: white;
  transition: border-color 0.2s;
  cursor: pointer;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

export const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #18181b;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #27272a;
  }
`;

export const HistorySidebar = styled.aside`
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  height: calc(100vh - 4rem);
  
  /* NOVO: Mantém o painel fixo enquanto a coluna da esquerda rola */
  position: sticky; 
  top: 2rem; 
`;

export const ExpenseItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0.5rem;
  border-bottom: 1px solid #f4f4f5;
  border-radius: 8px;
  transition: background-color 0.2s;

  .delete-btn {
    opacity: 0;
    visibility: hidden;
    background: none;
    border: none;
    color: #a1a1aa;
    cursor: pointer;
    padding: 0.25rem;
    transition: all 0.2s;

    &:hover {
      color: #ef4444;
    }
  }

  &:hover {
    background-color: #fafafa;
    .delete-btn {
      opacity: 1;
      visibility: visible;
    }
  }

  &:last-child {
    border-bottom: none;
  }

  .desc-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .desc {
    font-weight: 500;
  }

  .category-badge {
    font-size: 0.7rem;
    background: #f4f4f5;
    padding: 2px 6px;
    border-radius: 4px;
    color: #52525b;
    width: fit-content;
    text-transform: uppercase;
    font-weight: 600;
  }

  .amount-group {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .amount {
    font-weight: 600;
    color: #ef4444;
  }
`;

export const CalendarWrapper = styled.div`
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  display: flex;
  justify-content: center;

  .react-calendar {
    width: 100%;
    border: none;
    font-family: inherit;
    background: transparent;
  }

  .react-calendar__navigation button {
    min-width: 44px;
    background: none;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 8px;
    transition: background-color 0.2s;
    
    &:enabled:hover,
    &:enabled:focus {
      background-color: #f4f4f5;
    }
  }

  .react-calendar__month-view__weekdays {
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.75rem;
    color: #a1a1aa;
    text-decoration: none;
    
    abbr {
      text-decoration: none;
    }
  }

  .react-calendar__tile {
    border-radius: 8px;
    padding: 0.75em 0.5em;
    font-size: 0.95rem;
    transition: background-color 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    &:enabled:hover,
    &:enabled:focus {
      background-color: #f4f4f5;
    }
  }

  .react-calendar__tile--now {
    background: #e0f2fe;
    color: #0369a1;
    
    &:enabled:hover,
    &:enabled:focus {
      background: #bae6fd;
    }
  }

  .react-calendar__tile--active {
    background: #18181b !important;
    color: white !important;
  }
`;

export const ExpenseDot = styled.div`
  width: 6px;
  height: 6px;
  background-color: #ef4444;
  border-radius: 50%;
`;

export const SummaryContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; /* Agora são duas colunas para dividir espaço com o gráfico */
  gap: 1rem;
`;

export const SummaryCard = styled.div`
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-left: 4px solid #18181b;

  h4 {
    font-size: 0.9rem;
    color: #71717a;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .value {
    font-size: 2rem;
    font-weight: 700;
    color: #18181b;
  }
`;

export const DailyTotal = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #e4e4e7;
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: #18181b;
`;

export const ChartCard = styled.div`
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  h4 {
    font-size: 0.9rem;
    color: #71717a;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Faz o container do gráfico se ajustar perfeitamente */
  .chart-container {
    width: 100%;
    height: 150px;
    margin-top: 0.5rem;
  }
`;