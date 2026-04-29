# Nora Dashboard

ระบบ AI Project Management Dashboard สำหรับจัดการทีม NRP Agent ติดตาม requirements และ pipeline งาน

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Integrations:** Notion API, Anthropic SDK
- **Auth:** Session-based (middleware)

## Features

- **Pipeline Board** — ติดตาม ticket จาก Pending → In Progress → Done
- **Requirements Panel** — ดู/จัดการ requirements จาก Notion database
- **Team Workflow** — ภาพรวมสถานะทีม NRP (Iris, Zoe, Lena, Max, Riley)
- **Nora Briefing** — สรุปสถานะโปรเจกต์จาก AI
- **Goals / Skills / Freelance / Hire** — หน้า management เพิ่มเติม

## Getting Started

### Prerequisites

- Node.js 18+
- Notion integration token
- Notion Requirements DB ID

### Installation

```bash
npm install
```

### Environment Variables

สร้างไฟล์ `.env.local`:

```env
NOTION_API_KEY=secret_xxx
NOTION_REQUIREMENTS_DB_ID=xxx
DASHBOARD_PASSWORD=your_password
DASHBOARD_SESSION_SECRET=your_secret_key
```

### Run Development Server

```bash
npm run dev
# http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
app/
  ├── api/              # API routes (auth, requirements, roles)
  ├── pipeline/         # Pipeline board page
  ├── goals/            # Goals page
  ├── skills/           # Skills page
  ├── freelance/        # Freelance page
  ├── hire/             # Hire page
  ├── settings/         # Settings page
  ├── login/            # Login page
  └── page.tsx          # Dashboard home

components/
  ├── Sidebar.tsx
  ├── TopBar.tsx
  ├── DashboardShell.tsx
  ├── RequirementsPanel.tsx
  ├── TeamWorkflowPanel.tsx
  ├── NoraBriefing.tsx
  ├── AgentCard.tsx
  └── ...

lib/                    # Notion client, utilities
contexts/               # React contexts
```

## Deployment

Deploy ผ่าน Vercel — เชื่อมต่อ GitHub repo แล้วตั้งค่า environment variables ใน Vercel dashboard

```
NOTION_API_KEY
NOTION_REQUIREMENTS_DB_ID
DASHBOARD_PASSWORD
DASHBOARD_SESSION_SECRET
```
