"""Basit script: dışarıdan bir URL'den BIST sembol listesi indirir ve `app/data/bist_symbols.txt`'e yazar.
Kullanım:
  python scripts/fetch_bist_list.py https://example.com/list.txt
veya ortam değişkeni BIST_SYMBOLS_URL ayarlanmışsa direkt çalıştırabilirsiniz.
"""

import sys
import os
from pathlib import Path
import httpx

DEFAULT_PATH = Path(__file__).resolve().parents[1] / 'app' / 'data' / 'bist_symbols.txt'


def main():
    url = None
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = os.getenv('BIST_SYMBOLS_URL')

    if not url:
        print("Lütfen simbol listesinin URL'sini argüman olarak verin veya BIST_SYMBOLS_URL ortam değişkenini ayarlayın.")
        return

    try:
        with httpx.Client(timeout=20.0) as client:
            r = client.get(url)
            r.raise_for_status()
            text = r.text

            import re

            # KAP sayfası çoğu zaman JSON içinde kaçışlı quote kullanıyor.
            # Önce bunu sadeleştirip sonra stockCode alanını çıkarıyoruz.
            normalized_text = text.replace('\\"', '"')

            # KAP sayfası, gömülü JSON içinde stockCode alanını taşıyor.
            # Bu alan doğrudan gerçek sembolleri verir.
            stock_codes = re.findall(r'"stockCode"\s*:\s*"([^"]+)"', normalized_text)
            codes = []
            for raw_code in stock_codes:
                for piece in raw_code.split(','):
                    code = piece.strip().upper()
                    if not code:
                        continue
                    # Sembol biçimi: harf/rakam içerebilir, boşluk içermez.
                    # Gürültülü token'ları ayıklamak için en az bir harf şartı koyuyoruz.
                    if re.fullmatch(r'[A-Z0-9]{2,8}', code) and re.search(r'[A-Z]', code):
                        codes.append(code)

            if codes:
                lines = sorted(set(codes))
            else:
                # Son çare: düz metin veya beklenmeyen formatlar için satır bazlı temizleme.
                lines = [l.strip().upper() for l in text.splitlines() if l.strip()]
                lines = [l for l in lines if re.fullmatch(r'[A-Z0-9]{2,8}', l) and re.search(r'[A-Z]', l)]

            # Kaydet
            DEFAULT_PATH.parent.mkdir(parents=True, exist_ok=True)
            DEFAULT_PATH.write_text('\n'.join(sorted(set(lines))), encoding='utf-8')
            print(f'Kaydedildi: {DEFAULT_PATH} (sayı: {len(lines)})')
    except Exception as e:
        print('İndirme hatası:', e)


if __name__ == '__main__':
    main()
