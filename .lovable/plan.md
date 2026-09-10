# Área do Professor e criação de treinos

## Objetivo
Criar uma área autenticada para professores cadastrarem e compartilharem planos com qualquer quantidade de dias, mantendo o treino do aluno público pelo endereço `/aluno?id=<uuid>`.

## Experiência do professor
- Criar uma página de acesso com login pelo Google e saída segura da conta.
- Adicionar uma área protegida em `/professor` com cabeçalho, identificação da sessão e botão “Novo treino”.
- Exibir os treinos do professor em lista responsiva, com nome do aluno, quantidade de dias, data de criação e ação para copiar o link público.
- Paginar a listagem com estado na URL e seletor de 10, 20, 50 ou 100 itens por página.
- Criar `/professor/novo` com nome do aluno e um construtor de dias flexíveis: adicionar, remover e ordenar os dias do plano.
- Em cada dia, manter Força obrigatória e permitir ativar ou desativar Mobilidade e Metabólico.
- Exibir um catálogo pesquisável de exercícios; cada item poderá ser adicionado à seção ativa do dia.
- Permitir editar, em cada exercício escolhido, séries/repetições e tempo de descanso, além de remover ou reordenar o item.
- Validar os campos antes de salvar, mostrar mensagens claras e retornar à listagem após a criação.

## Experiência pública do aluno
- Mover o visual atual para `/aluno`, aceitando o UUID em `?id=` e mantendo o link salvo no dispositivo.
- Preservar navegação entre os dias flexíveis, checkboxes, timers, conclusão diária e calendário de histórico.
- Manter `/` como entrada simples: encaminhar um link de treino já salvo para `/aluno` e oferecer acesso do professor quando não houver plano.
- Buscar somente o plano público correspondente ao UUID; nenhuma ação de gestão ficará disponível nessa página.

## Dados e segurança
- Criar uma tabela de exercícios com nome, mídia e grupo muscular, populada com o catálogo existente do projeto.
- Criar uma tabela de treinos ligada ao professor, armazenando nome do aluno e os dias estruturados em JSON.
- Restringir criação, listagem, alteração e exclusão ao professor proprietário autenticado.
- Liberar para visitantes somente a leitura de um treino quando consultado pelo UUID compartilhado.
- Todas as operações protegidas também validarão a sessão no servidor; a proteção visual das páginas não será a única barreira.
- Manter o histórico atual por dispositivo e associá-lo ao treino/dia para evitar colisões entre planos diferentes.

## Detalhes técnicos
- Usar o fluxo de autenticação gerenciado do projeto, com retorno público e redirecionamento para `/professor` após a sessão ser confirmada.
- Criar a estrutura protegida padrão do TanStack para as páginas do professor e registrar o estado da sessão no cabeçalho.
- Implementar funções de servidor autenticadas para listar e criar treinos; usar leitura pública restrita para a página do aluno.
- Consultar o catálogo em lotes de 100, com busca textual feita no banco e carregamento incremental.
- Usar TanStack Query para carregamento inicial e atualização da lista após salvar.
- Reutilizar os componentes visuais, tokens pastel e controles existentes; adaptar a listagem para tabela no desktop e linhas empilhadas no celular.
- Adicionar metadados próprios às páginas públicas e privadas e estados de carregamento, vazio e erro.

## Validação
- Confirmar que visitante não acessa `/professor` nem executa operações protegidas.
- Confirmar login, criação de um plano com múltiplos dias, paginação e cópia do link.
- Abrir o link copiado sem sessão, validar todos os dias e registrar uma conclusão.
- Verificar telas mobile e desktop, erros em tempo de execução e compilação final.
