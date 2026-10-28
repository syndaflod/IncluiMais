# IncluiMais

Site acadêmico sobre inclusão social e acessibilidade. O IncluiMais organiza informações sobre recursos de acessibilidade em estabelecimentos, incentiva contribuições da comunidade e ajuda pessoas a planejarem seus deslocamentos com mais autonomia.

## Estado atual

A primeira versão do site já possui as 10 páginas exigidas, navegação compartilhada, mapa interativo, formulários HTML5, chatbot FAQ e recursos básicos de acessibilidade.

## Páginas

- `index.html`: página inicial, apresentação do problema e chamadas para as principais ações.
- `mapa.html`: mapa interativo com busca, categorias e filtros de acessibilidade.
- `sobre.html`: problema, proposta, missão, visão e valores do projeto.
- `acessibilidade.html`: explicação dos recursos de acessibilidade exibidos no mapa.
- `impacto.html`: indicadores e relação entre acessibilidade, participação social e sustentabilidade.
- `cadastro_estabelecimento.html`: formulário para indicar um novo local.
- `midia.html`: vídeo, áudio e iframe relacionados à UNICID e à acessibilidade educacional.
- `noticias.html`: conteúdos informativos sobre inclusão, tecnologia e participação social.
- `contato.html`: formulário de contato, sugestões e correções de informações.
- `orcamento_hospedagem.html`: comparação inicial de hospedagens e domínios.

O antigo mapa que estava no `index.html` foi transferido para `mapa.html`. O novo `index.html` funciona como entrada institucional do projeto.

## Funcionalidades

- Busca de estabelecimentos por nome.
- Filtros por categoria e recursos de acessibilidade.
- Marcadores e lista sincronizados no mapa.
- Dados locais em `data/UNICID_2.geojson`.
- Integração demonstrativa com dados do OpenStreetMap via Overpass.
- Menu responsivo compartilhado entre as páginas.
- Botão para pular diretamente ao conteúdo principal.
- Indicador de página atual com `aria-current`.
- Widget VLibras carregado nas páginas institucionais.
- Formulários com validação nativa do HTML5 e mensagens com `aria-live`.
- Chatbot FAQ local em JavaScript, sem API externa e sem coleta de dados pessoais.

## Tecnologias

- HTML5 semântico.
- CSS3.
- JavaScript puro.
- Leaflet e MapLibre para o mapa.
- OpenStreetMap/OpenFreeMap e dados GeoJSON.
- Google Fonts, Poppins.
- VLibras.

## Estrutura

```text
IncluiMais/
├── index.html
├── mapa.html
├── sobre.html
├── acessibilidade.html
├── impacto.html
├── cadastro_estabelecimento.html
├── midia.html
├── noticias.html
├── contato.html
├── orcamento_hospedagem.html
├── css/
│   ├── site.css
│   └── style.css
├── js/
│   ├── site.js
│   └── script.js
├── data/
│   └── UNICID_2.geojson
└── docs/
    ├── README.md
    └── mapa.md
```

## Chatbot

O chatbot da página inicial é um FAQ local implementado em `js/site.js`. Ele responde por palavras-chave sobre mapa, filtros, cadastro, contato e privacidade.

Essa implementação é adequada para a entrega porque não exige servidor nem chave de API. Se uma API de IA for adicionada no futuro, a chave deverá permanecer no servidor, nunca no JavaScript enviado ao navegador.

## Formulários

`cadastro_estabelecimento.html` e `contato.html` usam validação HTML5 com `required`, `email`, `tel`, `pattern`, `label` associado e mensagens acessíveis.

No estado atual, os formulários são demonstrativos: a validação funciona no navegador, mas os dados não são enviados nem armazenados. Para uma versão publicada, será necessário conectar os formulários a um backend, serviço de formulário ou endpoint serverless.

## Conteúdo multimídia

A página `midia.html` já contém elementos `video`, `audio` e `iframe`, mas a pasta `assets/` ainda precisa ser criada. Antes da entrega, adicionar:

```text
assets/
├── apresentacao-unicid.mp4
├── poster-unicid.jpg
└── descricao-unicid.mp3
```

Os arquivos devem ter fonte, autorização de uso e, para o vídeo, uma descrição ou transcrição acessível. O iframe institucional depende de conexão com a internet e pode ser bloqueado pelo site de origem.

## Como executar

O projeto é estático. É recomendado abrir a pasta com um servidor local para que o mapa e o GeoJSON funcionem corretamente:

```bash
python -m http.server 8000
```

Depois, acessar `http://localhost:8000/` no navegador.

## Pendências antes da entrega

- Adicionar os arquivos reais da pasta `assets/`.
- Conferir autorização e fontes do vídeo, áudio, imagens e textos.
- Revisar todos os links e testar a navegação entre as 10 páginas.
- Testar os formulários com dados válidos e inválidos.
- Testar teclado, foco visível, contraste, zoom e leitor de tela.
- Validar o HTML e o CSS no W3C Validator.
- Testar o mapa com e sem conexão com os serviços externos.
- Registrar prints ou descrições dos testes em `docs/`.
- Completar o diário de bordo e a divisão de tarefas da equipe.
- Atualizar o orçamento com preços e fontes consultados na data da entrega.
- Criar o arquivo final compactado com o nome dos integrantes e da atividade.

## Limites do protótipo

Os dados de acessibilidade podem estar incompletos ou desatualizados. A indicação “não informado” não significa que o recurso não exista. O usuário deve confirmar as condições diretamente com o estabelecimento quando essa informação for essencial.
