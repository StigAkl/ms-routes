import { ChangeEvent, useEffect, useState } from 'react'
import './App.css'

interface RouteData {
  route: string;
  payment: number;
  totalMinutes: number;
  paymentPerMinute: number;
}

const previousResultsKey = "previousResults";
const previousInputKey = "input"
const App = () => {
  const [results, setResults] = useState<RouteData[]>([]);
  const [previousResults, setPreviousResults] = useState<RouteData[]>([]);
  const [input, setInput] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  useEffect(() => {
    const previousDataJson = localStorage.getItem(previousResultsKey);
    const previousInput = localStorage.getItem(previousInputKey);
    if (previousInput) setInput(previousInput);
    if (previousDataJson !== null) setPreviousResults(JSON.parse(previousDataJson) as RouteData[])
  }, []);

  const calculatePaymentPerMinute = () => {
    const lines = input.split('\n').slice(1);
    const data = lines.map(line => {
      const parts = line.split('\t');
      const route = parts[0];
      const payment = parseInt(parts[1].replace(/\s+kr/g, '').replace(/\s/g, ''), 10);
      const timeParts = parts[2].split(', ').map(time => parseInt(time, 10));
      const hours = timeParts.length === 2 ? timeParts[0] : 0;
      const minutes = timeParts.length === 2 ? timeParts[1] : timeParts[0];
      const totalMinutes = hours * 60 + minutes;
      const paymentPerMinute = payment / totalMinutes;
      return { route, payment, totalMinutes, paymentPerMinute };
    });

    data.sort((a, b) => a.paymentPerMinute > b.paymentPerMinute ? -1 : 1);
    setResults(data);
    const prevResult = localStorage.getItem(previousResultsKey);
    if (prevResult !== null) setPreviousResults(JSON.parse(prevResult));
    localStorage.setItem(previousInputKey, input);
    localStorage.setItem(previousResultsKey, JSON.stringify(data));
  };

  return (
    <div className="app-container">
      <header>
        <h1>Fraktekalkulator - Betaling per minutt</h1>
        <textarea
          value={input}
          onChange={handleInputChange}
          rows={10}
          cols={50}
          placeholder="Lim inn data her..."
        />
        <button onClick={calculatePaymentPerMinute}>Beregn Betaling per Minutt</button>
      </header>

      {results.length > 0 && <section className="result">
        <table className="results-table">
          <thead>
            <tr>
              <th>Rute</th>
              <th>TotalBetaling</th>
              <th>Total Varighet</th>
              <th>Betaling per Minutt</th>
              {previousResults.length > 0 && <th>Endring fra sist</th>}
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{result.route}</td>
                <td>{result.payment.toLocaleString()} kr</td>
                <td>{result.totalMinutes} minutter</td>
                <td>{result.paymentPerMinute.toFixed(2)} kr</td>
                {previousResults.length > 0 && <td style={{ color: `${result.paymentPerMinute - previousResults[index].paymentPerMinute < 0 ? 'red' : ''}` }}>{(result.paymentPerMinute - previousResults[index].paymentPerMinute).toFixed(2)} kr</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </section>}
    </div>
  )
}

export default App
