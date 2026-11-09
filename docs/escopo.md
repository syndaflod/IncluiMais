# Escopo do Projeto: IncluiMais

> Os itens marcados com **[preencher]** dependem de informações da equipe.

## 1. Identificação

- **Nome da equipe:** IncluiMais
- **Projeto/site:** IncluiMais
- **Integrantes:**
  - Antonio Dantas da Silva Neto (RGM 47788356)
  - Arthur de Jesus Salviano Oliveira (RGM 47764988)
  - Gustavo Frutuoso José (RGM 47604565)
  - Heitor Tureck de Oliveira (RGM 47104503)
- **Data:** 8 de novembro de 2026
- **Professor/disciplina:** Prof. Paulo Fratta, Front-End para Web (UNICID)

## 2. Contexto e justificativa

**Problema.** Pessoas com deficiência ou mobilidade reduzida muitas vezes só descobrem se um local tem rampa, banheiro adaptado, piso tátil ou atendimento em Libras ao ligar, perguntar ou chegar lá.

**Relevância.** Segundo o Censo 2022 do IBGE, o Brasil tinha 14,4 milhões de pessoas com deficiência, cerca de 7,3% da população com 2 anos ou mais. A falta de informação reduz a autonomia e a participação social.

**Sustentabilidade e impacto social.** O projeto se relaciona com:

- **ODS 10 (Redução das desigualdades):** amplia o acesso à informação para quem enfrenta barreiras.
- **ODS 11 (Cidades e comunidades sustentáveis):** torna visíveis as barreiras urbanas e ajuda a evitar deslocamentos frustrados.

## 3. Objetivos

**Geral.** Oferecer um site acessível, com um mapa de locais e recursos de acessibilidade no entorno da UNICID, que permita consultar informações e participar do projeto.

**Específicos.**

1. Publicar 10 páginas obrigatórias interligadas, com HTTPS e sem links quebrados.
2. Disponibilizar no mapa os 87 registros atuais de `data/locais.json`, com busca e filtros por 7 recursos de acessibilidade.
3. Validar os formulários com JavaScript, com mensagem de erro por campo.
4. Obter zero erros no W3C Validator nas 10 páginas obrigatórias.
5. Atingir contraste mínimo de 4,5:1 nos textos e permitir a navegação completa por teclado.

## 4. Público-alvo

- **Prioritário:** pessoas com deficiência física, visual ou auditiva e pessoas com mobilidade reduzida.
- **Também:** acompanhantes, estudantes, funcionários e visitantes da UNICID, moradores e comerciantes da região.
- **Faixa etária:** jovens e adultos a partir de 16 anos.
- **Localização:** região do Tatuapé, em São Paulo, como área piloto.
- **Necessidades específicas:** leitor de tela, teclado, ampliação de texto, alto contraste e apoio em Libras.

## 5. Escopo funcional

| Nº | Página | Função |
|---:|---|---|
| 1 | `index.html` | Apresentação do tema e menu principal |
| 2 | `sobre.html` | História, missão, visão, valores e equipe |
| 3 | `projetos.html` | Frentes de atuação do projeto |
| 4 | `impacto.html` | Indicadores e relação com sustentabilidade |
| 5 | `acessibilidade.html` | Recursos do mapa e medidas de inclusão do site |
| 6 | `galeria.html` | Imagens com legenda e fonte |
| 7 | `midia.html` | Vídeo, áudio e iframe |
| 8 | `noticias.html` | Conteúdos com fonte e filtro por tema |
| 9 | `contato.html` | Dados fictícios, formulário, apoio e equipe |
| 10 | `orcamento_hospedagem.html` | Comparativo de hospedagem e domínio |

**Páginas adicionais:** `mapa.html` (mapa, busca e filtros) e `cadastro_estabelecimento.html` (indicação de local).

**Funcionalidades:**

- Formulário de contato e voluntariado com validação em JavaScript.
- Área de apoio com voluntariado e doação demonstrativa.
- Preferências de fonte e contraste salvas com `localStorage`.
- Menu responsivo, navegação compartilhada e assistente de dúvidas com IA via função da Vercel e webhook do Make (FAQ em JavaScript como alternativa).

**Fora do escopo:** back-end além da função do chatbot, envio real de formulários, pagamentos, contas de usuário e publicação automática de indicações no mapa.

## 6. Escopo não funcional

- **Acessibilidade:** `alt`, contraste AA, teclado, leitores de tela, ARIA quando necessário, alto contraste, ajuste de fonte e VLibras.
- **Sustentabilidade:** conteúdo educativo, hospedagem estática e arquivos leves sempre que possível.
- **Responsividade:** adaptação a celular, tablet e desktop com Flexbox e Grid.
- **Desempenho:** ilustrações em SVG, dados compactados em `locais.json` e código sem frameworks.
- **SEO básico:** títulos, meta descrições e hierarquia de headings em cada página.

