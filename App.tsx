import React, { useState } from 'react';
import { searchPilatesStudios } from './services/geminiService';
import { SearchResult, SearchStatus } from './types';
import { StudioCard } from './components/StudioCard';

const App: React.FC = () => {
  const [city, setCity] = useState('');
  const [status, setStatus] = useState<SearchStatus>(SearchStatus.IDLE);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setStatus(SearchStatus.LOADING);
    setError(null);
    setResult(null);

    try {
      const data = await searchPilatesStudios(city);
      setResult(data);
      setStatus(SearchStatus.SUCCESS);
    } catch (err) {
      setError("Ocorreu um erro ao buscar os estúdios. Verifique sua conexão ou tente novamente.");
      setStatus(SearchStatus.ERROR);
    }
  };

  const downloadCSV = () => {
    if (!result || !result.studios.length) return;

    const headers = ['Nome', 'Endereço', 'Telefone', 'Website', 'Instagram', 'Facebook', 'Descrição'];
    const csvContent = [
      headers.join(','),
      ...result.studios.map(studio => {
        const row = [
          studio.parsedName || '',
          studio.parsedAddress || '',
          studio.parsedPhone || '',
          studio.parsedWebsite || '',
          studio.parsedInstagram || '',
          studio.parsedFacebook || '',
          (studio.parsedDescription || '').replace(/"/g, '""') // Escape quotes
        ];
        // Wrap fields in quotes to handle commas within content
        return row.map(field => `"${field}"`).join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `pilates_studios_${city.replace(/\s+/g, '_').toLowerCase()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white">
              <i className="fa-solid fa-person-praying"></i>
            </div>
            <h1 className="text-xl font-bold text-brand-900 tracking-tight">PilatesFinder AI</h1>
          </div>
          <div className="text-xs text-slate-400 font-medium hidden sm:block">
            Powered by Gemini
          </div>
        </div>
      </header>

      {/* Hero / Search Section */}
      <div className="bg-brand-600 py-16 px-4 relative overflow-hidden print:hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
        </div>

        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            Encontre o estúdio perfeito<br/> para sua prática.
          </h2>
          <p className="text-brand-100 text-lg md:text-xl max-w-2xl mx-auto">
            Descubra os melhores locais, veja avaliações e entre em contato direto. Tudo em um só lugar.
          </p>
          
          <form onSubmit={handleSearch} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto bg-white p-2 rounded-2xl shadow-2xl">
            <div className="relative flex-grow">
              <i className="fa-solid fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Digite o nome da sua cidade..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl border-none outline-none focus:ring-0 text-slate-700 placeholder-slate-400"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={status === SearchStatus.LOADING}
              className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
            >
              {status === SearchStatus.LOADING ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i> Buscando...
                </>
              ) : (
                'Buscar'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        {status === SearchStatus.IDLE && (
          <div className="text-center py-20 text-slate-400 print:hidden">
            <i className="fa-solid fa-magnifying-glass text-6xl mb-4 text-slate-200"></i>
            <p className="text-lg">Digite uma cidade acima para começar a busca.</p>
          </div>
        )}

        {status === SearchStatus.ERROR && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700 max-w-2xl mx-auto print:hidden">
            <i className="fa-solid fa-triangle-exclamation text-3xl mb-2"></i>
            <p>{error}</p>
          </div>
        )}

        {status === SearchStatus.SUCCESS && result && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h3 className="text-2xl font-bold text-slate-800">
                Resultados em <span className="text-brand-600">{city}</span>
              </h3>
              
              <div className="flex items-center gap-3 print:hidden">
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                  {result.studios.length} locais
                </span>
                
                {result.studios.length > 0 && (
                  <>
                    <button 
                      onClick={downloadCSV}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition-colors shadow-sm"
                      title="Baixar lista em formato CSV (Excel)"
                    >
                      <i className="fa-solid fa-file-csv"></i>
                      <span className="hidden sm:inline">CSV</span>
                    </button>
                    <button 
                      onClick={handlePrint}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                      title="Imprimir ou Salvar como PDF"
                    >
                      <i className="fa-solid fa-print"></i>
                      <span className="hidden sm:inline">PDF / Imprimir</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {result.studios.length === 0 ? (
               <div className="text-center py-10 text-slate-500">
                 Nenhum estúdio encontrado especificamente com esses critérios. Tente uma cidade maior ou verifique a ortografia.
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 print:grid-cols-2 print:gap-4">
                {result.studios.map((studio, idx) => (
                  <StudioCard key={idx} data={studio} />
                ))}
              </div>
            )}

            {/* Grounding Source Footer */}
            {result.groundingChunks.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-200 print:mt-4 print:pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Fontes de Dados</h4>
                <div className="flex flex-wrap gap-2">
                  {result.groundingChunks.map((chunk, i) => {
                    const uri = chunk.web?.uri || chunk.maps?.uri;
                    const title = chunk.web?.title || chunk.maps?.title || "Fonte externa";
                    if (!uri) return null;
                    return (
                      <a 
                        key={i} 
                        href={uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:text-brand-600 hover:border-brand-200 transition-colors print:border-none print:px-0 print:text-slate-500"
                      >
                        <i className="fa-brands fa-google text-[10px]"></i> {title}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-400 text-sm print:hidden">
        <p>&copy; {new Date().getFullYear()} PilatesFinder AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;