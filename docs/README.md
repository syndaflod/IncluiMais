# IncluiMais

**Encontre lugares mais acessíveis.**

O IncluiMais é um projeto acadêmico sobre inclusão social e acessibilidade. Ele reúne informações sobre recursos de acessibilidade em estabelecimentos, incentiva contribuições da comunidade e ajuda pessoas a planejarem seus deslocamentos com mais autonomia. O mapa piloto cobre uma área próxima à Universidade Cidade de São Paulo (UNICID), na capital paulista.

## Estado atual

A primeira versão do site já possui 9 páginas, navegação compartilhada, mapa interativo, formulários HTML5, chatbot FAQ e recursos básicos de acessibilidade.

## Páginas

- `index.html`: página inicial, apresentação do problema e chamadas para as principais ações.
- `mapa.html`: busca de locais, categorias, filtros de acessibilidade e mapa interativo.
- `sobre.html`: contexto, problema, proposta, missão, visão e valores do projeto.
- `acessibilidade.html`: explicação dos recursos de acessibilidade exibidos no mapa.
- `impacto.html`: objetivos, indicadores e relação entre acessibilidade, participação social e sustentabilidade.
- `cadastro_estabelecimento.html`: formulário para sugerir um novo estabelecimento.
- `noticias.html`: textos sobre inclusão, acessibilidade, tecnologia e participação social.
- `contato.html`: formulário de contato, sugestões e correções de informações.
- `orcamento_hospedagem.html`: comparação de opções de hospedagem e domínio.

O antigo mapa que estava no `index.html` foi transferido para `mapa.html`. O `index.html` funciona como entrada institucional do projeto.

## Funcionalidades

- Pesquisa de estabelecimentos por nome.
- Filtros por categoria, incluindo banheiros, restaurantes, lojas, estacionamentos, farmácias, academias, instituições de ensino e espaços de lazer.
- Filtros por entrada acessível, banheiro acessível, estacionamento acessível, atendimento em Libras, piso tátil e material em braille.
- Lista de resultados sincronizada com os marcadores do mapa.
- Cinco estilos de mapa e navegação limitada a um raio de 100 metros do ponto inicial.
- Ícones nos marcadores e nos indicadores de acessibilidade dos locais.
- Menu responsivo compartilhado entre as páginas.
- Botão para pular diretamente ao conteúdo principal.
- Indicador de página atual com `aria-current`.
- Widget VLibras carregado nas páginas institucionais.
- Formulários com validação nativa do HTML5 e mensagens com `aria-live`.
- Chatbot FAQ local em JavaScript, sem API externa e sem coleta de dados pessoais.

## Dados do mapa

O mapa carrega `data/locais.json`. Esse arquivo compacto é gerado a partir de `data/UNICID_2.geojson` pelo script `tools/compact-geojson.py`:

```bash
python tools/compact-geojson.py
```

Os dados geográficos vêm do OpenStreetMap. A disponibilidade dos recursos pode estar incompleta ou desatualizada; "não informado" não significa que o estabelecimento não ofereça o recurso.

## Chatbot

O chatbot da página inicial é um FAQ local implementado em `js/site.js`. Ele responde por palavras-chave sobre mapa, filtros, cadastro, contato e privacidade.

Essa implementação não exige servidor nem chave de API. Se uma API de IA for adicionada no futuro, a chave deverá permanecer no servidor, nunca no JavaScript enviado ao navegador.

## Formulários

`cadastro_estabelecimento.html` e `contato.html` usam validação HTML5 com `required`, `email`, `tel`, `pattern`, `label` associado e mensagens acessíveis.

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
├── acessibilidade.html
├── impacto.html
├── cadastro_estabelecimento.html
├── noticias.html
├── contato.html
├── orcamento_hospedagem.html
├── assets/
│   └── accessibility/
├── css/
│   ├── site.css
│   └── style.css
├── data/
│   ├── locais.json
│   └── UNICID_2.geojson
├── docs/
├── js/
│   ├── script.js
│   └── site.js
└── tools/
    └── compact-geojson.py
```

## Pendências antes da entrega

- Conferir autorização e fontes das imagens e textos.
- Revisar todos os links e testar a navegação entre as páginas.
- Testar os formulários com dados válidos e inválidos.
- Testar teclado, foco visível, contraste, zoom e leitor de tela.
- Validar o HTML e o CSS no W3C Validator.
- Testar o mapa com e sem conexão com os serviços externos.
- Registrar prints ou descrições dos testes em `docs/`.
- Completar o diário de bordo e a divisão de tarefas da equipe.
- Atualizar o orçamento com preços e fontes consultados na data da entrega.
- Criar o arquivo final compactado com o nome dos integrantes e da atividade.

## Limites do protótipo

O IncluiMais é um protótipo acadêmico. As informações do mapa não representam uma vistoria presencial nem uma certificação dos estabelecimentos. Os dados podem estar incompletos ou desatualizados, e "não informado" não significa que o recurso não exista. Quando um recurso for essencial para a visita, confirme as condições diretamente com o local.

## Equipe

| Integrante | RGM | GitHub |
|---|---:|---|
| Antonio Dantas da Silva Neto | 47788356 | [AntonioDS](https://github.com/AntonioDS) |
| Arthur de Jesus Salviano Oliveira | 47764988 | [arthurjso12-dev](https://github.com/arthurjso12-dev) |
| Gustavo Frutuoso José | 47604565 | [gustavofjose](https://github.com/gustavofjose) |
| Heitor Tureck de Oliveira | 47104503 | [syndaflod](https://github.com/syndaflod) |
