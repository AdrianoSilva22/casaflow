-- CasaFlow · schema PostgreSQL (Supabase)
-- Cole e execute no SQL Editor do Supabase.
-- A aplicação conecta só com DATABASE_URL + Prisma. Sem SDK Supabase.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('owner', 'member');
CREATE TYPE entry_type AS ENUM ('income', 'expense');
CREATE TYPE entry_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE responsible AS ENUM ('adriano', 'adrielle', 'both');
CREATE TYPE commitment_kind AS ENUM ('once', 'recurring', 'installment');
CREATE TYPE recurring_status AS ENUM ('active', 'inactive', 'closed');
CREATE TYPE plan_status AS ENUM ('active', 'closed');
CREATE TYPE notification_channel AS ENUM ('push', 'email', 'whatsapp');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');

-- ---------------------------------------------------------------------------
-- Família e usuários (login compartilhado agora; multi-usuário no futuro)
-- ---------------------------------------------------------------------------

CREATE TABLE families (
  id          TEXT PRIMARY KEY DEFAULT ('fam_' || substr(gen_random_uuid()::text, 1, 8)),
  name        TEXT NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'BRL',
  locale      TEXT NOT NULL DEFAULT 'pt-BR',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id               TEXT PRIMARY KEY DEFAULT ('user_' || substr(gen_random_uuid()::text, 1, 8)),
  family_id        TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  username         TEXT UNIQUE,
  password_hash    TEXT NOT NULL,
  role             user_role NOT NULL DEFAULT 'member',
  avatar_initials  TEXT NOT NULL,
  color            TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_family_id ON users(family_id);
CREATE INDEX idx_users_email ON users(email);

-- ---------------------------------------------------------------------------
-- Categorias
-- ---------------------------------------------------------------------------

CREATE TABLE categories (
  id          TEXT PRIMARY KEY DEFAULT ('cat_' || substr(gen_random_uuid()::text, 1, 8)),
  family_id   TEXT REFERENCES families(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (family_id, slug)
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- ---------------------------------------------------------------------------
-- Preferências
-- ---------------------------------------------------------------------------

CREATE TABLE settings (
  id          TEXT PRIMARY KEY DEFAULT ('set_' || substr(gen_random_uuid()::text, 1, 8)),
  family_id   TEXT NOT NULL UNIQUE REFERENCES families(id) ON DELETE CASCADE,
  theme       TEXT NOT NULL DEFAULT 'system',
  locale      TEXT NOT NULL DEFAULT 'pt-BR',
  currency    TEXT NOT NULL DEFAULT 'BRL',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Recorrentes e parcelamentos
-- ---------------------------------------------------------------------------

CREATE TABLE recurring_expenses (
  id            TEXT PRIMARY KEY DEFAULT ('rec_' || substr(gen_random_uuid()::text, 1, 8)),
  family_id     TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  amount        NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  due_day       INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  category      TEXT NOT NULL,
  responsible   responsible NOT NULL,
  status        recurring_status NOT NULL DEFAULT 'active',
  started_at    DATE NOT NULL,
  ended_at      DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recurring_family ON recurring_expenses(family_id);
CREATE INDEX idx_recurring_status ON recurring_expenses(status);

CREATE TABLE installment_plans (
  id                  TEXT PRIMARY KEY DEFAULT ('plan_' || substr(gen_random_uuid()::text, 1, 8)),
  family_id           TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  description         TEXT NOT NULL DEFAULT '',
  total_amount        NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
  installment_count   INTEGER NOT NULL CHECK (installment_count >= 2),
  installment_amount  NUMERIC(12, 2) NOT NULL CHECK (installment_amount > 0),
  first_due_date      DATE NOT NULL,
  responsible         responsible NOT NULL,
  category            TEXT NOT NULL,
  status              plan_status NOT NULL DEFAULT 'active',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_plans_family ON installment_plans(family_id);
CREATE INDEX idx_plans_status ON installment_plans(status);

-- ---------------------------------------------------------------------------
-- Lançamentos (única, ocorrência recorrente ou parcela)
-- ---------------------------------------------------------------------------

CREATE TABLE financial_entries (
  id                    TEXT PRIMARY KEY DEFAULT ('ent_' || substr(gen_random_uuid()::text, 1, 8)),
  family_id             TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  description           TEXT NOT NULL DEFAULT '',
  amount                NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  due_date              DATE NOT NULL,
  payment_date          DATE,
  type                  entry_type NOT NULL,
  status                entry_status NOT NULL DEFAULT 'pending',
  responsible           responsible NOT NULL,
  category              TEXT NOT NULL,
  notes                 TEXT NOT NULL DEFAULT '',
  commitment_kind       commitment_kind NOT NULL DEFAULT 'once',
  recurring_expense_id  TEXT REFERENCES recurring_expenses(id) ON DELETE SET NULL,
  installment_plan_id   TEXT REFERENCES installment_plans(id) ON DELETE SET NULL,
  installment_number    INTEGER,
  installment_count     INTEGER,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_entries_family ON financial_entries(family_id);
CREATE INDEX idx_entries_due_date ON financial_entries(due_date);
CREATE INDEX idx_entries_status ON financial_entries(status);
CREATE INDEX idx_entries_type ON financial_entries(type);
CREATE INDEX idx_entries_responsible ON financial_entries(responsible);
CREATE INDEX idx_entries_category ON financial_entries(category);
CREATE INDEX idx_entries_kind ON financial_entries(commitment_kind);
CREATE INDEX idx_entries_recurring ON financial_entries(recurring_expense_id);
CREATE INDEX idx_entries_plan ON financial_entries(installment_plan_id);
CREATE INDEX idx_entries_family_due ON financial_entries(family_id, due_date);

-- ---------------------------------------------------------------------------
-- Histórico de baixas
-- ---------------------------------------------------------------------------

CREATE TABLE payment_history (
  id                    TEXT PRIMARY KEY DEFAULT ('pay_' || substr(gen_random_uuid()::text, 1, 8)),
  family_id             TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  entry_id              TEXT NOT NULL REFERENCES financial_entries(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  amount                NUMERIC(12, 2) NOT NULL,
  paid_at               DATE NOT NULL,
  month_key             TEXT NOT NULL,
  kind                  commitment_kind NOT NULL,
  installment_label     TEXT,
  recurring_expense_id  TEXT REFERENCES recurring_expenses(id) ON DELETE SET NULL,
  installment_plan_id   TEXT REFERENCES installment_plans(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_family ON payment_history(family_id);
CREATE INDEX idx_payments_month ON payment_history(month_key);
CREATE INDEX idx_payments_entry ON payment_history(entry_id);
CREATE INDEX idx_payments_paid_at ON payment_history(paid_at);

-- ---------------------------------------------------------------------------
-- Notificações (estrutura pronta; envio ainda não implementado)
-- ---------------------------------------------------------------------------

CREATE TABLE notifications (
  id          TEXT PRIMARY KEY DEFAULT ('ntf_' || substr(gen_random_uuid()::text, 1, 8)),
  family_id   TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  entry_id    TEXT REFERENCES financial_entries(id) ON DELETE SET NULL,
  channel     notification_channel NOT NULL,
  status      notification_status NOT NULL DEFAULT 'pending',
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_family ON notifications(family_id);

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_families_updated_at BEFORE UPDATE ON families FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_recurring_updated_at BEFORE UPDATE ON recurring_expenses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_plans_updated_at BEFORE UPDATE ON installment_plans FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_entries_updated_at BEFORE UPDATE ON financial_entries FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Seed mínimo: família, login compartilhado e categorias
-- Senha demo: casaflow123
-- ---------------------------------------------------------------------------

INSERT INTO families (id, name) VALUES
  ('family_casaflow', 'Casa Adriano & Adrielle');

INSERT INTO users (id, family_id, name, email, username, password_hash, role, avatar_initials, color) VALUES
  ('user_adriano', 'family_casaflow', 'Adriano', 'adriano@email.com', 'silva',
   '$2b$10$hE4H8bTlqAw9EH2Rb2K4mOeD16OotGWB3Jl4QQW2j1Fd9e4pEsPXK', 'owner', 'AD', '#7C3AED'),
  ('user_adrielle', 'family_casaflow', 'Adrielle', 'adrielle@email.com', NULL,
   '$2b$10$hE4H8bTlqAw9EH2Rb2K4mOeD16OotGWB3Jl4QQW2j1Fd9e4pEsPXK', 'member', 'AR', '#06B6D4');

INSERT INTO settings (family_id) VALUES ('family_casaflow');

INSERT INTO categories (id, family_id, name, slug) VALUES
  ('cat_housing', 'family_casaflow', 'Moradia', 'housing'),
  ('cat_grocery', 'family_casaflow', 'Mercado', 'grocery'),
  ('cat_water', 'family_casaflow', 'Água', 'water'),
  ('cat_energy', 'family_casaflow', 'Energia', 'energy'),
  ('cat_internet', 'family_casaflow', 'Internet', 'internet'),
  ('cat_streaming', 'family_casaflow', 'Streaming', 'streaming'),
  ('cat_phone', 'family_casaflow', 'Telefone', 'phone'),
  ('cat_health', 'family_casaflow', 'Saúde', 'health'),
  ('cat_pharmacy', 'family_casaflow', 'Farmácia', 'pharmacy'),
  ('cat_education', 'family_casaflow', 'Educação', 'education'),
  ('cat_credit_card', 'family_casaflow', 'Cartão de Crédito', 'credit_card'),
  ('cat_financing', 'family_casaflow', 'Financiamento', 'financing'),
  ('cat_transport', 'family_casaflow', 'Transporte', 'transport'),
  ('cat_fuel', 'family_casaflow', 'Combustível', 'fuel'),
  ('cat_leisure', 'family_casaflow', 'Lazer', 'leisure'),
  ('cat_restaurant', 'family_casaflow', 'Restaurante', 'restaurant'),
  ('cat_travel', 'family_casaflow', 'Viagem', 'travel'),
  ('cat_investments', 'family_casaflow', 'Investimentos', 'investments'),
  ('cat_emergency_reserve', 'family_casaflow', 'Reserva de Emergência', 'emergency_reserve'),
  ('cat_other', 'family_casaflow', 'Outros', 'other');
