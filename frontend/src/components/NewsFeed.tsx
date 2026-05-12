import { useEffect, useState } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import { Panel } from './DashboardPanels';
import type { NewsItem } from '../types';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch(`${API}/api/news`);
        if (res.ok) {
          const data = await res.json();
          setNews(data);
        }
      } catch (error) {
        console.error('Haberler yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchNews();
    // Haberleri her 5 dakikada bir güncelle
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Panel title="Piyasa Haberleri" subtitle="Gerçek zamanlı ekonomi haberleri" icon={<Newspaper className="h-5 w-5" />}>
      <div className="space-y-3 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-arena-textMuted">
            Haberler yükleniyor...
          </div>
        ) : news.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-arena-textMuted">
            Haber bulunamadı.
          </div>
        ) : (
          news.map((item, index) => (
            <a 
              key={index} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block rounded-xl border border-arena-border p-4 hover:bg-arena-hoverBg transition-colors group"
            >
              <h4 className="text-sm font-semibold text-arena-text group-hover:text-arena-primary transition-colors pr-6 relative">
                {item.title}
                <ExternalLink className="absolute right-0 top-0.5 h-4 w-4 text-arena-textMuted opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="mt-2 text-xs text-arena-textSecondary line-clamp-2">
                {item.description}
              </p>
              <p className="mt-3 text-[10px] text-arena-textMuted uppercase font-medium tracking-wider">
                {new Date(item.pubDate).toLocaleString('tr-TR')}
              </p>
            </a>
          ))
        )}
      </div>
    </Panel>
  );
}
