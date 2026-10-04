# CasaFlow — Plano, arquitetura e roadmap

Produto: gestão financeira familiar do casal Adriano e Adrielle.  
Fase 1: validação de layout, UX, navegação e fluxos com **mocks**. Sem banco, sem Supabase, sem persistência de lançamentos.

## 1. Plano de ação

1. Definir nome, princípios e escopo da Fase 1.
2. Desenhar Clean Architecture com portas prontas para Prisma/PostgreSQL.
3. Estruturar pastas e contratos de API.
4. Materializar o Design System (tokens, componentes, documentação viva).
5. Implementar telas obrigatórias em mobile first.
6. Semear 24 meses de dados realistas.
7. Ligar frontend a Route Handlers + use cases.
8. Adiar Prisma e PostgreSQL para após aprovação visual.
9. Cobrir regras de domínio com testes.
10. Preparar PWA e caminho de deploy.

## 2. Contexto arquitetural

```txt
presentation   → app/, components/, features/, hooks/
application    → use cases e ports
domain         → entidades, enums, analytics
infrastructure → repositório em memória + Route Handlers
```

Fluxo atual:

`UI → TanStack Query → Route Handler → Use Case → Memory Repository → mocks`

Fluxo futuro:

`UI → TanStack Query → Route Handler → Use Case → Prisma Repository → PostgreSQL`

O domínio não conhece Next.js, Prisma ou Supabase. A autenticação atual é um login compartilhado com cookie httpOnly, já modelado como `User + Family`.

## 3. Justificativa técnica

| Tecnologia | Por quê |
| --- | --- |
| Next.js 16 LTS + App Router | Versão estável, backend no mesmo app, SEO e rotas modernas. |
| TypeScript | Contratos explícitos entre camadas. |
| Tailwind + componentes próprios estilo shadcn | Design system controlado, sem acoplar dezenas de primitivos agora. |
| Lucide + Framer Motion | Ícones consistentes e microinterações. |
| RHF + Zod | Formulários acessíveis e validados na borda. |
| Zustand | Preferências de UI (visão cards/tabela). |
| TanStack Query | Cache, loading e invalidação prontos para API real. |
| date-fns | Datas em pt-BR sem peso desnecessário. |
| Recharts | Gráficos exigidos com boa integração React. |
| Vitest + RTL | Testes rápidos de domínio e formulários. |
| Husky + lint-staged + Prettier | Qualidade no commit. |
| PWA própria | Install prompt, SW, cache e offline sem vendor lock. |
| Prisma depois, só `DATABASE_URL` | PostgreSQL portátil; zero SDK Supabase. |

## 4. Estrutura de pastas

```txt
src/
  app/                 rotas, layouts, Route Handlers, manifest
  components/          UI e layout
  features/            telas por capacidade
  domain/              regras puras
  application/         use cases e ports
  infrastructure/      memória (futuro: Prisma)
  services/            fachada HTTP
  hooks/               React Query
  stores/              Zustand
  validators/          Zod
  constants/           produto, categorias, navegação
  lib/                 utils, format, api
  types/               reexportações
  mocks/               seed de 24 meses
  styles/              via app/globals.css
  assets/              ícones públicos
  tests/               Vitest
```

## 5. Fluxo de navegação

```txt
/login
  └─ /dashboard
        ├─ /financas → /financas/nova → /financas/[id]
        ├─ /calendario
        ├─ /relatorios
        ├─ /parcelamentos
        ├─ /recorrentes
        ├─ /resumo
        ├─ /historico
        ├─ /perfil
        ├─ /configuracoes
        └─ /design-system
```

Mobile: bottom navigation + FAB de nova finança.  
Desktop: sidebar persistente.

## 6. Wireframes descritivos

### Login (360–414)

Logo, título, e-mail, senha, CTA full width, dica da demo, toggle de tema.

### Dashboard

Header com saudação do casal. Trilho horizontal de 8 cards. Grade de indicadores avançados. Charts empilhados; 2 colunas no desktop.

### Finanças

Busca + filtros. Lista em cards no mobile; tabela opcional no desktop. Paginação inferior.

### Nova / Editar

Formulário de uma coluna no mobile, duas no desktop. Máscara BRL, date picker, autofocus no nome.

### Calendário

Grade estilo Google Calendar, pontos coloridos, detalhe do dia abaixo.

### Relatórios

Perguntas do produto em cards + os mesmos gráficos do dashboard.

### Configurações / Perfil

Tema, toggles futuros de notificação, logout. Perfil com os dois membros.

## 7. Design System

Paleta obrigatória. Radius 1.5–2rem. Tipografia Plus Jakarta Sans. Números `tabular-nums`.  
Documentação viva em `/design-system`.

## 8. Modelagem futura (não implementar agora)

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  familyId  String
  family    Family   @relation(fields: [familyId], references: [id])
}

model Family {
  id       String            @id @default(cuid())
  name     String
  users    User[]
  entries  FinancialEntry[]
  settings Settings?
}

model FinancialEntry {
  id           String    @id @default(cuid())
  familyId     String
  name         String
  description  String
  amount       Decimal
  dueDate      DateTime
  paymentDate  DateTime?
  type         EntryType
  status       EntryStatus
  responsible  Responsible
  categoryId   String
  notes        String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model RecurringExpense {
  id        String   @id @default(cuid())
  familyId  String
  name      String
  amount    Decimal
  dueDay    Int
  status    RecurringStatus
}

model InstallmentPlan {
  id                String   @id @default(cuid())
  familyId          String
  name              String
  totalAmount       Decimal
  installmentCount  Int
  installmentAmount Decimal
  firstDueDate      DateTime
  status            PlanStatus
  installments      FinancialEntry[]
}

model PaymentHistory {
  id        String   @id @default(cuid())
  entryId   String
  amount    Decimal
  paidAt    DateTime
  monthKey  String
}

model Category { id String @id @default(cuid()); name String; slug String }
model Notification { id String @id; familyId String; channel String; sentAt DateTime? }
model Settings { id String @id; familyId String @unique; theme String; locale String }
```

Conexão apenas via `DATABASE_URL`. Sem Supabase Auth/Client/SDK.

Notificações futuras: push, e-mail, WhatsApp, alertas de vencimento.

## 9. Roadmap

| Etapa | Status |
| --- | --- |
| 1 Planejamento | Feito |
| 2 Arquitetura | Feito |
| 3 Estrutura | Feito |
| 4 Design System | Feito |
| 5 Fluxo das telas | Feito |
| 6 Wireframes | Feito |
| 7 Mock data | Feito |
| 8 Frontend | Em validação |
| 9 Backend mock (Route Handlers) | Feito |
| 10 Modelagem Prisma | Planejada |
| 11 PostgreSQL | Planejada |
| 12 Testes | Iniciada |
| 13 Deploy | Após aprovação visual |

## 10. Checklist da Fase 1

- [x] Login compartilhado
- [x] Dashboard com 8 cards e indicadores avançados
- [x] 5 gráficos
- [x] Finanças com busca, filtro, ordenação, paginação, cards e tabela
- [x] Cadastro e edição
- [x] Calendário mês/semana/dia
- [x] Relatórios
- [x] Configurações + tema persistido
- [x] Perfil do casal
- [x] PWA (manifest, SW, install, offline, ícones)
- [x] 24 meses de mocks
- [x] Parcelamentos com geração automática
- [x] Recorrentes com geração do novo mês
- [x] Baixa automática + histórico
- [x] Resumo do mês e projeção futura
- [ ] Aprovação visual do casal
- [ ] Prisma + PostgreSQL
