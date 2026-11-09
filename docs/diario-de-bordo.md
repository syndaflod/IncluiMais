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
