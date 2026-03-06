# Backend Structure (Refactored)

## Muc tieu
- To chuc lai backend theo layer ro rang, de bao tri va mo rong.
- Giu nguyen endpoint API hien tai de khong vo frontend.
- Them Swagger Bearer JWT de test API nhanh.

## Cau truc thu muc
```bash
backend/
├─ Controllers/
├─ Models/
│  ├─ Entities/
│  └─ Dtos/
├─ Data/
│  ├─ Contexts/
│  └─ Repositories/
├─ Services/
│  ├─ Interfaces/
│  └─ Implementations/
├─ Middleware/
├─ Migrations/
├─ Program.cs
└─ appsettings.json
```

## Vai tro tung layer
- `Controllers`: Nhan request/response HTTP, goi service.
- `Models/Entities`: Entity EF Core.
- `Models/Dtos`: Contract request/response cho API.
- `Data/Contexts`: `DbContext`.
- `Data/Repositories`: Truy cap du lieu qua `IBowlingLeagueRepository`.
- `Services`: Business logic theo module (BowlingLeague, Teams, Matches, Standings, Tournaments).
- `Middleware`: Xu ly loi toan cuc (ProblemDetails).

## Swagger + JWT
1. Chay backend:
```bash
dotnet run --project Backend.csproj
```
2. Mo Swagger:
- `https://localhost:7035/swagger`
- Hoac `http://localhost:5231/swagger`
3. Goi endpoint login:
- `POST /api/BowlingLeague/login`
4. Copy token tra ve.
5. Bam `Authorize` tren Swagger, nhap:
```text
Bearer <your_token>
```
6. Thu endpoint co `[Authorize]`.

## Middleware loi
- Da them `ExceptionHandlingMiddleware`.
- Loi unhandled se tra ve `application/problem+json` gom:
  - `status`
  - `title`
  - `detail`
  - `traceId`

## Checklist nhanh sau khi pull code
1. `dotnet build Backend.sln` phai thanh cong.
2. Swagger hien thi day du endpoint.
3. Login lay token thanh cong.
4. Swagger Authorize goi duoc endpoint bao ve.
5. Cac API chinh van chay:
   - Bowlers
   - Teams
   - Matches
   - Standings
   - Tournaments
