# IncluiMais

**Encontre lugares mais acessíveis.**

O IncluiMais é um projeto acadêmico sobre inclusão social e acessibilidade. Ele reúne informações sobre recursos de acessibilidade em estabelecimentos, incentiva contribuições da comunidade e ajuda pessoas a planejarem seus deslocamentos com mais autonomia. O mapa piloto cobre uma área próxima à Universidade Cidade de São Paulo (UNICID), na capital paulista.

## Links

- **Site publicado:** https://projetoincluimais.vercel.app
- **Repositório:** https://github.com/syndaflod/IncluiMais

## Documentos da entrega

| Documento | Conteúdo |
|---|---|
| [`escopo.md`](escopo.md) | Problema, público, requisitos, tecnologias, cronograma e divisão de tarefas |
| [`diario-de-bordo.md`](diario-de-bordo.md) | Decisões, divisão do trabalho e uso de IA |
| [`melhorias-mvp.md`](melhorias-mvp.md) | Pontos da 1ª entrega (MVP) e como foram resolvidos, com antes e depois |
| [`testes.md`](testes.md) | Validação W3C, Lighthouse, teclado, formulários e celular, com prints em [`evidencias/`](evidencias/) |
| [`orcamento.md`](orcamento.md) | Comparação de hospedagem e domínio |
| [`chatbot-make.md`](chatbot-make.md) | Integração do chatbot com o Make e a IA |
| [`mapa.md`](mapa.md) | Funcionamento e dados do mapa |

## Estado atual

O site está publicado na Vercel com 12 páginas, navegação compartilhada, mapa interativo, formulários com validação em JavaScript, chatbot com IA e recursos de acessibilidade.

Resultados dos testes em 09/11/2026: nenhuma página teve erro apontado pelo W3C Validator, e a página inicial teve nota **100 em acessibilidade** no Lighthouse. Os detalhes e as ressalvas estão em [`testes.md`](testes.md).

## Páginas

- `index.html`: página inicial, apresentação do problema e chamadas para as principais ações.
- `mapa.html`: busca de locais, categorias, filtros de acessibilidade e mapa interativo.
- `sobre.html`: contexto, problema, proposta, missão, visão e valores do projeto.
- `projetos.html`: projetos e áreas de atuação do IncluiMais, com objetivo e público de cada um.
- `galeria.html`: imagens com legenda e fonte, carregadas de `data/galeria.json`.
- `acessibilidade.html`: explicação dos recursos de acessibilidade exibidos no mapa.
- `impacto.html`: situação atual, indicadores, metas propostas e relação entre acessibilidade, participação social e sustentabilidade.
- `midia.html`: vídeo, áudio e iframe relacionados à UNICID.
- `cadastro_estabelecimento.html`: formulário para sugerir um novo estabelecimento.
- `noticias.html`: textos sobre inclusão, acessibilidade, tecnologia e participação social.
- `contato.html`: formulário de contato, sugestões e correções, além da área “Apoie”, com voluntariado e outras formas de ajudar.
- `orcamento_hospedagem.html`: comparação de opções de hospedagem e domínio.

O antigo mapa que estava no `index.html` foi transferido para `mapa.html`. O `index.html` funciona como entrada institucional do projeto.

## Funcionalidades

