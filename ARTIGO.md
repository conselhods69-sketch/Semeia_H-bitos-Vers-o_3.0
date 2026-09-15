# SEMEIANDO HÁBITOS 

**Grupo:** Fábio: 1118431947sp, Henry: 109161491xsp, Miguel P.: 1138901131sp e Matheus R.: 1110411273sp, José L.: 1251474068sp e Henrique Molino: 1091611002sp

**Escola:** E.E. PEI Brasílio Machado

**Curso:** Análise e Desenvolvimento de Sistemas – 3ª série do Ensino Médio

–––

## Resumo

O trabalho apresenta o Semeando Hábitos, um site de monitoramento de hábitos construído com HTML, CSS e JavaScript, com fontes de inspiração direto do GitHub, a partir de alguns projetos de código aberto (Repositórios públicos) e Google. A proposta deste projeto é facilitar o controle de rotinas de um jeito visual e prático, comparando a criação de um hábito ao cuidado com uma planta que começa como uma pequena semente e evolui, dia após dia, até se tornar uma árvore (desde que a pessoa mantenha a consistência). Quando um dia programado é esquecido, a planta murcha e a sequência é reiniciada, isso demonstra que é importante ter consistência. O sistema também oferece estatísticas de progresso, um mapa de calor de oito semanas, ranking de hábitos, conquistas por marcos de sequência e lembretes usando a API de Notificações do navegador, para incentivar o usuário a pegar firme no negócio.

**Palavras-chave:** Hábitos, Monitoramento, Consistência, Dia, Progresso.


## 1. Introdução

Formar um novo hábito é uma tarefa que exige repetição, paciência e disciplina, e é comum que as pessoas desistam por não conseguirem visualizar o próprio progresso. O Semeando Hábitos tem como propósito resolver esse problema: transformando o acompanhamento de rotinas em algo visual e recompensador, usando a metáfora de uma estufa onde cada hábito é representado por uma planta.
O usuário cadastra um hábito informando um nome, os dias da semana em que pretende praticá-lo e um horário de lembrete. A cada dia confirmado dentro do calendário planejado, a planta avança um estágio dentro de uma escala de oito fases, da semente até a árvore. Caso o usuário deixe de confirmar um dia programado seja por esquecimento ou desistência, a planta murcha e a sequência volta a zero, para em seguida recomeçar o ciclo de crescimento. Essa mecânica de recompensa e consequência é o coração do projeto e é o que diferencia o Semeando Hábitos de uma lista de tarefas comum.
Esta versão do projeto é um site totalmente estático, escrito apenas com `index.html`, `style.css` e `script.js`, e muita pesquisa noturna por motivos óbvios. Todos os dados do usuário são salvos diretamente no navegador, por meio do recurso `localStorage`, o que dispensa servidor, banco de dados ou conexão com a internet para funcionar (o único ponto negativo é que se fechar o navegador as informações não ficam salvas, mas isso é algo esperado de uma versão inicial).

## 2. Desenvolvimento

