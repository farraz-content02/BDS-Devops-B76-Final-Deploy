# Fullstack WebApp - Budget Tracker on VPS

---

## 🔧 Development Language Selection (Based on VPS Constraints)

**👉 Prefered Language: Golang**

- [x] Single compiled binary → no runtime overhead
- [x] Perfect for low RAM VPS
- [x] Works cleanly with PostgreSQL

---

## 🏗️ Architecture Overview (Lightweight)

```text
[ Browser ]
     ↓
[ NGINX (reverse proxy + static UI) ]
     ↓
[ Go Backend API (binary) ]
     ↓
[ PostgreSQL ]
```

**Why this works:**

- [x] **NGINX** → efficient static file serving
- [x] **Go** → handles API (CRUD)
- [x] **PostgreSQL** → reliable storage
- [ ] Separation = easier DevOps lifecycle

#### Final Architecture Summary

| Layer           | Tool              |
| --------------- | ----------------- |
| Frontend        | HTML + CSS + JS   |
| Backend         | Golang (net/http) |
| DB              | PostgreSQL        |
| Server          | NGINX             |
| Process Manager | systemd           |

---

## 🏗️ Functionality Scopes (Lightweight)

- Frontend
  - [x] table
  - [x] modal form
  - [x] fetch API

- Backend
- Database
- Server (NGINX)
- Process Manager

---

## ⚡ Performance Notes (Important for VPS)

- [x] No framework → saves ~50–100MB RAM
- [ ] No bundler → faster **deploy**
- [ ] Use `net/http` only → minimal overhead
- [ ] Minimal DOM updates → faster UI
- [ ] No external CDN → fewer requests
- [ ] Avoid **ORM** → use raw SQL (you did this ✔)
- [ ] Keep **JSON** simple → no reflection-heavy libs

---

## 🧱 Project Structure (Clean but Lightweight)

- [x] Initial Structure

```bash
budget-app/
├── main.go
├── config/
│   └── db.go
├── entity/
│   └── transaction.go
├── repository/
│   └── transaction_repository.go
├── service/
│   └── transaction_service.go
├── handler/
│   └── transaction_handler.go
├── router/
│   └── router.go
```

- [x] Revised

```bash
budget-app-v2/
├── main.go
├── go.mod
├── config/
│   └── db.go
├── entity/
│   └── transaction.go
├── repository/
│   └── transaction_repository.go
├── service/
│   └── transaction_service.go
├── handler/
│   └── transaction_handler.go
├── router/
│   └── router.go
└── web/
    ├── index.html
    ├── style.css
    └── app.js
```

---

## 🧱 Running Database Engine (PostgreSQL)

- [x] Initial Structure

---

## 🧱 Running Backend Process (Golang)

- [x] Initial Structure

---

## 🧱 Running Frontend Process (Vanilla: HTML-CSS-JS)

- [x] Initial Structure

---

## 👉 Recommended Next Step (DevOps Survival Challenge)

You’re 80% there. Now you should:

- [ ] 1. Add **CORS** support (for frontend)
  - If frontend & backend in different domain.
- [ ] 2. Add **logging** middleware (request/response)
- [ ] 3. xxx
- [ ] 4. Add **monthly summary** endpoint (important for

Add these (high impact, still lightweight):

- [ ] Monthly Summary Endpoint
- [ ] total income
- [ ] total expense
- [ ] Pagination (limit 10 rows)
- [ ] Basic validation (frontend + backend)
- [ ] `Systemd` service (auto start)budget app)

---

## 🧪 Testing Flow

- [ ] 1. Open browser → http://YOUR_VPS_IP
- [ ] 2. Click + Add
- [ ] 3. Save data
- [ ] 4. Edit → update
- [ ] 5. Delete → verify

---

## 💡 Final Insight

You just built:

- ✅ SPA-like behavior
- ✅ Clean architecture backend
- ✅ Lightweight frontend
- ✅ Fully VPS-optimized system

---