- Pesquisa de estabelecimentos por nome.
- Filtros por categoria, incluindo banheiros, restaurantes, lojas, estacionamentos, farmácias, academias, instituições de ensino e espaços de lazer.
- Filtros por entrada acessível, rampa acessível, banheiro acessível, estacionamento acessível, atendimento em Libras, piso tátil e material em braille.
- Lista de resultados sincronizada com os marcadores do mapa.
- Área piloto com locais em um raio de cerca de 1.000 metros do ponto inicial e mapa-base que acompanha o alto contraste.
- Ícones nos marcadores e nos indicadores de acessibilidade dos locais.
- Cartão do local com os 7 recursos sempre na mesma disposição (acesso: entrada, rampa e estacionamento; comunicação: Libras; orientação: piso tátil, braille e banheiro). O estado aparece pela cor: verde para disponível, vermelho para indisponível e cinza para não informado. O nome e o estado de cada recurso ficam no `aria-label` e no `title`.
- O cartão abre do lado do marcador que tem espaço: acima (padrão), abaixo quando o marcador está perto do topo, à direita quando está perto da borda esquerda e à esquerda quando está perto da borda direita. A seta sempre aponta para o marcador (`posicionarPopup` em `js/script.js`).
- A UNICID aparece com os dois prédios, um de cada lado da Rua Cesário Galeno (números 448 e 475). Locais com o mesmo nome e números de rua diferentes não são tratados como duplicados.
- Zoom inicial do mapa em 20 (máximo 20), para os marcadores e nomes de rua ficarem legíveis na abertura. A navegação fica presa a um retângulo em volta de todos os locais da área piloto (`LIMITES_AREA` em `js/script.js`), e o zoom mínimo fica um nível acima do que faria esse retângulo inteiro caber na tela, para os marcadores não ficarem pequenos demais. Se forem adicionados locais fora dele, é preciso ampliar `LIMITES_AREA`.
- Menu responsivo compartilhado entre as páginas e rodapé gerado por JavaScript.
- Atalhos para pular ao conteúdo, ao menu e ao rodapé.
- Indicador de página atual com `aria-current`.
- Ajuste do tamanho da fonte e modo de alto contraste, com a preferência salva no `localStorage`.
- Widget VLibras carregado pelo `js/site.js`.
- Formulários com validação em JavaScript, erro exibido em cada campo e mensagens com `aria-live`.
- Filtro de notícias por categoria.
- Chatbot com IA integrado ao Make por uma função da Vercel, com FAQ local como alternativa.
- Frase sobre as ODS 10 e 11 no rodapé de todas as páginas, exceto o mapa.

## Dados do mapa

O mapa carrega `data/locais.json`. Esse arquivo compacto é gerado a partir de `data/UNICID_2.geojson` pelo script `tools/compact-geojson.py`:

```bash
python tools/compact-geojson.py
```

Os dados geográficos vêm do OpenStreetMap. A disponibilidade dos recursos pode estar incompleta ou desatualizada; "não informado" não significa que o estabelecimento não ofereça o recurso.

**Dados de demonstração.** Além da UNICID, 32 locais (como Wayne Tattoo, A+ Fitness, Chapadão, CIC, os três Oxxo e os Terminais Urbanos Carrão Norte e Sul) receberam recursos de acessibilidade fictícios para a apresentação. Essas marcações não vêm de vistoria nem do OpenStreetMap. Elas estão aplicadas em `data/locais.json` e registradas em `data/acessibilidade-demo.json`, que o `tools/compact-geojson.py` aplica sobre o GeoJSON ao gerar o arquivo. Para tirar a demonstração, remova as entradas desse arquivo e as tags correspondentes de `locais.json`. Os dois terminais não existem em `UNICID_2.geojson`; eles foram incluídos direto em `locais.json`.

Atenção: `data/locais.json` também tem correções feitas à mão (por exemplo, "Rua Cesário Galeno" no lugar de "Cesário Galero") que não existem em `UNICID_2.geojson`. Rodar o script agora desfaz essas correções; leve-as para o GeoJSON antes de gerar de novo.

## Chatbot

O chatbot da página inicial (`js/site.js`) envia cada pergunta à função `api/chat.mjs` da Vercel. Ela repassa a pergunta a um webhook do Make, cujo cenário chama um modelo de IA e devolve a resposta em texto.

A URL do webhook fica na variável de ambiente `MAKE_WEBHOOK_URL`, e a chave da API de IA fica na conexão do Make. Nenhuma delas vai para o JavaScript enviado ao navegador. Se a função falhar ou não estiver disponível, como no `python -m http.server`, o chatbot responde com o FAQ local por palavras-chave.

As perguntas digitadas no chat saem do navegador e passam pela Vercel, pelo Make e pelo serviço de IA. O passo a passo e o prompt estão em [`chatbot-make.md`](chatbot-make.md).

## Formulários

`cadastro_estabelecimento.html` e `contato.html` usam `novalidate` e validação em JavaScript. Os campos mantêm os atributos HTML5 (`required`, `email`, `tel`, `pattern`) e `label` associado. Ao enviar, cada campo inválido mostra a própria mensagem de erro, como “Informe um e-mail válido, como nome@exemplo.com”.

No estado atual, os formulários são demonstrativos: a validação e a mensagem de confirmação acontecem no navegador, sem envio para um servidor e sem armazenamento dos dados. Para uma versão publicada, será necessário conectar os formulários a um backend, serviço de formulário ou endpoint serverless.

## Tecnologias

- HTML5 semântico, CSS3 e JavaScript puro, sem frameworks.
- Leaflet e MapLibre GL JS para o mapa.
- OpenStreetMap para os dados geográficos e OpenFreeMap/OpenMapTiles para o mapa-base.
- GeoJSON para os dados dos estabelecimentos.
- Google Fonts (Poppins) para a tipografia e VLibras para apoio à tradução em Libras.

