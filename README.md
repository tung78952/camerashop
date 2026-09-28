# CameraShop

Web bán máy ảnh, ống kính và phụ kiện quay chụp của nhiều hãng (Canon, Sony, Nikon, Fujifilm…).

> Đang phát triển: Giai đoạn 0 (dựng khung project).

## Tech stack

- **Backend:** Spring Boot 4, Java 21, Spring Data JPA, Flyway, PostgreSQL
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Hạ tầng:** Docker Compose

## Cấu trúc

```
backend/             Spring Boot REST API (cổng 8080)
frontend/            Next.js (cổng 3000)
docker-compose.yml   PostgreSQL (cổng 5432)
```

## Chạy ở máy

Yêu cầu: Docker Desktop, JDK 21+, Node.js 20+.

```bash
# 1. Tạo file biến môi trường rồi điền mật khẩu
cp .env.example .env

# 2. Bật PostgreSQL
docker compose up -d

# 3. Chạy backend (terminal 1)
cd backend
./mvnw spring-boot:run        # Windows: .\mvnw spring-boot:run

# 4. Chạy frontend (terminal 2)
cd frontend
npm install
npm run dev
```

Mở http://localhost:3000, trang chủ hiện `Backend: ok` là cả 3 service đã thông nhau.
Kiểm tra riêng backend: http://localhost:8080/api/health
