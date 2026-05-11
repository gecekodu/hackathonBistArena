# BISTMind AI - Test ve Kullanım Kılavuzu

## Sistem Durumu

✅ **Backend**: FastAPI, 8000 portunda çalışıyor  
✅ **Frontend**: React + Vite, 5173 portunda çalışıyor  
✅ **Gemini**: Entegre, koçluk raporları üretiyor  
✅ **Firebase**: Firestore'a işlem snapshots kaydediyor  
✅ **GitHub**: `gecekodu/hackathonBistArena` reposunda yayında

---

## 1. Browser Test (Hızlı Kontrol)

### 1.1 Backend Health Check
```
GET http://localhost:8000/health
```
**Beklenen yanıt:**
```json
{"status": "ok", "service": "BISTMind AI API"}
```

### 1.2 Entegrasyon Durumu
```
GET http://localhost:8000/api/system
```
**Beklenen yanıt:**
```json
{
  "gemini": {
    "enabled": true,
    "model": "gemini-3.0-flash"
  },
  "firebase": {
    "enabled": true,
    "projectId": "bistarena"
  }
}
```

### 1.3 Dashboard Açma
```
http://localhost:5173
```
- Dashboard başar.
- Üst kısımda "Gemini: Hazır" ve "Firebase: Bağlı" görmeli.
- Portföy değeri ve davranış skorları görünür.

---

## 2. Trade İşlemi Test

### 2.1 Tarayıcıdan Test
1. Dashboard'u aç: `http://localhost:5173`
2. Sağ panelde "Quick Trade" formunu bul
3. BIST hissesi seç (ör: THYAO)
4. Yön seç: BUY
5. Adet gir: 50
6. "İşlemi Kaydet" tıkla

**Kontrol Noktaları:**
- Portföy değeri artmış mı?
- Trade listesi güncellenmiş mi?
- P/L (kâr/zarar) değişmiş mi?
- Davranış skorları değişmiş mi?

### 2.2 API ile Test
```bash
curl -X POST http://localhost:8000/api/trades \
  -H "Content-Type: application/json" \
  -d '{"symbol":"THYAO", "side":"BUY", "quantity":100}'
```

**Beklenen yanıt:** Güncellenmiş dashboard JSON'u

---

## 3. Gemini AI Coach Test

### 3.1 Çalışıp çalışmadığını kontrol
1. Dashboard'u aç
2. Üst sağda "Günlük Coach" kutusuna bak
3. Orada yazılı özet cümle Gemini tarafından generate edildi
4. Örnek: "Bugün profilin momentum trader çizgisine yakın..."

### 3.2 Farklı davranışlar test et
- 10 BUY işlemi yap (risk skoru yükselecek)
- Sonra hızlı SELL işlemleri yap (panic selling uyarısı gelmeli)
- Gemini özeti dinamik olarak güncellenecek

---

## 4. Firebase Persistence Test

