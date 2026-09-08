# VistorIA — Vistoria de Imóveis (Vite + React + TypeScript)

App de vistoria de imóveis da **PEREIRA Gestão Imobiliária**. Este pacote é a
versão em **TypeScript**, organizada em arquivos separados por funcionalidade,
com armazenamento offline (IndexedDB) e sincronização opcional com Supabase.

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).

```bash
npm run type-check   # confere os tipos sem gerar build (rode isso sempre que mexer no código)
npm run build        # build de produção
npm run preview      # testa o build localmente
```

**Dica:** depois de qualquer alteração, rode `npm run type-check` antes de `npm run dev`.
Como eu não tenho como compilar o projeto aqui na conversa pra testar de verdade,
esse comando é a sua rede de segurança — ele avisa na hora se algo ficou incoerente.

---

## Sobre a conversão para TypeScript

Segui uma tipagem **pragmática**, não a mais rígida possível — a ideia é pegar
os erros que mais acontecem na prática (nome de campo errado, esquecer de
tratar `null`, passar o tipo errado pra uma função) sem exigir anotar
absolutamente tudo. Configuração em `tsconfig.json`:

- `strict: false` e `noImplicitAny: false` → não te obriga a tipar cada
  variável, o que tornaria qualquer alteração futura mais lenta.
- `strictNullChecks: true` → esse eu mantive ativo de propósito, porque é o
  que mais evita erros reais tipo "tentei usar algo que podia ser `null`".
- Todo o modelo de dados (vistoria, ambiente, item, foto, medidor, chave...)
  está tipado em `src/types/inspection.ts` — esse arquivo é o coração da
  tipagem; qualquer campo novo que você adicionar na vistoria deve entrar lá também.

Sempre que for pedir ajuda a alguma IA para mexer no projeto, vale mencionar
"a tipagem é pragmática, não strict — mantenha assim" para não vir uma sugestão
de ativar `strict: true` que quebra meio projeto de uma vez.

---

## O que o aplicativo JÁ TEM (inventário completo)

**Vistorias**
- Criar, editar, finalizar/reabrir, excluir vistorias
- Ambientes com modelos prontos (Sala, Cozinha, Banheiro, Quarto, Garagem, etc.), "Checklist Completo" com 60 itens, e modelos personalizados criados por você
- Itens com estado (Novo/Bom/Regular/Ruim/Péssimo/Sem teste), campos técnicos específicos por tipo de item (Pia não mostra "Pintura", por exemplo), com opções pré-definidas editáveis (estilo VistoHouse)
- Fotos (tirar/enviar) e vídeos (gravar/enviar) por ambiente e por item, com compressão automática (1200px/80%) e aviso se a imagem já for pequena
- Marcação de avaria diretamente sobre a foto, com comentário
- Ambientes numerados automaticamente
- Interface em cascata (tudo minimizado, você vai abrindo o que precisa)

**Medidores, chaves e documentação**
- Água/Energia/Gás com concessionária, leitura e unidade pré-preenchidas
- Chaves (entrada, garagem, controle, tags + customizadas) com fotos e contador +/-/0
- Parecer técnico com anexo de qualquer tipo de arquivo
- Assinatura digital (vistoriador, locador, locatário) com espaço pra assinatura manual também
- Comparação automática entre duas vistorias (Entrada x Saída)
- QR code de acesso rápido à ficha do imóvel

**Laudo / PDF**
- Geração de laudo em aba própria, com visual "profissional" (cartões, cores, fotos ampliáveis)
- Compartilhar resumo por WhatsApp/apps nativos

**Infraestrutura**
- Tema claro/escuro
- Calendário com agendamento de vistorias e destaque visual
- Exportar/Importar vistorias completas (.json, com todas as fotos/vídeos/anexos embutidos)
- Armazenamento local em **IndexedDB** (via Dexie) — funciona 100% offline, sem limite baixo de espaço como o localStorage tinha
- Sincronização opcional com **Supabase** (login anônimo por aparelho + RLS), botão "Nuvem" pra enviar/baixar
- Lazy loading de imagens
- Código dividido em ~38 arquivos por funcionalidade, agora em TypeScript pragmático

---

## O que falta — minha opinião sincera, como dica

Isso é o que eu recomendaria priorizar, mais ou menos nessa ordem:

### 1. Fotos e vídeos ainda ficam em base64 dentro dos dados
Hoje, cada foto vira um textão base64 guardado junto com a vistoria (no
IndexedDB, e também no `.json` de exportação). Funciona, mas deixa tudo mais
pesado do que precisa. O ideal seria enviar os arquivos pro **Supabase
Storage** (um "bucket" de arquivos de verdade) e guardar só o link no banco.
Isso deixaria o app mais rápido, a exportação mais leve, e a sincronização
mais eficiente (hoje ela manda a vistoria inteira de novo a cada sync, mesmo
que só o texto tenha mudado).
→ **Prompt pra pedir ajuda:** *"Tenho um app Vite+React+TS com Supabase configurado
(ver src/lib/supabaseClient.ts). Hoje as fotos ficam em base64 dentro do
objeto Foto (src/types/inspection.ts). Quero migrar pra Supabase Storage:
criar um bucket 'vistoria-media', fazer upload das fotos existentes ao
sincronizar, e trocar Foto.src por uma URL do Storage."*

