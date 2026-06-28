# 🏨 LuxStay — Hotel Reservation Management System

Full-stack hotel reservation system with Java Spring Boot backend and React frontend.

## Architecture

```
hotel-system/
├── backend/                    ← Spring Boot (Java 17)
│   ├── pom.xml
│   └── src/main/java/com/hotel/
│       ├── HotelApplication.java   ← Entry point + seed data
│       ├── model/
│       │   ├── Room.java           ← Room entity (5 types)
│       │   ├── Guest.java          ← Guest entity
│       │   ├── Reservation.java    ← Reservation entity
│       │   └── Payment.java        ← Payment entity
│       ├── repository/
│       │   └── Repositories.java   ← JPA repos (Room, Guest, Reservation, Payment)
│       ├── service/
│       │   └── HotelService.java   ← All business logic
│       └── controller/
│           └── HotelController.java ← REST API (@CrossOrigin)
└── frontend/                   ← React + Vite
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        └── App.jsx             ← Full UI (Dashboard, Rooms, Guests, Reservations)
```

## Running

### Backend
```bash
cd backend
mvn spring-boot:run
# Runs on http://localhost:8080
# H2 console: http://localhost:8080/h2-console
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/rooms | All rooms |
| GET | /api/rooms/available?checkIn=&checkOut= | Available rooms |
| POST | /api/rooms | Add room |
| GET | /api/guests | All guests |
| POST | /api/guests | Add guest |
| GET | /api/reservations | All reservations |
| POST | /api/reservations | Create booking |
| PATCH | /api/reservations/{id}/status | Update status |
| DELETE | /api/reservations/{id} | Cancel booking |
| POST | /api/reservations/{id}/pay | Process payment |
| GET | /api/reservations/{id}/payment | Get payment info |

## Features

- **Rooms**: 5 types (Single, Double, Suite, Deluxe, Penthouse), availability tracking
- **Guests**: Registration with email, phone, passport
- **Reservations**: Full lifecycle — Pending → Confirmed → Checked In → Checked Out
- **Payments**: Credit/Debit Card, Cash, Bank Transfer; auto-refund on cancel
- **Dashboard**: Live stats — bookings, revenue, occupancy
- **Database**: H2 in-memory (swap with MySQL/PostgreSQL via application.properties)

## Swap to MySQL

```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/hoteldb
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
```