### 4.1 Firestore'da Veri Kontrol
1. [Firebase Console](https://console.firebase.google.com) aç
2. bistarena projesini seç
3. Firestore Database > Collections
4. `trades` ve `portfolioSnapshots` koleksiyonlarını kontrol
5. Her işlem sonrası yeni belge eklenmiş mi gözlemle

### 4.2 Doğrulama
- 3-4 işlem yap
- `trades` koleksiyonunda 3-4 belge görmen lazım
- Her belgede: symbol, side, quantity, price, timestamp

---

## 5. Entegrasyon Stress Test

### 5.1 Hızlı Sırada İşlemler
```javascript
// Tarayıcı konsolu (F12) açıp çalıştır
for (let i = 0; i < 5; i++) {
  fetch('http://localhost:8000/api/trades', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      symbol: 'THYAO',
      side: i % 2 === 0 ? 'BUY' : 'SELL',
      quantity: 10 + i * 5
    })
  });
}
```

**Kontrol Etmeli:**
- Dashboard hızlı güncellenecek
- Davranış skorları değişecek
- Firebase'de tüm işlemler kaydedilecek
- Gemini özeti her seferinde yenilenecek

---

## 6. Profile Classification Test

### 6.1 Farklı Profiller Oluştur

**Conservative (Muhafazakar):**
- 2-3 adet az BUY işlemi
- 1 adet SELL
- İçişlemleri uzun aralıklarla yap

**Emotional Trader (Duygusal):**
- Hızlı arka arkaya 5+ BUY
- Sonra panic SELL
- Risk skoru > 70, Disiplin < 60

**Momentum Trader:**
- BUY sayısı > SELL
- Yüksek volatiliteli stoklar (THYAO, ASELS)
- Risk skoru 60-80

**Her profil değişiminde:**
- Dashboard'daki "Behavior Profile" kartı güncellenecek
- Gemini özeti davranış paternine göre değişecek
- Leaderboard badge değişecek

---

## 7. Hata Yönetimi Test

### 7.1 Yetersiz Nakit
```bash
curl -X POST http://localhost:8000/api/trades \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BIMAS", "side":"BUY", "quantity":10000}'
```
**Beklenen:** 400 hata, "Insufficient virtual cash"

### 7.2 Geçersiz Symbol
```bash
curl -X POST http://localhost:8000/api/trades \
  -H "Content-Type: application/json" \
  -d '{"symbol":"INVALID", "side":"BUY", "quantity":10}'
```
**Beklenen:** 404 hata, "Unknown BIST symbol"

### 7.3 Backend Kapalıyken Demo Mode
1. Backend'i kapat (Ctrl+C)
2. Frontend hala `http://localhost:5173` de çalışmalı
3. Trade işlemleri yerel demo modda işlenmeli
4. Portföy local memory'de update edilmeli

---

## 8. Performance Check

### 8.1 Load Time
- Dashboard açılışı < 2 saniye
- İşlem submit < 500ms
- Grafik render < 1 saniye

### 8.2 Network Panel (F12)
- `/api/dashboard` < 100ms
- `/api/trades` < 200ms
- CSS/JS bundle < 500 KiB

---

## 9. Ortam Değişkenleri Doğrulama

### Backend (.env)
```bash
cat backend/.env | grep GEMINI_API_KEY
cat backend/.env | grep FIREBASE_PROJECT_ID
```

**Doğrulama:**
- ✅ Gemini API key var ve boş değil
- ✅ Firebase Project ID var ve "bistarena" yazıyor
- ✅ Private key multiline format doğru

### Frontend (.env)
```bash
cat frontend/.env
```

**Doğrulama:**
- ✅ VITE_API_URL=http://localhost:8000

---

## 10. Full E2E Test Senaryosu

### Adım Adım Tamamlama
1. ✅ Backend health check geçer
2. ✅ Entegrasyon durumu "enabled: true" gösterir
3. ✅ Dashboard yüklenmiş
4. ✅ "Gemini: Hazır" gösterilir
5. ✅ "Firebase: Bağlı" gösterilir
6. ✅ Quick Trade'den 3 BUY işlemi yap
7. ✅ Portföy değeri +%10 artmış
8. ✅ Gemini özeti AI tarafından üretilmiş
9. ✅ Firebase'de 3 trade belge var
10. ✅ 2 SELL işlemi yap (panic scenario)
11. ✅ Davranış skorları güncellenmiş
12. ✅ Profil "Momentum Trader" veya "Emotional Trader"
13. ✅ GitHub repo'da tüm code var

---

## Troubleshooting

### Backend 8000 portunda başlamıyorsa
```bash
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Frontend 5173'te başlamıyorsa
```bash
npm cache clean --force
rm -r node_modules
npm install
npm run dev
```

### Gemini API Key hataları
- API key'in doğru olup olmadığını kontrol et
- [Google AI Studio](https://aistudio.google.com/app/apikey) dan yeni key al
- `.env` dosyasına yapıştır ve backend'i restart et

### Firebase connection hatası
- Firebase Console'da bistarena projesine gir
- Service Account JSON indir
- Private key `\n` ile uygun format kontrolü yap
- Database URL doğruysa kontrol et

---

## GitHub Repository

📦 **Repo:** https://github.com/gecekodu/hackathonBistArena

### İlk Push Tamamlandı
```
[main (root-commit) 3ec95c0] Initial commit: BISTMind AI hackathon MVP with Gemini and Firebase integration
 30 files changed, 4792 insertions(+)
```

### .gitignore Koruması
- ✅ `.env` dosyası GitHub'a gitmedi (güvenlik)
- ✅ `node_modules/` hariç tutuldu
- ✅ `__pycache__/` hariç tutuldu
- ✅ `.venv/` hariç tutuldu

---

## Sonraki Adımlar (MVP'den sonra)

1. **Authentication** - Firebase Auth ile giriş sistemi
2. **Persistent Leaderboards** - Firestore'da user ranking
3. **Real-time Market Data** - BIST API entegrasyonu
4. **Advanced Analytics** - Portfolio performance charts
5. **Webhook Notifications** - Davranış uyarıları
6. **Mobile App** - React Native

---

## İletişim ve Destek

🔧 **Teknik Sorunlar:** GitHub Issues
📧 **Geri Bildirim:** PR'lar açıkça hoşlanır
🚀 **Yeni Feature:** Discussion sekmesinde gözükün

**Happy trading! 📈**
