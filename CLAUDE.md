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
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Estilização:** Tailwind CSS v4 (config via @theme inline no globals.css)
- **Banco de dados / Auth:** Supabase (SSR com @supabase/ssr)
- **Pagamento:** Stripe (recorrência mensal)
- **API de CNPJ:** BrasilAPI (gratuita, sem autenticação)
- **Fontes:** DM Sans + DM Mono (Google Fonts, via next/font)
- **Gráficos:** Recharts (AreaChart com curvas, gradiente limão)
- **Deploy:** Vercel
- **Middleware:** proxy.js na raiz (Next.js 16 usa proxy, não middleware)

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
--ink-20: #D6D6D6;        /* Bordas suaves */
--ink-10: #EBEBEB;        /* Bordas de cards */
--ink-06: #F3F3F3;        /* Fundos sutis, barras inativas */
--white: #FFFFFF;
--surface: #F7F7F5;       /* Background do dashboard */
--surface-alt: #E8E8E4;   /* Background das páginas de auth */
--red: #E05252;           /* Alertas de erro */
--red-bg: #FDF0F0;
```

### Paleta de status (nunca usar limão para status)
```css
/* Pendente - âmbar */
--status-pendente-bg: #FFF3CD;
--status-pendente-text: #7A5A00;

/* Pago - cinza neutro */
--status-pago-bg: #F3F3F3;
--status-pago-text: #8A8A8A;

