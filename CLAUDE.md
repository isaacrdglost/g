# Guiado - Briefing do Projeto

## O que é o Guiado
SaaS web para MEI (Microempreendedor Individual) brasileiro. Resolve as 5 maiores dores do MEI:
1. Não sabe quando vai estourar o limite de faturamento anual (R$ 81.000)
2. Esquece de pagar o DAS todo mês (vence dia 20)
3. Não separa gastos pessoais dos gastos da empresa
4. Não entende as obrigações legais (DASN anual, etc.)
5. Burocracia confusa do gov.br

O produto NÃO emite DAS nem notas fiscais. Ele organiza, alerta e direciona o usuário pro portal correto com 1 clique.

---

## Stack
- **Framework:** Next.js (App Router)
- **Estilização:** Tailwind CSS
- **Banco de dados / Auth:** Supabase
- **Pagamento:** Stripe (recorrência mensal)
- **API de CNPJ:** BrasilAPI (gratuita, sem autenticação)
- **Fontes:** DM Sans + DM Mono (Google Fonts)
- **Deploy:** Vercel

---

## Identidade Visual

### Cores (usar sempre estas, nunca outras)
```css
--lime: #D4E600;          /* Acento principal, limão vivo */
--lime-dim: rgba(212,230,0,0.12); /* Fundo suave limão */
--lime-text: #6B7400;     /* Texto sobre fundo limão */
--ink: #1C1C1C;           /* Grafite, cor base */
--ink-80: #3A3A3A;
--ink-50: #8A8A8A;        /* Texto secundário */
--ink-20: #D6D6D6;        /* Bordas */
--ink-10: #EBEBEB;
--ink-06: #F3F3F3;        /* Fundos sutis */
--white: #FFFFFF;
--surface: #F7F7F5;       /* Background da página */
--red: #E05252;           /* Alertas de erro */
--red-bg: #FDF0F0;
```

### Tipografia
- **DM Sans**: todos os textos (weights: 300, 400, 500, 600)
- **DM Mono**: CNPJ, valores monetários, porcentagens, datas
- Headings: font-weight 600, letter-spacing -0.03em
- Body: font-weight 400, line-height 1.6

### Logo
- Símbolo: G bold com braço horizontal + vertical em limão (#D4E600)
- Nome: "Guiado" em DM Sans 600
- Sidebar escura: logo em limão
- Fundo claro: logo em grafite com braço limão

### Filosofia visual
- Monocromia: grafite + limão. Nada mais.
- Limão aparece APENAS nos elementos de ação e destaque
- Sidebar sempre escura (#1C1C1C)
- Cards brancos com borda 1px #D6D6D6
- Border radius: 12px nos cards, 8px nos elementos internos
- Sem sombras, sem gradientes

---

## Estrutura de Páginas

```
/ (landing page, pública)
/entrar (login)
/cadastro (signup)
/dashboard (autenticado, página principal)
/dashboard/das (histórico e pagamento DAS)
/dashboard/faturamento (lançar e ver entradas)
/dashboard/obrigacoes (calendário)
/dashboard/documentos
/dashboard/conta (perfil e plano)
```

---

## Dashboard - Componentes principais

### 1. Barra de Limite Anual (hero)
- Mostra: valor faturado / R$ 81.000
- Barra de progresso em limão
- Alerta amarelo aos 75%, vermelho aos 90%
- Projeção: "No ritmo atual, você atinge o limite em [mês]"

### 2. Card DAS do Mês
- Valor calculado por CNAE
- Countdown de dias para vencer (dia 20)
- Botão "Gerar boleto no PGMEI" → abre link com CNPJ preenchido
- Link mágico: `https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao?cnpj={CNPJ_SEM_MASCARA}`

### 3. Card Faturamento do Mês
- Soma das entradas lançadas no mês atual

### 4. Card Situação Cadastral
- Busca na BrasilAPI: `https://brasilapi.com.br/api/cnpj/v1/{cnpj}`
- Mostra: situação, CNAE, nome fantasia

### 5. Gráfico de Faturamento
- Barras mensais, últimos 6 ou 12 meses
- Monocromia: barras cinza, mês atual em limão
- Biblioteca: Recharts

### 6. Histórico de DAS
- Lista com status: Pago / Pendente / Atrasado
- Pills de status: âmbar #FFF3CD/#7A5A00 (pendente), cinza #F3F3F3/#8A8A8A (pago), vermelho #FDF0F0/#8B1A1A (atrasado)
- Limão reservado para identidade da marca, nunca para status

---

## Banco de Dados (Supabase)

### Tabela: profiles
```sql
id uuid references auth.users primary key
cnpj text
nome_fantasia text
cnae text
situacao text
plano text default 'free'  -- free | pro | anual
stripe_customer_id text
created_at timestamp default now()
```

### Tabela: das_payments
```sql
id uuid primary key default gen_random_uuid()
user_id uuid references profiles(id)
competencia date         -- mês/ano de referência
valor numeric
status text              -- pendente | pago | atrasado
data_pagamento date
created_at timestamp default now()
```

### Tabela: faturamento
```sql
id uuid primary key default gen_random_uuid()
user_id uuid references profiles(id)
mes date                 -- primeiro dia do mês
valor numeric
descricao text
created_at timestamp default now()
```

---

## Planos e Preços

| Plano | Preço | Acesso |
|-------|-------|--------|
| Free  | R$ 0  | Dashboard básico, CNPJ, barra de limite, DAS do mês atual |
| Pro   | R$ 39,90/mês | Tudo + histórico completo + faturamento + alertas por email |
| Anual | R$ 399/ano | Pro com desconto (~2 meses grátis) |

---

## Regras de Negócio

- O DAS vence sempre no dia 20 de cada mês
- Limite de faturamento MEI: R$ 81.000/ano
- Alertar em 75% (R$ 60.750) e 90% (R$ 72.900) do limite
- Valor do DAS é fixo por categoria CNAE. Calcular localmente
- Nunca emitir DAS nem nota. Sempre redirecionar pro portal oficial
- DASN (Declaração Anual) vence em maio de cada ano

---

## Convenções de Código

- Componentes em PascalCase: `LimitBar.jsx`, `DasCard.jsx`
- Pastas por feature: `app/dashboard/`, `components/ui/`, `lib/`
- Variáveis CSS no `globals.css` com os tokens de cor acima
- Valores monetários sempre com `toLocaleString('pt-BR', {style:'currency', currency:'BRL'})`
- CNPJs sempre sem máscara ao chamar APIs, com máscara ao exibir
- Comentários em português
- Nunca usar travessão (—) em textos, código ou interface. Usar vírgula, ponto ou hífen (-) no lugar
- Nunca usar antítese na comunicação. Ser direto e afirmativo, sem construções do tipo "não X, mas sim Y" ou "ao invés de X, faça Y"

---

## Tom e Linguagem do Produto

- Português brasileiro direto, sem juridiquês
- Como um amigo que entende de negócio
- Nunca usar termos contábeis sem explicar
- Exemplos de mensagens corretas:
  - "Você faturou R$ 4.200 esse mês"
  - "Seu DAS vence em 6 dias, não deixa passar!"
  - "Você já usou 59% do seu limite anual"
- Exemplos de mensagens erradas:
  - "Sua competência fiscal foi processada"
  - "Regularize suas obrigações tributárias"