## 7. Mapa do site

```text
index.html
├── mapa.html
├── acessibilidade.html
├── cadastro_estabelecimento.html
├── contato.html (#apoie)
└── Mais
    ├── sobre.html
    ├── projetos.html
    ├── galeria.html
    ├── impacto.html
    ├── midia.html
    ├── noticias.html
    └── orcamento_hospedagem.html
```

**Fluxo principal:** início → mapa → filtros → detalhes do local → indicar local ou apoiar o projeto. As páginas compartilham o menu superior e, exceto `mapa.html`, o rodapé.

## 8. Conteúdo e identidade visual

- **Tom de voz:** direto, acolhedor e transparente sobre os limites dos dados.
- **Cores:** verde-escuro `#075c43`, verde `#087a50`, verde-claro `#b9f4d7`, fundo `#f6f8f2` e laranja de apoio `#a84e26`.
- **Tipografia:** Poppins (Google Fonts), com fontes do sistema como alternativa.
- **Logotipo:** `assets/icon.svg`.
- **Fontes de conteúdo e imagens:**
  - Dados geográficos: OpenStreetMap.
  - Mapa-base: OpenFreeMap/OpenMapTiles.
  - Ícones: Tabler Icons, Accesibiliconos e Material Design Icons (`assets/LICENSES.md`, `assets/icons/LICENSES.md` e `assets/accessibility/ATTRIBUTION.md`).
  - Galeria: ilustrações produzidas para o projeto com apoio de IA.
  - Notícias: fonte indicada em cada conteúdo.

## 9. Tecnologias e ferramentas

- HTML5, CSS3 e JavaScript puro.
- Leaflet e MapLibre GL JS.
- Git e GitHub.
- W3C Validator e Lighthouse.
- Assistentes de IA, com uso registrado em `docs/`.
- **Hospedagem:** Vercel (https://projetoincluimais.vercel.app).
- **Editor:** [preencher]

## 10. Cronograma e divisão de tarefas

| Data | Etapa |
|---|---|
| 23/09/2026 | Primeiro commit e mapa inicial |
| 28 e 29/10/2026 | Páginas institucionais e reorganização do site |
| [preencher] | Entrega do MVP |
| 08/11/2026 | Correções finais e escopo |
| 09/11/2026 | Envio no Blackboard e 1º dia de apresentações |
| 16/11/2026 | 2º dia de apresentações |

| Integrante | Páginas e funções |
|---|---|
| Antonio Dantas da Silva Neto | [preencher] |
| Arthur de Jesus Salviano Oliveira | [preencher] |
| Gustavo Frutuoso José | [preencher] |
| Heitor Tureck de Oliveira | [preencher] |

**Gestão de tarefas:** GitHub. Outras ferramentas: [preencher]

## 11. Riscos e restrições

- **Dados incompletos:** dos 87 registros, só os 2 da UNICID têm informação de acessibilidade. Os demais aparecem como “não informado”.
- **Navegação limitada:** o centro do mapa fica restrito a 100 m do ponto inicial, enquanto os dados vão até cerca de 1.000 m. Parte dos locais pode ficar fora da área visível.
- **Serviços externos:** mapa-base, bibliotecas, fontes e VLibras dependem de internet. O plano B é um vídeo ou prints da demonstração.
- **Sem back-end:** os formulários são demonstrativos e não enviam dados.
- **Vídeo:** o arquivo ainda não tem legendas.
- **Prazo e equipe:** tempo curto até 09/11 e necessidade de participação de todos os integrantes no repositório e na apresentação.

## 12. Critérios de aceitação

O site estará pronto quando:

- [ ] As 10 páginas abrirem pela URL publicada, com HTTPS e sem links quebrados.
- [ ] O W3C Validator não apontar erros nessas páginas.
- [ ] O formulário mostrar erros e borda em destaque, e aceitar dados corretos.
- [ ] As preferências de fonte e contraste continuarem após recarregar a página.
- [ ] A navegação só por teclado funcionar.
- [ ] O contraste atingir o nível AA e o layout funcionar no celular.
- [ ] Vídeo, áudio, iframe, galeria, notícias e área de apoio funcionarem.
- [ ] Todos os integrantes tiverem commits, e existir ao menos um pull request.
- [ ] A documentação em `/docs` estiver atualizada.

## 13. Aprovação

- **Responsável pela validação:** [preencher]
- **Data:** [preencher]
- **Assinatura:** [preencher]
