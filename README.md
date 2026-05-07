# TeamFlow — Mini Jira

CENG316 Web Programming — Term Project  
Sunum Tarihi: 21 Mayıs 2026

TeamFlow, ekiplerin proje ve görevlerini birlikte yönetmesini sağlayan, Mini Jira benzeri bir web uygulamasıdır.

---

## Teknolojiler

- **Backend:** Node.js, Express.js
- **Veritabanı:** PostgreSQL
- **Auth:** JWT (Access + Refresh Token), bcrypt
- **Güvenlik:** Helmet, CORS, express-rate-limit

---

## Kurulum

### Gereksinimler

- Node.js >= 18
- PostgreSQL >= 14 (veya Docker)

### 1. Repoyu klonla

```bash
git clone https://github.com/<kullanici>/teamflow-backend.git
cd teamflow-backend
```

### 2. Bağımlılıkları yükle

```bash
npm install
```

### 3. Ortam değişkenlerini ayarla

```bash
cp .env.example .env
```

`.env` dosyasını açıp `DB_PASSWORD`, `JWT_SECRET` ve `REFRESH_SECRET` değerlerini güncelle.

### 4a. PostgreSQL'i manuel kur (Docker kullanmıyorsan)

```bash
psql -U postgres -c "CREATE DATABASE teamflow;"
psql -U postgres -d teamflow -f migrations/001_init_teamflow.sql
```

### 4b. Docker ile çalıştır (önerilen)

```bash
docker compose up -d
```

Bu komut PostgreSQL ve Node.js servislerini ayağa kaldırır.  
Migration dosyası (`001_init_teamflow.sql`) ilk çalıştırmada otomatik uygulanır.

---

## Çalıştırma

```bash
# Geliştirme (nodemon ile)
npm run dev

# Prodüksiyon
npm start
```

Sunucu varsayılan olarak `http://localhost:3000` adresinde çalışır.

Sağlık kontrolü:

```bash
curl http://localhost:3000/health
```

---

## API Endpoint'leri

### Auth

| Method | Endpoint             | Açıklama                             |
| ------ | -------------------- | ------------------------------------ |
| POST   | `/api/auth/register` | Kullanıcı kaydı                      |
| POST   | `/api/auth/login`    | Giriş — Access + Refresh Token döner |
| POST   | `/api/auth/refresh`  | Yeni Access Token al                 |
| POST   | `/api/auth/logout`   | Refresh Token'ı iptal et             |
| GET    | `/api/auth/me`       | Oturumu açık kullanıcı bilgileri     |
| PUT    | `/api/auth/profile`  | Profil güncelle                      |
| PUT    | `/api/auth/password` | Şifre değiştir                       |

> Auth gerektiren tüm isteklerde `Authorization: Bearer <access_token>` header'ı gönderilmeli.

---

## Proje Yapısı

```
teamflow-backend/
├── migrations/
│   └── 001_init_teamflow.sql
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── cors.js
│   │   └── passport.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── rbacMiddleware.js
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── utils/
│   │   ├── jwtService.js
│   │   ├── passwordHelper.js
│   │   └── responseHelper.js
│   └── validators/
│       └── authValidators.js
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
└── server.js
```

---

## Ortam Değişkenleri

| Değişken             | Açıklama                        | Örnek       |
| -------------------- | ------------------------------- | ----------- |
| `PORT`               | Sunucu portu                    | `3000`      |
| `DB_HOST`            | PostgreSQL host                 | `localhost` |
| `DB_PORT`            | PostgreSQL port                 | `5432`      |
| `DB_NAME`            | Veritabanı adı                  | `teamflow`  |
| `DB_USER`            | Veritabanı kullanıcısı          | `postgres`  |
| `DB_PASSWORD`        | Veritabanı şifresi              | —           |
| `JWT_SECRET`         | Access token imzalama anahtarı  | —           |
| `JWT_EXPIRES_IN`     | Access token süresi             | `15m`       |
| `REFRESH_SECRET`     | Refresh token imzalama anahtarı | —           |
| `REFRESH_EXPIRES_IN` | Refresh token süresi            | `7d`        |

---

## Ekip

| Kişi   | Alan                               |
| ------ | ---------------------------------- |
| Kişi A | Domain + Infrastructure + Auth API |
| Kişi B | Projects + Tasks + Labels API      |
| Kişi C | Sprint + Comments + Frontend       |
