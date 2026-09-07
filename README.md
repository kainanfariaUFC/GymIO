# GymIO

Crie um site (web app) mobile-first, responsivo, para exibir minha rotina de treino semanal (Dia A e Dia B). O visual deve ser minimalista, com cores suaves (tons pastel, ex: azul acinzentado, verde sálvia, off-white, cinza claro), tipografia limpa e bastante espaço em branco. Nada de cores berrantes ou visual "academia pesada" — o estilo deve ser calmo, organizado e fácil de ler durante o treino, inclusive com a tela do celular em mãos suadas (textos grandes, botões com boa área de toque).

Estrutura da navegação

Bottom navigation fixa (estilo app mobile) com 2 abas:

Dia A

Dia B

Conteúdo de cada aba

Cada aba deve exibir o treino em cards colapsáveis (accordion), agrupados em 3 blocos, nesta ordem:

Bloco 1 — Aquecimento & Mobilidade (10 min)

Bloco 2 — Treino de Força Full Body (50-55 min)

Bloco 3 — Bloco Metabólico / Queima Calórica (15 min)

Cada exercício deve aparecer como um item de lista com:

Nome do exercício

Séries x repetições (ou tempo)

Grupo muscular entre parênteses

Um checkbox para marcar como concluído (o app deve guardar o progresso apenas durante a sessão, sem precisar de login)

Um indicador de progresso (barra ou "3/8 concluídos") deve aparecer no topo de cada aba, atualizando conforme os checkboxes são marcados.

Conteúdo completo — Dia A

Aquecimento & Mobilidade (10 min)

Mobilidade de tornozelo e quadril + Polichinelos + Agachamento livre solo — 2x10

Treino de Força Full Body (50-55 min)

Agachamento Livre com Barra ou Halter (ou Leg Press 45°) — 4x8-10 (Quadríceps/Glúteos)

Supino Reto com Halteres — 4x8-10 (Peitoral)

Puxada Alta Frontal na Polia — 4x10-12 (Costas)

Stiff com Halteres — 3x10-12 (Posterior de coxa/Glúteos)

Desenvolvimento de Ombros com Halteres — 3x10-12 (Ombros)

Rosca Direta no Pulley / Cabo — 3x12-15 (Bíceps)

Gêmeos em Pé — 4x15-20 (Panturrilha — máquina ou degrau com halter)

Prancha Abdominal Solo — 3x45-60seg (Core)

Bloco Metabólico (15 min)

Esteira em Inclinação ou Bicicleta Ergométrica (HIIT) — 8 a 10 tiros de 30s forte por 30s leve

Conteúdo completo — Dia B

Aquecimento & Mobilidade (10 min)

Mobilidade de quadril/torácica + Elevação de quadril solo — 2x12

Treino de Força Full Body (50-55 min)

Levantamento Terra RDL ou Terra Convencional — 4x8-10 (Cadeia posterior)

Remada Curvada com Barra ou Remada Baixa — 4x8-10 (Costas)

Supino Inclinado com Halteres — 4x10-12 (Peitoral Superior)

Cadeira Extensora — 3x12-15 (Quadríceps — movimento controlado)

Elevação Lateral de Ombros — 3x12-15 (Ombros)

Tríceps Corda na Polia — 3x12-15 (Tríceps)

Gêmeos Sentado na Máquina — 4x15-20 (Panturrilha — foco no sóleo)

Abdominal Infra no Banco / Paraleira — 3x15 (Core)

Bloco Metabólico (15 min) Circuito de Core & Cardio (3 rodadas):

Transport / Elliptical ou Remador — 3 min acelerado

Abdominal Remador — 15 a 20 reps

Polichinelo ou Corda — 45 seg

Funcionalidades extras

Um card/seção "Por que essa divisão funciona" no final de cada aba, com o texto explicativo sobre a alternância de bíceps/tríceps e o estímulo duplo de panturrilha (pode ser um accordion "Saiba mais", fechado por padrão, para não poluir a tela).

Cronômetro/timer simples embutido no bloco metabólico (HIIT e circuito), com botão de start/pause, já que ambos envolvem intervalos de tempo.

Botão "Reiniciar treino de hoje" que desmarca todos os checkboxes.

Ícones simples e discretos (ex: lucide-react) ao lado de cada grupo muscular para facilitar a leitura rápida.

Layout em coluna única, cards com cantos arredondados e sombra suave, tudo pensado para uso em pé, olhando o celular durante o treino na academia.

Estilo visual

Paleta: tons pastel (ex: sálvia #A8C3A0, azul poeira #A9C4D9, areia #F2EDE4, cinza grafite para textos)

Tipografia sem serifa, moderna, boa legibilidade em telas pequenas

Muito espaçamento entre elementos, sem poluição visual

Modo claro como padrão

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2ebeca75-e233-4d9c-a417-9ecbc227fc93).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
