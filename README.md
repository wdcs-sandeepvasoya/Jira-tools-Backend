# Jira Tools Backend

A comprehensive Next.js application for managing users, teams, and Jira integrations with authentication and user management capabilities.

## 🚀 Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Prisma ORM** with MySQL database
- **JWT Authentication** with HTTP-only cookies
- **Password Hashing** with bcrypt
- **Jira Integration** for user import
- **User Management** with CRUD operations
- **Responsive Design** with modern UI

## 📋 Prerequisites

- Node.js 18+ 
- MySQL database
- Jira account with API access

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jira-tools-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL="mysql://user:password@localhost:3306/jira_tools"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   
   # Jira API
   JIRA_BASE_URL="https://your-domain.atlassian.net"
   JIRA_EMAIL="your-email@domain.com"
   JIRA_API_TOKEN="your-jira-api-token"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001)

## 📁 Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── users/             # User management & auth
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   └── [id]/          # Individual user operations
│   │   ├── teams/             # Team management
│   │   ├── myteams/           # My teams management
│   │   └── jira/              # Jira integration
│   ├── users/                 # User pages
│   ├── teams/                 # Team pages
│   ├── myteams/               # My teams pages
│   ├── login/                 # Login page
│   ├── register/              # Register page
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/
│   ├── tables/                # Table components
│   ├── forms/                 # Form components
│   └── Navigation.tsx         # Navigation component
├── lib/
│   ├── prisma.ts              # Prisma client
│   └── jwt.ts                 # JWT utilities
├── utils/
│   └── auth.ts                # Authentication utilities
└── prisma/
    └── schema.prisma          # Database schema
```

## 🔧 API Configuration

The application is configured to call an external API running on port 3000. The API URL can be configured using the `NEXT_PUBLIC_API_URL` environment variable.

### API Structure
- **Frontend**: Next.js app running on port 3001
- **Backend API**: External API running on port 3000
- **API Routes**: `/api/users/auth/*` for authentication endpoints

## 🔐 Authentication

### API Endpoints

- `POST /api/users/auth/register` - Register a new user
- `POST /api/users/auth/login` - Login user
- `POST /api/users/auth/logout` - Logout user

### Protected Routes

All API routes (except auth) require authentication. The `getCurrentUser()` utility function validates JWT tokens and returns the current user.

## 👥 User Management

### Features
- Create, read, update, and delete users
- Import users from Jira
- View user details and account information

### API Endpoints
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/[id]` - Get a specific user
- `PUT /api/users/[id]` - Update a user
- `DELETE /api/users/[id]` - Delete a user

## 🔗 Jira Integration

### Import Users from Jira
- `POST /api/jira/import-users` - Import users from Jira

The integration fetches users from Jira's REST API and syncs them with the local database, avoiding duplicates by email address.

## 🎨 UI Components

### Reusable Components
- **UserTable** - Display users in a table format
- **UserForm** - Create and edit user forms
- **TeamTable** - Display teams in a table format
- **TeamForm** - Create and edit team forms
- **MyTeamTable** - Display user's teams
- **MyTeamForm** - Create and edit user's teams

### Styling
- Built with Tailwind CSS
- Responsive design
- Modern UI with hover effects and transitions
- Success/error alerts for user feedback

## 🗄️ Database Schema

```prisma
model User {
  id          Int      @id @default(autoincrement())
  account_id  String?  @unique
  name        String
  email       String   @unique
  password    String?  // hashed for local auth
  accountType String?
  createdAt   DateTime @default(now())
}
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Make sure to set all required environment variables in production:
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL` (defaults to http://localhost:3000)
- `JIRA_BASE_URL`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting (recommended)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.
