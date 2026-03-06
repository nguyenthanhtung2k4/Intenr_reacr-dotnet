# React/.NET Application Example

This project is an example of a simple React app using a .NET backend. This project is easy to use and set up by doing the following steps:

1. Clone the repository with `git clone https://github.com/sethbr11/react-dotnet.git` in a terminal window.
2. Navigate inside the project folder and open another terminal window in the folder.
3. In one of the terminal windows, enter the backend folder and run `dotnet run` to start the backend part of the application.
4. In the other terminal window, enter the frontend folder. From there, run `npm install` to install all the dependencies needed to run the application.
5. In the same frontend folder, run `npm run start` to start the frontend part of the application. It should automatically open a browser window to the application displaying a table which pulls data from the .NET backend.

## Prerequisites
In order to run this project, you will need .NET installed on your computer as well as Node. Make sure these are in place first.

## Disclaimer
This is just an example app for the development side of things only. This is not suitable for production environments as is.

## Folder 
```  bash 
/Intenr_react-dotnet
=================== Back-End ===================

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


=================== Fornt-End ===================
├── .env                  # <--- FILE MỚI: Chứa Base URL
├── node_modules
├── public
├── src
│   ├── assets
│   ├── App.test.tsx
│   ├── App.tsx
│   ├── BLE-logo.png
│   ├── index.css
│   ├── index.tsx
│   ├── logo.svg
│   ├── react-app-env.d.ts
│   ├── reportWebVitals.ts
│   ├── setupTests.ts
│   ├── app
│   │   ├── AppShell.tsx
│   │   ├── providers.tsx
│   │   └── router.tsx
│   ├── context
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   ├── core
│   │   └── api
│   │       ├── httpClient.ts
│   │       └── index.ts
│   ├── modules
│   │   ├── accounts
│   │   │   ├── api/accountsApi.ts
│   │   │   ├── hooks
│   │   │   └── pages
│   │   │       ├── AccountDetailPage.tsx
│   │   │       ├── AccountFormPage.tsx
│   │   │       └── AccountListPage.tsx
│   │   ├── auth
│   │   │   ├── api/authApi.ts
│   │   │   └── pages
│   │   │       ├── LoginPage.tsx
│   │   │       └── LogoutPage.tsx
│   │   ├── bowlers
│   │   │   ├── api/bowlersApi.ts
│   │   │   ├── hooks
│   │   │   └── pages
│   │   │       ├── BowlerFormPage.tsx
│   │   │       └── BowlerListPage.tsx
│   │   ├── league
│   │   │   ├── api/leagueApi.ts
│   │   │   ├── components
│   │   │   │   ├── MatchResultModal.tsx
│   │   │   │   └── ScoreEntryModal.tsx
│   │   │   ├── hooks
│   │   │   └── pages
│   │   │       ├── LivePage.tsx
│   │   │       ├── MatchListPage.tsx
│   │   │       ├── StandingsPage.tsx
│   │   │       ├── TournamentDetailPage.tsx
│   │   │       └── TournamentListPage.tsx
│   │   └── teams
│   │       ├── api/teamsApi.ts
│   │       ├── hooks
│   │       └── pages
│   │           ├── TeamDetailPage.tsx
│   │           └── TeamListPage.tsx
│   ├── shared
│   │   ├── constants
│   │   ├── hooks
│   │   ├── layout
│   │   ├── Footer.tsx
│   │   └── Header.tsx
│   │   └── ui
│   │       └── Toast.tsx
│   ├── types
│   │   ├── Accounts.ts
│   │   ├── Bowler.ts
│   │   ├── Match.ts
│   │   ├── Standing.ts
│   │   ├── Team.ts
│   │   └── Tournament.ts
│   └── _deprecated
│   ├── App.css
│   ├── README.md
│   ├── component/Home
│   │   ├── Delete.tsx
│   │   └── style.css
│   └── modules/teams
│       └── TeamCreatePage.tsx
└── package.json
```


# db : 

```bash
Tên Lớp (File),Chức Năng (Vai trò là một bảng DB),Giải thích
Team.cs,Bảng Đội,"Lưu trữ thông tin về mỗi đội tham gia giải đấu (ví dụ: Tên đội, ID đội)."
Bowler.cs,Bảng Vận động viên Bowling,"Lưu trữ thông tin cá nhân của mỗi người chơi bowling (ví dụ: Tên, tuổi, ID đội mà họ thuộc về)."
Tournament.cs,Bảng Giải Đấu,"Lưu trữ thông tin về các sự kiện giải đấu tổng thể (ví dụ: Tên giải đấu, ngày bắt đầu, ngày kết thúc)."
TourneyMatch.cs,Bảng Trận Đấu của Giải Đấu,"Lưu trữ thông tin về các trận đấu cụ thể diễn ra trong một giải đấu (ví dụ: ID trận đấu, ID đội thắng, ID đội thua)."
MatchGame.cs,Bảng Trò Chơi (Game) trong Trận Đấu,"Lưu trữ thông tin chi tiết hơn về từng trò chơi/ván đấu (game) riêng lẻ trong một trận đấu (ví dụ: ID trận đấu, số game, điểm game, người thắng game)."
BowlerScore.cs,Bảng Điểm của Vận Động Viên,Lưu trữ chi tiết điểm số của một vận động viên bowling trong một game hoặc một khung (frame) cụ thể. Đây là bảng quan trọng để tính toán tổng điểm.


Tên Lớp (File),Chức Năng (Vai trò),Giải thích
BowlingLeagueContext.cs,Lớp Context của Entity Framework,"Lớp này là cầu nối chính giữa ứng dụng C# và cơ sở dữ liệu. Nó chứa các thuộc tính DbSet<T> cho mỗi bảng (ví dụ: DbSet<Bowler>) và quản lý các kết nối, truy vấn dữ liệu."
IBowlingLeagueRepository.cs,Interface của Repository,"Định nghĩa các phương thức mà ứng dụng cần để truy cập và thao tác với dữ liệu (ví dụ: GetBowlers(), AddMatchGame())."
EFBowlingLeagueRepository.cs,Triển khai Repository,"Lớp này triển khai giao diện IBowlingLeagueRepository, sử dụng BowlingLeagueContext để thực hiện các thao tác cơ sở dữ liệu thực tế (CRUD - Create, Read, Update, Delete)."
Accounts.cs,Bảng Tài Khoản,"Có thể là bảng lưu trữ thông tin người dùng của ứng dụng (ví dụ: Thông tin đăng nhập, vai trò), tách biệt với các vận động viên."



Tên Lớp (File),Chức Năng (Vai trò là một bảng DB),Giải thích
ZtblBowlerRating.cs,Bảng Xếp Hạng VĐV,"Lưu trữ các mức xếp hạng hoặc phân loại khác nhau cho các vận động viên (ví dụ: ""Novice"", ""Amateur"", ""Pro"")."
ZtblSkipLabel.cs,Bảng Nhãn Bỏ Qua,Có thể là bảng tra cứu cho các nhãn hoặc lý do cụ thể khi một game/match bị bỏ qua hoặc hủy bỏ.
ZtblWeek.cs,Bảng Tuần Lịch,"Lưu trữ thông tin về các tuần cụ thể trong mùa giải, thường được dùng để theo dõi lịch trình theo tuần."


``` 
