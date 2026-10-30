# NZAO TRACKER

Painel Next.js + Supabase + Apify para acompanhar #nzao e #nzao10k.

## Escopo inicial
- Brasil (o filtro geográfico precisa ser aplicado pelo actor do Apify quando suportado; o código valida hashtag e período).
- Publicações de 05/09/2026 até 05/10/2026 (inclusive).
- Coleta programada de hora em hora.
- Vídeo armazenado uma única vez; cada execução grava um snapshot de métricas.
- Abas geral, #nzao e #nzao10k.

## 1. Criar o banco
1. Crie um projeto no Supabase.
2. Abra SQL Editor e execute `supabase/schema.sql`.
3. Copie Project URL e `service_role` key para as variáveis de ambiente da Vercel. A service role é secreta; nunca use prefixo NEXT_PUBLIC.

## 2. Configurar o coletor
1. Crie uma conta no Apify e escolha um actor de coleta de vídeos por hashtag.
2. Leia a documentação do actor escolhido: cada actor tem seu próprio formato de entrada e saída.
3. Configure `APIFY_TOKEN`, `APIFY_ACTOR_ID` e `APIFY_INPUT_JSON`.
4. O normalizador cobre nomes comuns de campos, mas pode precisar de adaptação ao formato real do actor.
5. Teste manualmente `GET /api/collect` com `Authorization: Bearer SEU_CRON_SECRET`.

**Importante:** esta é uma integração adaptável, não uma garantia de que qualquer actor tenha busca histórica ou filtro Brasil. Antes de pagar um actor, confirme que ele consegue buscar vídeos antigos publicados entre 05/09 e 05/10/2026 e devolver os IDs, datas, URLs e contagens. A busca por hashtag pode não retornar todos os vídeos.

## 3. Publicar na Vercel
1. Envie este projeto para um repositório GitHub.
2. Importe o repositório na Vercel.
3. Cadastre todas as variáveis de `.env.example` em Project Settings > Environment Variables.
4. Faça deploy. O cron da Vercel executa `/api/collect` de hora em hora em planos que oferecem Cron Jobs com essa frequência; confirme as limitações do seu plano.
5. Abra a URL pública do projeto.

## 4. Rodar localmente
```bash
cp .env.example .env.local
npm install
npm run dev
```

## Limitações e próximos passos
- O período solicitado está no passado; a recuperação depende da disponibilidade histórica do actor.
- Os números atuais obtidos numa busca retroativa não são os números que os vídeos tinham no dia da publicação.
- Para medir crescimento hora a hora, o sistema precisa estar coletando desde agora; snapshots passados não podem ser reconstruídos.
- O campo de região deve ser aplicado na busca do actor se ele suportar localização. Não se deve presumir que hashtag, sozinha, prove que um vídeo é do Brasil.
- A rota grava um snapshot por execução; para volumes grandes, usar paginação/lotes e processamento assíncrono.
- A coleta via terceiros deve respeitar os termos da plataforma e limites do provedor.
