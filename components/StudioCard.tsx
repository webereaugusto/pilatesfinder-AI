import React from 'react';
import { StudioData } from '../types';

interface StudioCardProps {
  data: StudioData;
}

export const StudioCard: React.FC<StudioCardProps> = ({ data }) => {
  // Helper to clean URLs
  const cleanUrl = (url: string) => url.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
  const isValidLink = (str?: string) => str && str.toLowerCase() !== 'não disponível' && str.length > 5;
  const description = data.parsedDescription;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group print:shadow-none print:border-slate-300 print:break-inside-avoid">
      <div className="bg-brand-50 p-4 border-b border-brand-100 flex items-start justify-between group-hover:bg-brand-100 transition-colors print:bg-slate-100 print:border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 leading-tight">
          {data.parsedName || "Estúdio de Pilates"}
        </h3>
        <div className="bg-white text-brand-600 p-2 rounded-full shadow-sm print:hidden">
          <i className="fa-solid fa-spa"></i>
        </div>
      </div>
      
      <div className="p-5 flex-grow space-y-4">
        {/* Address */}
        <div className="flex items-start gap-3">
          <div className="w-5 text-center flex-shrink-0">
             <i className="fa-solid fa-location-dot text-brand-500 mt-1 print:text-slate-600"></i>
          </div>
          <div>
             <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Endereço</p>
             <p className="text-slate-700 text-sm">{data.parsedAddress || "Endereço não informado"}</p>
             {data.parsedAddress && (
               <a 
                 href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.parsedAddress)}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-xs text-brand-600 hover:text-brand-800 underline mt-1 inline-block print:no-underline print:text-slate-600"
               >
                 Abrir no Mapa
               </a>
             )}
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 gap-3 pt-2">
          {isValidLink(data.parsedPhone) && (
            <div className="flex items-center gap-3">
              <div className="w-5 text-center flex-shrink-0">
                <i className="fa-solid fa-phone text-brand-500 print:text-slate-600"></i>
              </div>
              <a href={`tel:${data.parsedPhone?.replace(/[^\d+]/g, '')}`} className="text-sm text-slate-700 hover:text-brand-600 font-medium truncate print:text-black">
                {data.parsedPhone}
              </a>
            </div>
          )}

          {isValidLink(data.parsedWebsite) && (
             <div className="flex items-center gap-3">
               <div className="w-5 text-center flex-shrink-0">
                 <i className="fa-solid fa-globe text-brand-500 print:text-slate-600"></i>
               </div>
               <a href={data.parsedWebsite} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:underline truncate max-w-[200px] print:text-black print:no-underline">
                 {data.parsedWebsite}
               </a>
             </div>
          )}
        </div>

        {/* Social Media Row */}
        {(isValidLink(data.parsedInstagram) || isValidLink(data.parsedFacebook)) && (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Redes Sociais</p>
            <div className="flex gap-2 print:flex-col print:gap-1">
              {isValidLink(data.parsedInstagram) && (
                <a 
                  href={data.parsedInstagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-pink-50 text-pink-700 hover:bg-pink-100 rounded-lg text-xs font-bold transition-colors print:bg-transparent print:p-0 print:text-black"
                >
                  <i className="fa-brands fa-instagram text-sm"></i> 
                  <span className="print:hidden">Instagram</span>
                  <span className="hidden print:inline">{data.parsedInstagram}</span>
                </a>
              )}
              {isValidLink(data.parsedFacebook) && (
                <a 
                  href={data.parsedFacebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors print:bg-transparent print:p-0 print:text-black"
                >
                  <i className="fa-brands fa-facebook text-sm"></i> 
                  <span className="print:hidden">Facebook</span>
                  <span className="hidden print:inline">{data.parsedFacebook}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="pt-2">
             <p className="text-xs text-slate-500 italic leading-relaxed bg-slate-50 p-2 rounded border border-slate-100 print:bg-transparent print:border-none print:p-0 print:text-slate-600">
               "{description}"
             </p>
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-3 text-center border-t border-slate-100 mt-auto print:hidden">
         <button 
            className="w-full py-2 bg-white border border-brand-200 text-brand-700 hover:bg-brand-50 hover:border-brand-300 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
            onClick={() => window.open(`https://www.google.com/search?q=Pilates+${data.parsedName || ''}+${data.parsedAddress || ''}`, '_blank')}
         >
           <i className="fa-brands fa-google"></i>
           Pesquisar no Google
         </button>
      </div>
    </div>
  );
};