## Como executar

É necessário ter Python 3 instalado. Na pasta do projeto, inicie um servidor local:

```bash
python -m http.server 8000
```

Abra [http://localhost:8000](http://localhost:8000) no navegador. O servidor local permite que o mapa carregue os arquivos de dados. Os serviços de mapas e algumas bibliotecas externas precisam de conexão com a internet.

## Estrutura

```text
IncluiMais/
├── index.html
├── mapa.html
├── sobre.html
├── projetos.html
├── galeria.html
├── acessibilidade.html
├── impacto.html
├── midia.html
├── cadastro_estabelecimento.html
├── noticias.html
├── contato.html
├── orcamento_hospedagem.html
├── api/
│   └── chat.mjs
├── assets/
│   └── accessibility/
├── css/
│   ├── site.css
│   └── style.css
├── data/
│   ├── acessibilidade-demo.json
│   ├── galeria.json
│   ├── locais.json
│   └── UNICID_2.geojson
├── docs/
│   └── evidencias/
├── js/
│   ├── accessibility-init.js
│   ├── locais-dados.js
│   ├── script.js
│   ├── projetos-data.js
│   ├── projetos.js
│   ├── galeria.js
│   └── site.js
└── tools/
    └── compact-geojson.py
```

## Checklist da 2ª entrega

Situação em 09/11/2026, conforme o checklist do roteiro da 2ª entrega (AV A1).

| Item do roteiro | Situação |
|---|---|
| Site abre pela URL publicada, com HTTPS, no computador e no celular | Feito ([`testes.md`](testes.md)) |
| As 10 páginas funcionam online, sem links quebrados | Feito |
| W3C Validator sem erros nas 10 páginas | Feito; repetir `mapa.html`, `projetos.html` e `orcamento_hospedagem.html` na versão publicada |
| Formulário validado com JavaScript e dados mantidos com `localStorage` | Feito; o `localStorage` guarda o alto contraste e o tamanho da fonte |
| Navegação completa só com teclado | Feito pela equipe |
| Todos os integrantes têm commits no GitHub; existe pelo menos um pull request | **Pendente:** só Heitor (syndaflod) e Gustavo Reis (GustaDoBronx) têm commits, e o repositório não tem nenhum pull request |
| Pontos do MVP corrigidos e listados com antes e depois | Lista em [`melhorias-mvp.md`](melhorias-mvp.md); faltam os prints de antes e depois |
| Uso de IA registrado no diário de bordo | Em andamento; faltam o que foi aceito e corrigido nos prompts 1 a 4 |
| README, diário, escopo, orçamento e evidências de testes em `/docs` | Feito; o diário e o escopo ainda têm campos **[preencher]** |
| Slides com os 14 itens do roteiro e texto com 20 pt ou mais | Responsável: Gustavo Reis |
| Demonstração ensaiada em 20 minutos, com plano B (vídeo ou prints) | A fazer |
| Arquivos no Blackboard até 09/11 (.txt, URL, repositório, slides, prints, .zip) | A fazer; o `.txt` está em [`entrega.txt`](entrega.txt) |

Antes da apresentação, publique na Vercel as mudanças locais do mapa (versões de cache `?v=20261109-*`).

## Limites do protótipo

O IncluiMais é um protótipo acadêmico. As informações do mapa não representam uma vistoria presencial nem uma certificação dos estabelecimentos. Os dados podem estar incompletos ou desatualizados, e "não informado" não significa que o recurso não exista. Quando um recurso for essencial para a visita, confirme as condições diretamente com o local.

## Equipe

| Integrante | RGM | GitHub | Função |
|---|---:|---|---|
| Antonio Dantas da Silva Neto | 47788356 | [AntonioDS](https://github.com/AntonioDS) | Concepção do site e conteúdo das páginas |
| Arthur de Jesus Salviano Oliveira | 47764988 | [arthurjso12-dev](https://github.com/arthurjso12-dev) | Chatbot com IA e integração com o Make |
| Gustavo Frutuoso José | 47604565 | [gustavofjose](https://github.com/gustavofjose) | Concepção do site e conteúdo das páginas |
| Gustavo Reis | 47455152 | [GustaDoBronx](https://github.com/GustaDoBronx) | Slides da apresentação |
| Heitor Tureck de Oliveira | 47104503 | [syndaflod](https://github.com/syndaflod) | Design, CSS e JavaScript |

Detalhes em [`escopo.md`](escopo.md), seção 10.