O desenvolvimento foi organizado em etapas, passo a passo, para prevenir que muitas ocorrências acontecessem:
1. **Levantamento de requisitos:** definição das funcionalidades essenciais (cadastro de hábitos, confirmação diária, crescimento da planta, estatísticas) e das regras de negócio (como e quando uma planta cresce ou murcha).
2. **Modelagem do estado da aplicação:** definição de como cada hábito seria representado na memória do sistema (nome, dias da semana, horário, sequência atual, melhor sequência, histórico de confirmações, estágio de crescimento e estado de murchamento). Todas essas informações foram estruturadas em um único objeto JavaScript e salvas no localStorage para garantir a persistência dos dados.
3. **Construção da interface (HTML/CSS):** criação da estrutura de abas (Estufa, Estatísticas e Conquistas), além do formulário de cadastro e dos cartões de cada planta. A identidade visual de uma estufa foi criada usando uma paleta de cores focada no verde (#2F6B4F), com tons de terracota (muito Mine) para os vasos e âmbar para o sol.
4. **Implementação da lógica (JavaScript):** desenvolvimento das funções de tempo (comparando datas no formato texto AAAA-MM-DD), das regras de agendamento por dias da semana e do cálculo de sequências e murchamento. Também foi feito o cálculo das estatísticas, como o total de confirmações, a taxa de consistência dos últimos 30 dias e o mapa de calor.
5. **Testes manuais:** Simulação de diferentes cenários de uso para validar o comportamento do sistema. Foram testados casos como: hábitos confirmados em dois dias seguidos, hábitos esquecidos e novos cadastros, garantindo que o visual das plantas, o murchamento e os gráficos funcionassem perfeitamente.
6. **Revisão e ajustes finos:** correções de pequenos detalhes de alinhamento visual, padronização de termos e melhorias na navegação entre as telas.

### 2.1 Ferramentas e tecnologias

- HTML: estruturação semântica das seções (cabeçalho, abas de navegação, formulário, cartões de hábito, painéis de estatísticas e conquistas) e uso de um `<template>` para gerar os cartões de planta dinamicamente (nnão foi tão difícil, já que são as aulas mais recentes do Nilton).
- CSS: variáveis de cor (`:root` com `custom properties`), `grid` e `flexbox` para o layout responsivo, `@media queries` para adaptação entre celular e desktop, e transições simples para as interações (aulas recentes).
- JavaScript: toda a lógica de estado, regras de crescimento/murchamento e persistência de dados foi escrita à mão, mas teve alguma coisas que teve que ser Ctrl C, Ctrl V (Nem lembro a quantidade).
- Web Storage API (`localStorage`): para persistir os hábitos do usuário diretamente no navegador, sem necessidade de servidor (não tava lembrando o que usar além da firebase, por isso a desistência).
- Notification API: para solicitar permissão ao usuário e emitir lembretes no horário configurado para cada hábito (uma pesquisa rápida no google forneceu essa ajuda).
- Git e GitHub: versionamento do código-fonte e hospedagem do repositório, permitindo o histórico de commits organizados por etapa de desenvolvimento (ter commits organizados ajudou no desenvolvimento do trabalho, valeu).

### 2.2 Funcionalidades implementadas

- Cadastro de hábitos com nome, dias da semana e horário de lembrete;
- Progressão da planta em 8 estágios (semente, broto, muda, crescimento, botão, floração, frutificação e árvore), calculada a partir da sequência de dias confirmados;
- Murchamento automático e reinício da sequência quando um dia programado é esquecido;
- Botão "Confirmar hoje" com contador de sequência atual e melhor sequência já alcançada;
- Cartões de resumo com confirmações totais, melhor sequência, consistência dos últimos 30 dias e número de hábitos ativos;
- Mapa de calor no estilo GitHub das últimas 8 semanas, com intensidade de cor proporcional à proporção de hábitos confirmados em cada dia;
- Ranking de hábitos ordenado pela sequência atual;
- Conquistas por marcos de sequência: 7 dias (Primeira Semana), 30 dias (Mês Completo), 66 dias (Hábito Formado) e 100 dias (Centurião);
- Lembretes via Notification API, configuráveis por hábito;

## 3 Considerações finais e conclusão
O Semeando Hábitos mostrou, na prática, que é possível construir uma aplicação web completa e visualmente rica utilizando apenas HTML, CSS e JavaScript, sem depender de frameworks ou de um backend. O projeto reforçou conceitos centrais do curso técnico em Desenvolvimento de Sistemas, organização de estado da aplicação, cálculo de datas e regras de negócio, além de trabalho em "equipe" e organização de código.
Do ponto de vista de produto, a metáfora da estufa se mostrou eficaz para tornar o acompanhamento de hábitos mais envolvente: o crescimento gradual da planta funciona como recompensa visível pela consistência, enquanto o murchamento comunica, de forma direta, o custo de negligenciar um compromisso. Como próximos passos, o grupo pretende avaliar a adição de fotos de confirmação, novas categorias de conquistas e a exportação dos dados do usuário, mantendo sempre a filosofia de simplicidade técnica que guiou esta terceira versão.

## Referências

MDN WEB DOCS. Notifications API. Disponível em: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API. Acesso em: 12 set. 2026.

MDN WEB DOCS. Window: localStorage property. Disponível em: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage. Acesso em: 12 set. 2026.

W3SCHOOLS. Disponível em: https://www.w3schools.com/. Acesso em: 07 ago. 2026.

GITHUB DOCS. Get started with GitHub. Disponível em: https://docs.github.com/pt/get-started. Acesso em: 11 set. 2026.
