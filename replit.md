# MindTrade - Sistema de Gestão de Trading Esportivo

## Overview
MindTrade is a comprehensive sports trading management system designed for Brazilian users, developed entirely in Portuguese. Its purpose is to enable users to record pre-analyses, track operations with multiple items, generate financial performance reports, and conduct behavioral analysis. The system aims to provide a robust tool for managing and optimizing sports trading activities, offering detailed insights into performance and decision-making processes.

## User Preferences
I prefer that the agent focuses on completing the current task efficiently. I expect a concise summary of changes or progress, rather than verbose explanations. When suggesting code modifications or new features, prioritize solutions that integrate seamlessly with the existing architecture and maintain the current technology stack. For UI/UX enhancements, adhere to the established design patterns using Shadcn/ui and Tailwind CSS. Avoid making significant architectural changes without prior discussion and approval. I value clear, actionable steps and a pragmatic approach to problem-solving.

## System Architecture
The system is built as a full-stack application with a clear separation between frontend and backend.

**UI/UX Decisions:**
-   **Design System:** Utilizes Shadcn/ui and Tailwind CSS for a consistent and modern interface.
-   **Data Display:** Employs ultra-compact card layouts for lists (e.g., active matches, operation items) to maximize information density and improve readability, with horizontal scrolling for smaller screens where necessary.
-   **Forms:** Uses React Hook Form with Zod for robust validation and controlled inputs.
-   **Charts:** Recharts library is used for data visualization, including line graphs for daily profit/loss and cumulative evolution, and pie charts for market distribution.
-   **Localization:** All UI elements and content are in Portuguese, with financial values formatted to Brazilian standards (R$ X.XXX,XX) and dates as DD/MM/YYYY.

**Technical Implementations & Feature Specifications:**
-   **Core Entities (CRUD):** Management of Teams, Competitions, Markets, and Strategies with case-insensitive uniqueness validation and dependency-based deletion protection.
-   **Match & Pre-Analysis:**
    -   Detailed match registration.
    -   Comprehensive pre-analysis with multiple markets, odds, and expectations.
    -   Customizable options for pre-analysis fields (e.g., Moment, Must Win, Importance) stored in a central `opcoes_customizadas` table in the database.
    -   Automated match status management (PENDENTE, PRE_ANALISE, OPERACAO_PENDENTE, OPERACAO_CONCLUIDA, NAO_OPERADA).
-   **Operations:**
    -   Support for multiple items per operation, each tracking market, strategy, stake, odds, financial result, and exposure time.
    -   Flexible closing types (Automatic, Manual, Partial).
    -   Behavioral analysis fields (e.g., emotional state, motivation) with customizable options stored in the database.
    -   Operations are fully editable even after conclusion.
    -   Automatic cleanup of empty operations.
    -   Dedicated operation detail page (`/operacoes/:partidaId`) for comprehensive management.
-   **Automated Match Verification:** A 24-hour system to detect pre-analyzed but untraded matches, prompting user action (justify or operate).
-   **Reports & Dashboard:**
    -   Filtering capabilities by period, competition, team, market, and strategy.
    -   Key metrics: total profit, ROI, hit rate, average per operation.
    -   Analytical views: general, by market, by strategy, and behavioral.
    -   Dashboard displays 30-day overview, daily evolution, market distribution, recent operations, and behavioral ROI comparison.
-   **Financial Transactions:** CRUD for deposits and withdrawals, integrated into annual summaries.
-   **Annual Summary:** Provides aggregated yearly financial overview (profit, ROI, deposits, withdrawals) and a cumulative evolution graph by month.

**System Design Choices:**
-   **Backend:** Express.js with TypeScript, PostgreSQL database (via Neon) managed by Drizzle ORM. Zod schemas for input validation.
-   **Frontend:** React with TypeScript, Wouter for routing, TanStack Query for state management.
-   **Data Handling:** Numbers are validated via Zod and stored as PostgreSQL numeric. Dates are ISO in backend, DD/MM/YYYY in UI. Currency uses Brazilian format.
-   **Caching:** TanStack Query for data fetching and caching with specific invalidation strategies for mutations.
-   **Custom Options Management:** All customizable options for fields (e.g., pre-analysis, behavioral) are now stored in a dedicated `opcoes_customizadas` table in PostgreSQL, managed via specific API endpoints.

## External Dependencies
-   **Database:** PostgreSQL (hosted on Neon)
-   **ORM:** Drizzle
-   **Frontend Libraries:**
    -   React (UI framework)
    -   Wouter (Routing)
    -   TanStack Query (State management, data fetching/caching)
    -   Shadcn/ui (UI components)
    -   Tailwind CSS (Styling)
    -   Recharts (Charting library)
    -   React Hook Form (Form management)
    -   Zod (Schema validation for forms and API)
-   **Backend Libraries:**
    -   Express.js (Web framework)
    -   TypeScript (Language superset)
    -   Zod (Schema validation)