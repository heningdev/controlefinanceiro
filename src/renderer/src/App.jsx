import { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import { Trash2, Download } from 'lucide-react'; // <-- Importe o Download
import toast, { Toaster } from 'react-hot-toast'; // Notificações
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  GlobalStyle, Container, MainContent, Header, 
  FastEntryCard, InputGroup, Input, Select, Button, // <-- Select adicionado
  HistorySidebar, ExpenseItem, 
  CalendarWrapper, ExpenseDot,
  SummaryContainer, SummaryCard, ChartCard, DailyTotal, ExportGroup, ExportButton
} from './styles';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Alimentação'); // Estado da categoria
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const amountInputRef = useRef(null);

  const categorias = ["Alimentação", "Transporte", "Lazer", "Contas", "Saúde", "Outros"];

  useEffect(() => {
    carregarDespesas();
    amountInputRef.current?.focus();

    if (window.api && window.api.onFocusInput) {
      window.api.onFocusInput(() => {
        amountInputRef.current?.focus();
      });
    }
  }, []);

  const carregarDespesas = async () => {
    if (window.api) {
      const dados = await window.api.getExpenses();
      setExpenses(dados.reverse()); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !description) return;

    const novaDespesa = {
      id: Date.now().toString(),
      amount: parseFloat(amount.replace(',', '.')),
      description,
      category, // Salvando a categoria
      date: selectedDate.toISOString() 
    };

    if (window.api) {
      await window.api.addExpense(novaDespesa);
      await carregarDespesas();
      
      toast.success('Gasto registrado!'); // Toast de sucesso
      
      setAmount('');
      setDescription('');
      amountInputRef.current?.focus();
    }
  };

  const handleDelete = async (id) => {
    if (window.api) {
      await window.api.deleteExpense(id);
      await carregarDespesas();
      toast.success('Registro apagado');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const expensesForSelectedMonth = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return (
      expDate.getMonth() === selectedDate.getMonth() &&
      expDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const totalMonthly = expensesForSelectedMonth.reduce((acc, exp) => acc + exp.amount, 0);

  const expensesForSelectedDate = expensesForSelectedMonth.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getDate() === selectedDate.getDate();
  });

  const totalDaily = expensesForSelectedDate.reduce((acc, exp) => acc + exp.amount, 0);

  const renderTileContent = ({ date, view }) => {
    if (view === 'month') {
      const hasExpense = expenses.some(exp => {
        const expDate = new Date(exp.date);
        return (
          expDate.getDate() === date.getDate() &&
          expDate.getMonth() === date.getMonth() &&
          expDate.getFullYear() === date.getFullYear()
        );
      });
      return hasExpense ? <ExpenseDot /> : null;
    }
    return null;
  };

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const currentMonthName = monthNames[selectedDate.getMonth()];
  const currentYear = selectedDate.getFullYear();

  // Cores modernas para cada categoria no gráfico
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];

  // Agrupamento de dados para o gráfico de rosca
  const categoryData = expensesForSelectedMonth.reduce((acc, exp) => {
    const category = exp.category || 'Outros';
    const existing = acc.find(item => item.name === category);
    
    if (existing) {
      existing.value += exp.amount;
    } else {
      acc.push({ name: category, value: exp.amount });
    }
    
    return acc;
  }, []);

  const nomeRelatorioBase = `Relatorio_Financeiro_${currentMonthName}_${currentYear}`;

  const handleExportCSV = async () => {
    if (expensesForSelectedMonth.length === 0) return toast.error("Sem dados para exportar.");
    
    // Monta o cabeçalho e as linhas separadas por ponto e vírgula
    const header = ["Data", "Descrição", "Categoria", "Valor (R$)"];
    const rows = expensesForSelectedMonth.map(exp => [
      new Date(exp.date).toLocaleDateString('pt-BR'),
      exp.description,
      exp.category || 'Outros',
      exp.amount.toFixed(2).replace('.', ',')
    ]);
    const csvContent = [header, ...rows].map(e => e.join(";")).join("\n");
    const buffer = new TextEncoder().encode(csvContent);

    const success = await window.api.saveFile({
      buffer,
      defaultPath: `${nomeRelatorioBase}.csv`,
      filters: [{ name: 'CSV', extensions: ['csv'] }]
    });
    if(success) toast.success("CSV exportado com sucesso!");
  };

  const handleExportExcel = async () => {
    if (expensesForSelectedMonth.length === 0) return toast.error("Sem dados para exportar.");

    // Formata objeto direto para a planilha
    const data = expensesForSelectedMonth.map(exp => ({
      Data: new Date(exp.date).toLocaleDateString('pt-BR'),
      Descrição: exp.description,
      Categoria: exp.category || 'Outros',
      Valor: exp.amount
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Despesas");
    
    // Gera o buffer da planilha
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const success = await window.api.saveFile({
      buffer: excelBuffer,
      defaultPath: `${nomeRelatorioBase}.xlsx`,
      filters: [{ name: 'Excel', extensions: ['xlsx'] }]
    });
    if(success) toast.success("Excel exportado com sucesso!");
  };

const handleExportPDF = async () => {
    try {
      if (expensesForSelectedMonth.length === 0) return toast.error("Sem dados para exportar.");

      const doc = new jsPDF();
      doc.text(`Relatório Financeiro - ${currentMonthName} ${currentYear}`, 14, 15);

      const tableData = expensesForSelectedMonth.map(exp => [
        new Date(exp.date).toLocaleDateString('pt-BR'),
        exp.description,
        exp.category || 'Outros',
        formatCurrency(exp.amount)
      ]);

      // CORREÇÃO: Chama o autoTable passando o 'doc' como primeiro parâmetro
      autoTable(doc, {
        startY: 25,
        head: [['Data', 'Descrição', 'Categoria', 'Valor']],
        body: tableData,
      });

      const pdfBuffer = doc.output('arraybuffer');
      const success = await window.api.saveFile({
        buffer: pdfBuffer, // ArrayBuffer trafega perfeitamente pelo IPC do Electron
        defaultPath: `${nomeRelatorioBase}.pdf`,
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      });
      
      if(success) toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Ocorreu um erro ao gerar o PDF.");
    }
  };

  return (
    <>
      <GlobalStyle />
      {/* Componente que renderiza os toasts flutuantes */}
      <Toaster position="bottom-right" /> 
      
      <Container>
        <MainContent>
          
          {/* O Header agora é dividido entre Título e Botões */}
          <Header>
            <div className="title-group">
              <h1>Controle Financeiro </h1>
              <p>Insira seus gastos diários</p>
            </div>
            
            <ExportGroup>
              <ExportButton onClick={handleExportCSV} title="Exportar CSV">
                <Download size={16} /> CSV
              </ExportButton>
              <ExportButton onClick={handleExportExcel} title="Exportar Excel">
                <Download size={16} /> Excel
              </ExportButton>
              <ExportButton onClick={handleExportPDF} title="Exportar PDF">
                <Download size={16} /> PDF
              </ExportButton>
            </ExportGroup>
          </Header>

          <SummaryContainer>
            <SummaryCard>
              <h4>Total Gasto • {currentMonthName} {currentYear}</h4>
              <div className="value">{formatCurrency(totalMonthly)}</div>
            </SummaryCard>

            <ChartCard>
              <h4>Gastos por Categoria</h4>
              {categoryData.length > 0 ? (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={categoryData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={40} 
                        outerRadius={65} 
                        paddingAngle={5}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: '1rem' }}>
                  Nenhum dado para analisar neste mês.
                </p>
              )}
            </ChartCard>
          </SummaryContainer>

          <FastEntryCard onSubmit={handleSubmit}>
            <InputGroup>
              <Input 
                $flex={1}
                ref={amountInputRef}
                type="number" 
                step="0.01"
                placeholder="R$ 0,00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Input 
                $flex={2}
                type="text" 
                placeholder="Onde ou com o que?" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {/* Novo Select de Categorias */}
              <Select 
                $flex={1}
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </InputGroup>
            <Button type="submit">Registrar Gasto</Button>
          </FastEntryCard>

          <CalendarWrapper>
            <Calendar 
              onChange={setSelectedDate} 
              value={selectedDate}
              tileContent={renderTileContent}
              locale="pt-BR"
            />
          </CalendarWrapper>

        </MainContent>

        <HistorySidebar>
          <h3>Gastos em {selectedDate.toLocaleDateString('pt-BR')}</h3>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', height: 'calc(100% - 3rem)' }}>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {expensesForSelectedDate.length === 0 ? (
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Nenhum gasto registrado neste dia.</p>
              ) : (
                expensesForSelectedDate.map(exp => (
                  <ExpenseItem key={exp.id}>
                    <div className="desc-group">
                      <div className="desc">{exp.description}</div>
                      {/* Renderiza a categoria salva ou um aviso se for um dado antigo sem categoria */}
                      <div className="category-badge">{exp.category || "Sem categoria"}</div>
                    </div>
                    <div className="amount-group">
                      <div className="amount">{formatCurrency(exp.amount)}</div>
                      {/* Botão de excluir que aparece no hover */}
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDelete(exp.id)}
                        title="Excluir registro"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </ExpenseItem>
                ))
              )}
            </div>

            {expensesForSelectedDate.length > 0 && (
              <DailyTotal>
                <span>Total do Dia</span>
                <span style={{ color: '#ef4444' }}>{formatCurrency(totalDaily)}</span>
              </DailyTotal>
            )}

          </div>
        </HistorySidebar>
      </Container>
    </>
  );
}

export default App;