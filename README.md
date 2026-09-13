# Semeando Hábitos

Site de monitoramento de hábitos no estilo de uma estufa: cada hábito que você cadastra nasce como uma semente e cresce, dia após dia, até virar uma árvore, desde que você mantenha a consistência. Se esquecer de confirmar um dia programado, a planta murcha e a sequência zera.

Projeto construído com **HTML, CSS e JavaScript**, e com ajuda de repositórios públicos de inspiração e o google. Todos os dados ficam salvos no `localStorage` do próprio navegador.

## Demonstração

Basta abrir o arquivo `index.html` em qualquer navegador moderno — não é necessário instalar nada nem rodar um servidor.

## Funcionalidades

- Cadastro de hábitos com nome, dias da semana e horário de lembrete.
- Cada hábito é uma planta com **8 estágios de crescimento**: semente, broto, muda, crescimento, botão, floração, frutificação e árvore.
- Botão **"Confirmar hoje"**, com contador de sequência e melhor sequência.
- Se um dia programado for esquecido, a planta murcha e a sequência volta a zero.
- Painel de **estatísticas**: confirmações totais, melhor sequência, consistência dos últimos 30 dias e hábitos ativos.
- **Mapa de calor** no estilo GitHub das últimas 8 semanas.
- **Ranking** de hábitos por sequência atual.
- **Conquistas** por marco de sequência: 7 dias (Primeira Semana), 30 dias (Mês Completo), 66 dias (Hábito Formado) e 100 dias (Centurião).
- **Lembretes** usando a Notification API do navegador.
- Layout **responsivo**, adaptado para celular e desktop.

## Estrutura do projeto

```
semeando-habitos/
├── index.html      # Estrutura da página (HTML)
├── style.css       # Estilos e responsividade (CSS)
├── script.js       # Toda a lógica da aplicação (JavaScript puro)
├── ARTIGO.md        # Artigo feito a pedido do professor, descrevendo o projeto
└── README.md        # Este arquivo
```

## Como os dados são salvos

O aplicativo usa a `localStorage` do navegador (chave `semeandoHabitos.v1`). Isso significa que:

- Os dados ficam salvos **apenas no navegador em que você usou o site** (então caso você feche o navegador, ele não salva, por ser um projeto inicial...).
- Limpar o cache/dados do navegador apaga o progresso.
- Não há envio de dados para nenhum servidor, tudo roda localmente.

## Regras de crescimento e murchamento

- Cada hábito tem dias da semana específicos em que deve ser confirmado.
- A cada dia programado confirmado **em sequência**, a planta avança um estágio (até o máximo de 8).
- Se um dia programado passar sem confirmação, a planta murcha, o estágio volta para "semente" e a sequência é zerada, mas a **melhor sequência** já alcançada continua registrada para fins de estatísticas e conquistas (e porque normalmente os usuários gostam).

## Tecnologias utilizadas

- HTML5 (elemento `<template>` para geração dinâmica dos cartões de planta)
- CSS3 (variáveis de cor, Grid, Flexbox, media queries)
- JavaScript 
- Web Storage API (`localStorage`)
- Notification API

## Licença

Projeto desenvolvido para a disciplina de Projeto Multidisciplinar do curso de ADS — Ensino Médio Integral, E.E. PEI Brasílio Machado.