### 2. Falta autenticação de verdade (login com e-mail/senha ou Google)
Hoje uso login anônimo do Supabase — funciona bem pra um único
vistoriador/aparelho, mas se a PEREIRA Gestão Imobiliária tiver mais de uma
pessoa usando, cada uma teria seus dados isolados sem conseguir compartilhar
vistorias entre si. Vale considerar Supabase Auth com e-mail/senha (ou Google
de verdade, diferente do simulado que existiu antes) quando isso importar.
→ **Prompt:** *"Quero trocar o login anônimo do Supabase (src/lib/sync.ts)
por login de e-mail/senha real, mantendo o app funcionando offline-first com
IndexedDB como já está."*

### 3. Edge Function do PDF ainda não está publicada
O código já existe em `supabase/functions/generate-pdf/index.ts`, mas nunca
foi publicada (isso só dá pra fazer com acesso ao seu terminal/conta).
→ **Prompt:** *"Tenho uma Supabase Edge Function em
supabase/functions/generate-pdf/index.ts que ainda não publiquei. Me ajuda a
rodar `supabase login`, `supabase link` e `supabase functions deploy
generate-pdf` passo a passo?"*

### 4. Testes automatizados: zero até agora
Não existe nenhum teste no projeto. Pra um app que guarda dados importantes
(vistorias com valor legal/contratual), valeria a pena pelo menos testar as
funções mais críticas: `withDefaults` (migração de dados antigos),
`compressImageFile`, e a lógica de sincronização.
→ **Prompt:** *"Quero adicionar testes com Vitest pro meu projeto Vite+TS.
Comece pelas funções em src/data/inspectionModel.ts e src/utils/media.ts."*

### 5. React Query está configurado mas pouco usado
Ele só envolve as chamadas do botão "Nuvem" hoje. O carregamento normal das
vistorias ainda é feito "na mão" (useEffect + useState em App.tsx). Não é
urgente, mas se o app crescer, migrar esse carregamento pra dentro do React
Query traria cache automático e menos código repetido.

### 6. Sem paginação/limite na lista de vistorias
Se um dia você tiver centenas de vistorias, a tela inicial vai carregar todas
de uma vez. Hoje não é problema (poucas vistorias), mas é bom saber que existe
esse teto.

### 7. Sem confirmação antes de excluir uma vistoria
Hoje o botão de lixeira exclui direto. Um "tem certeza?" simples evitaria
perda de dados sem querer — é uma correção rápida e de baixo risco se quiser
que eu faça.

### 8. Design: pequenos refinamentos possíveis
O visual já está consistente (tema claro/escuro, cores, PDF bonito). Se
quiser evoluir mais, sugestões de baixo risco: um "toast" de confirmação
(em vez de mensagens de texto que somem sozinhas), um indicador de progresso
de preenchimento por vistoria (`"12 de 18 itens preenchidos"`), e ícones de
status maiores na lista para bater o olho mais rápido.

### Segurança — o que já está OK e o que observar
- ✅ RLS (Row Level Security) ativado no Supabase — cada aparelho só vê os
  próprios dados.
- ✅ Chave usada no app é a `anon`/`publishable` — segura de expor no navegador.
- ✅ `.env` está no `.gitignore` — não vai parar num repositório público sem querer.
- ⚠️ **Nunca** coloque uma chave `service_role` do Supabase em variável
  `VITE_...` — ela ignora toda a segurança do RLS. Isso só deve existir
  dentro de uma Edge Function (variável de ambiente do lado do servidor).
- ⚠️ Login anônimo não tem senha — qualquer pessoa que abrir o app nesse
  navegador acessa os dados daquele "usuário". Se o celular for
  compartilhado, vale considerar login de verdade (ver item 2 acima).

---

## Estrutura do projeto

```
src/
├── App.tsx                     # estado geral e navegação entre telas
├── types/inspection.ts         # todos os tipos de dados (comece por aqui)
├── vite-env.d.ts                # tipagem das variáveis de ambiente
├── components/
│   ├── CalendarWidget.tsx
│   ├── media/index.tsx          # câmera, vídeo, marcação de avaria
│   ├── SignaturePad.tsx
│   ├── TechField.tsx            # campos com opções editáveis
│   └── ...
├── views/
│   ├── ListView.tsx
│   ├── NewInspectionView.tsx
│   ├── DetailView/               # ambientes, medidores, chaves, comparação, parecer, assinatura
│   └── ReportView/               # laudo/PDF
├── data/                         # modelos de ambientes e opções pré-definidas
├── lib/                          # armazenamento (IndexedDB/Dexie), Supabase, sincronização
└── utils/                        # datas, compressão de imagem, ids

supabase/
├── schema.sql                    # tabela + políticas de segurança (rodar no SQL Editor)
└── functions/generate-pdf/       # Edge Function (ainda não publicada)
```

## Antes de rodar (Supabase)

1. No painel do Supabase: **Authentication → Providers → habilitar "Anonymous Sign-ins"**
2. **SQL Editor** → colar o conteúdo de `supabase/schema.sql` → Run
3. Pronto — o `.env` já vem com as credenciais do seu projeto

## Publicando (deploy do site)

Qualquer hospedagem de site estático funciona (Vercel, Netlify) — é rodar
`npm run build` e publicar a pasta `dist/`. Lembre de configurar
`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas variáveis de ambiente da
hospedagem também.
