# Diário de bordo

> Os itens marcados com **[preencher]** dependem de informações da equipe.

## Decisões

### 09/11/2026: hospedagem na Vercel

O site foi publicado em https://projetoincluimais.vercel.app. A Vercel foi escolhida porque a integração com o Make é fácil, o uso é gratuito e a URL é personalizável.

### Divisão do trabalho

- **Antonio e Gustavo Frutuoso:** concepção do site e definição do conteúdo de cada página.
- **Heitor:** design, CSS e JavaScript.
- **Arthur:** chatbot com IA integrado ao Make.
- **Gustavo Reis:** slides da apresentação final.

Os detalhes estão na seção 10 do [escopo](escopo.md).

## Aprendizados e dificuldades

[preencher]

## Uso de IA

| Prompt | O que foi pedido | O que foi aceito | O que foi corrigido ou recusado |
|---:|---|---|---|
| 1 | Revisão do README | [preencher] | [preencher] |
| 2 | Ícones de acessibilidade e melhoria do popup | [preencher] | [preencher] |
| 3 | Prompt para criar `projetos.html` e `galeria.html` | [preencher] | [preencher] |
| 4 | Avaliação de UI/UX da barra de pesquisa | [preencher] | [preencher] |

**Ferramenta e data de cada prompt:** [preencher]

### Prompts usados

1. Revise o readme do incluimais https://github.com/syndaflod/IncluiMais veja o projeto inteiro
2. preciso de icones de acesibilidade do primeiro anexo como por exemplo entrada acessivel para botar num estabelicimento com cor caso for ativo e greyed out caso não tiver a acessibilidade, como posso fazer isso? existem icones/svgs que já fazem isso? Assim está o popup do incluimais de um estabelecimento tem como melhorar? faça um canvas.
3. Incluimais esta faltando projetos.html Contendo Projetos de sustentabilidade/impacto social e galeria.htmlcontendo Imagens com legendas e fontes, preciso de um prompt especificado para a criação dessas paginas com base no meu projeto
4. ao clicar na barra de pesquisa ela fica selecionada e muda de tamanho isso é um erro de ui/ux?

### Ajustes do mapa com Claude Code (09/11/2026)

**Ferramenta:** Claude Code, no app Claude para desktop. **Motivação:** preparar o mapa para a apresentação.

| Pedido | O que foi aceito | O que foi corrigido ou recusado |
|---|---|---|
| Deixar o cartão de um local sem recursos igual ao da UNICID | Ícones sempre nos mesmos 3 grupos, seja qual for o estado | A primeira versão não aparecia por causa do cache do navegador; foi preciso mudar a versão do script (`?v=`) |
| Marcar recursos fictícios em vários locais para a apresentação | 32 locais com dados de demonstração, registrados em `data/acessibilidade-demo.json` | A IA apontou que rodar `tools/compact-geojson.py` desfaria correções feitas à mão em `locais.json`; o script não foi rodado, e o aviso foi para o README |
| Remover o selo "×"/"?" dos ícones | Selo removido; o estado fica na cor, no `aria-label` e no `title` | A IA lembrou que, sem o selo, disponível e indisponível passam a se diferenciar só pela cor (WCAG 1.4.1); o selo continuou removido |
| Aumentar o zoom e permitir chegar a todos os locais | Zoom inicial 20 | O primeiro ajuste (raio de 1.050 m e zoom mínimo 15) mostrava a cidade inteira e foi recusado; ficou um retângulo em volta dos locais, com zoom mínimo calculado pela tela |
| Mostrar o segundo prédio da UNICID | O código juntava instituições de mesmo nome; agora locais com números de rua diferentes ficam separados | O endereço do segundo prédio (Rua Cesário Galeno, 475) foi preenchido pela IA e precisa ser confirmado |
| Abrir o cartão do lado com espaço quando o local está na borda | Cartão abre acima, abaixo, à esquerda ou à direita, com a seta apontando para o marcador | Testado no navegador com locais no topo, no meio e na borda direita |
| Atualizar a documentação conforme as entregas 1 e 2 | Checklist da entrega no README e o novo [`melhorias-mvp.md`](melhorias-mvp.md) | Os primeiros esqueletos encontrados eram de outra disciplina (banco de dados) e foram descartados; a IA usou os roteiros de Front-End enviados pela equipe |

**Reflexão:** as mudanças foram conferidas no navegador quando possível. Os dados de acessibilidade dos 32 locais são fictícios e estão identificados assim no README e no escopo.

### Auditoria e correções com Claude Code

Em 08/11/2026, o Claude Code foi usado para auditar o projeto com base nos roteiros, corrigir mídia, galeria, contato, CSS e acessibilidade, e redigir o escopo. As ilustrações da galeria também foram geradas nessa etapa.

## Testes no site publicado

Verificação manual informada pela equipe em 09/11/2026:

- `projetos.html` e `galeria.html` abrem.
- Vídeo, áudio e iframe carregam.
- O formulário de contato mostra erro por campo, como “Informe um e-mail válido, como nome@exemplo.com”.
- O filtro de notícias funciona.
- A opção “Apoie” aparece no menu e leva à área de apoio em Contato.
- O chatbot funciona.