/* Atrasado - vermelho */
--status-atrasado-bg: #FDF0F0;
--status-atrasado-text: #8B1A1A;
```

### Tipografia
- **DM Sans**: todos os textos (weights: 300, 400, 500, 600)
- **DM Mono**: CNPJ, valores monetários, porcentagens, datas numéricas
- Headings: font-weight 600, letter-spacing -0.03em
- Body: font-weight 400, line-height 1.6
- Labels de seção: font-size 11px, weight 500, letter-spacing 0.08em, uppercase, color #8A8A8A
- Valores grandes: font-size 32-48px, weight 700, DM Mono, letter-spacing -0.02em

### Logo
- Símbolo: quadrado 34x34px, border-radius 9px, fundo #D4E600, letra "G" bold #1C1C1C
- Nome: "Guiado" em DM Sans 600
- Sidebar escura: texto branco
- Fundo claro: texto grafite

---

## Design System Premium

### Filosofia visual
- Monocromia: grafite + limão. Nada mais.
- Limão aparece APENAS nos elementos de ação, destaque e identidade da marca
- Limão NUNCA em pills de status (usar paleta de status acima)
- Estética financeira premium: confiança, limpeza, precisão
- Sem sombras, sem gradientes (exceto glow decorativo na sidebar e painéis escuros)

### Padrão de cards
- Background: #FFFFFF
- Borda: 1px solid #EBEBEB (suave, quase invisível)
- Border-radius: 16px
- Padding: 24px 24px
- Header: label uppercase 11px #8A8A8A + pill/badge à direita
- Valor principal: DM Mono 32px bold #1C1C1C

### Padrão de páginas de auth (login, cadastro, esqueci-senha)
- Fundo: #E8E8E4
- Card branco centralizado, border-radius 24px
- Layout split-screen: formulário à esquerda + painel escuro à direita
- Painel escuro: background #1C1C1C, border-radius 20px, margin 12px interno
- Glow decorativo: radial-gradient com rgba(212,230,0,0.08-0.1)
- Cards internos do painel: rgba(255,255,255,0.07), borda rgba(255,255,255,0.08)
- Textos do painel: opacidades 0.2 (labels), 0.35 (secundário), 0.45 (CNPJ), 0.5 (destaque)
- Altura fixa do card: 660px (consistente entre login e cadastro)
- Inputs: padding 14px 16px, border-radius 12px, borda #EBEBEB
- Botão principal: bg #1C1C1C, text #D4E600, border-radius 12px (rounded-xl)
- Icone de olho para mostrar/ocultar senha
- "Lembrar de mim" checkbox + "Esqueceu a senha?" link na mesma linha

### Padrão da sidebar
- Posição: fixed, top 0, left 0, width 228px, height 100vh, z-index 20
- Background: #1C1C1C
- Glow decorativo: dois circulos radial-gradient limão sutis
- Nav items: padding px-4 py-2.5, border-radius 12px (rounded-xl)
- Item ativo: bg rgba(212,230,0,0.12), text #D4E600, borda rgba(212,230,0,0.08)
- Item inativo: text rgba(255,255,255,0.4)
- Seções: labels uppercase 10px, color rgba(255,255,255,0.2)
- Footer: card CNPJ com bg rgba(255,255,255,0.05), border-radius 14px
- Mobile (< 1024px): drawer com slide da esquerda, overlay rgba(0,0,0,0.4)

### Padrão do topbar
- Background: #F7F7F5 (mesmo do conteúdo, sem contraste)
- Borda: 1px solid #EBEBEB
- Sticky no topo (z-index 10)
- Mobile: hamburger menu, texto "Emitir nota" escondido (só ícone)
- Desktop: padding 20px 32px

### Padrão de pills de status
- Sempre com bolinha colorida (5-6px) antes do texto
- Font-size: 11px, weight 500, border-radius 99px, padding 3px 10px
- Usar cores da paleta de status (nunca limão)

### Animações
- Cards: fade-in escalonado (cardIn 0.5s, delay +0.08s por card)
- Página: fadeIn 0.4s ease-out
- Barra de progresso: transition width 1.4s cubic-bezier(0.22, 1, 0.36, 1)
- Inputs focus: borda #D4E600 + box-shadow glow limão 3px
- Botões: translateY(-0.5px) no hover, translateY(0.5px) no active
- Cards interativos: borda #D4E600 + translateY(-1px) no hover
- Toast: slide da direita (toastIn 0.3s)
- Skeletons: wave shimmer (skeletonWave 1.8s)
- Sidebar mobile: translateX slide 0.3s cubic-bezier

### Gráficos (Recharts)
- Tipo: AreaChart com curva monotone
- Linha: #D4E600, strokeWidth 2.5
- Fill: gradiente linear de rgba(212,230,0,0.25) para transparente
- Tooltip: bg #1C1C1C, text #D4E600, border-radius 10px
- Cursor hover: stroke tracejado #D4E600
- Dot ativo: fill #D4E600, stroke #FFFFFF, strokeWidth 2
- Eixos: sem linhas, ticks em #8A8A8A (X) e #D6D6D6 (Y)
- Grid: horizontal only, stroke #F3F3F3
- Toggle período: segmented control com bg #F3F3F3, ativo bg #FFFFFF

### Toast notifications
- Sucesso: bg #1C1C1C, text #D4E600, ícone check
- Erro: bg #FDF0F0, text #8B1A1A, ícone alerta
- Posição: fixed bottom-right, z-index 50
- Auto-dismiss: 3 segundos
- Animação: slide da direita

### Responsivo
- Mobile first nas páginas de auth (formulário full width, painel escuro hidden)
- Dashboard: sidebar drawer no mobile, grids adaptivos
- Breakpoints: md (768px) para grid 3 colunas, lg (1024px) para sidebar fixa

---

## Estrutura de Páginas

```
/ (landing page, pública)
/entrar (login)
/cadastro (signup)
/esqueci-senha (recuperação)
/dashboard (autenticado, página principal)
/dashboard/das (histórico e pagamento DAS)
/dashboard/faturamento (lançar e ver entradas)
/dashboard/obrigacoes (checklist de obrigações MEI)
/dashboard/documentos (hub de documentos e links)
/dashboard/notas (NFS-e, link pro emissor nacional)
/dashboard/conta (perfil, CNPJ e plano)
```

---

## Dashboard - Componentes principais

### 1. Barra de Limite Anual (hero)
- Mostra: valor faturado / R$ 81.000
- Barra de progresso 8px: limão normal, amarelo aos 75%, vermelho aos 90%
- Percentual grande (48px, weight 300) à direita
- Projeção e média mensal no rodapé
- Pill "R$ X restantes" em limão

### 2. Card DAS do Mês
- Accent line 3px #D4E600 no topo
- Valor em DM Mono 32px
- Countdown de dias para vencer (dia 20)
- Pill de status (usar paleta de status, com bolinha)
- Botão "Gerar boleto no PGMEI" (bg #1C1C1C, text #D4E600)
- Link: `https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao?cnpj={CNPJ_SEM_MASCARA}`

### 3. Card Faturamento do Mês
- Valor em DM Mono 32px
- Badge de variação (+X%) com ícone de tendência

### 4. Card Situação Cadastral
- Bolinha verde/vermelha (10px) + texto "ATIVA" ou status
- CNAE com descrição
- Badge "Receita Federal"

### 5. Gráfico de Faturamento (AreaChart)
- Curva suave monotone, gradiente limão
- Toggle 6/12 meses (segmented control)
- Tooltip premium (escuro com valor em limão)

### 6. Histórico de DAS
- Lista com ícone do mês (36x36, bg #F7F7F5, text 10px)
- Valor em DM Mono
- Pills de status com bolinha
- Link "Ver todos" para /dashboard/das

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

### RLS Policies necessárias
- profiles: select, insert, update (auth.uid() = id)
- faturamento: select, insert, delete (auth.uid() = user_id)
- das_payments: select, insert, update, delete (auth.uid() = user_id)

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
- Valor do DAS é fixo por categoria CNAE. Calcular localmente (lib/das-valores.js)
- Nunca emitir DAS nem nota. Sempre redirecionar pro portal oficial
- DASN (Declaração Anual) vence em maio de cada ano
- Parsing de datas: sempre via split("-") da string, nunca new Date() direto (evita bugs de fuso UTC)
- Usuário sem CNPJ: mostrar dashboard com dados fake positivos + blur overlay + card CTA

---

## Convenções de Código

- Componentes em PascalCase: `LimitBar.jsx`, `DasCard.jsx`
- Pastas por feature: `app/dashboard/`, `components/ui/`, `components/dashboard/`, `lib/`
- Variáveis CSS no `globals.css` com os tokens de cor via @theme inline
- Valores monetários sempre com `toLocaleString('pt-BR', {style:'currency', currency:'BRL'})`
- CNPJs sempre sem máscara ao chamar APIs, com máscara ao exibir (usar formatarCnpj de lib/utils.js)
- Nomes da BrasilAPI: usar extrairNome de lib/utils.js (remove CNPJ do início)
- Comentários em português
- Nunca usar travessão (—) em textos, código ou interface. Usar vírgula, ponto ou hífen (-) no lugar
- Nunca usar antítese na comunicação. Ser direto e afirmativo, sem construções do tipo "não X, mas sim Y" ou "ao invés de X, faça Y"
- Componentes compartilhados: ResumoCard, BlurOverlay
- Contextos: DashboardProvider (perfil/CNPJ), ToastProvider (notificações), SidebarProvider (mobile drawer)

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
