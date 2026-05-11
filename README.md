# BISTMind AI

BISTMind AI, BIST yatırımcıları için davranışsal finans koçu içeren AI destekli sanal trading platformudur.

## Yapı

- `frontend/` - React + Tailwind + Recharts ile dashboard
- `backend/` - FastAPI ile demo API

## Kurulum

### 1. Backend ayarları

`backend/.env.example` dosyasını kopyalayıp `backend/.env` oluşturun ve Gemini ile Firebase bilgilerini yapıştırın.

### 2. Frontend ayarları

`frontend/.env.example` dosyasını kopyalayıp gerekirse `VITE_API_URL` değerini düzenleyin.

### 3. Paketleri kurun

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

cd ..\frontend
npm install
```

## Çalıştırma

### Backend

```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm run dev
```

## Test Etme

1. `http://localhost:8000/health` adresini açın, servis `ok` dönmeli.
2. `http://localhost:8000/api/system` adresinde Gemini ve Firebase durumunu kontrol edin.
3. Frontend’i açıp dashboard’un yüklenmesini doğrulayın.
4. Quick Trade formundan bir BUY veya SELL işlemi gönderin.
5. İşlem sonrası portföy değeri, trade listesi ve davranış skorlarının güncellendiğini görün.
6. Gemini API key ve Firebase bilgileri doğruysa backend canlı entegrasyonla çalışır; değilse demo modda kalır.

## Not

Bu MVP yatırım tavsiyesi vermez. Amaç eğitim, simülasyon ve davranışsal farkındalıktır.
