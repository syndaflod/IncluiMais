# IncluiMais

**Encontre lugares mais acessíveis.**

O IncluiMais é um projeto acadêmico que reúne informações sobre recursos de acessibilidade em estabelecimentos. O mapa piloto cobre uma área próxima à Universidade Cidade de São Paulo (UNICID), na capital paulista.

## Páginas

- `index.html`: apresentação do projeto e acesso às principais ações.
- `mapa.html`: busca de locais, filtros e mapa interativo.
- `acessibilidade.html`: explicação dos recursos exibidos no mapa.
- `cadastro_estabelecimento.html`: formulário para sugerir um estabelecimento.
- `contato.html`: formulário para enviar sugestões ou correções.
- `impacto.html`: objetivos e indicadores do projeto.
- `midia.html`: conteúdo multimídia relacionado à UNICID.
- `noticias.html`: textos sobre inclusão, acessibilidade e tecnologia.
- `orcamento_hospedagem.html`: opções de hospedagem e domínio.
- `sobre.html`: contexto, proposta e valores do IncluiMais.

## Funcionalidades

- Pesquisa de estabelecimentos por nome.
- Filtros por categoria, incluindo banheiros, restaurantes, lojas, estacionamentos, farmácias, academias, instituições de ensino e espaços de lazer.
- Filtros por entrada acessível, banheiro acessível, estacionamento acessível, atendimento em Libras, piso tátil e material em braille.
- Lista de resultados sincronizada com os marcadores do mapa.
- Cinco estilos de mapa e navegação limitada a um raio de 100 metros do ponto inicial.
- Ícones nos marcadores e nos indicadores de acessibilidade dos locais.
- Navegação responsiva, atalho para o conteúdo principal e widget VLibras.
- FAQ local para dúvidas sobre o uso do site.

Os formulários são demonstrativos: a validação e a mensagem de confirmação acontecem no navegador, sem envio para um servidor.

## Dados do mapa

O mapa carrega `data/locais.json`. Esse arquivo compacto é gerado a partir de `data/UNICID_2.geojson` pelo script `tools/compact-geojson.py`:

```bash
python tools/compact-geojson.py
```

Os dados geográficos vêm do OpenStreetMap. A disponibilidade dos recursos pode estar incompleta ou desatualizada; “não informado” não significa que o estabelecimento não ofereça o recurso.

## Tecnologias

- HTML5, CSS3 e JavaScript sem frameworks.
- Leaflet e MapLibre GL JS para o mapa.
- OpenStreetMap para os dados geográficos e OpenFreeMap/OpenMapTiles para o mapa-base.
- GeoJSON para os dados dos estabelecimentos.
- Google Fonts para a tipografia e VLibras para apoio à tradução em Libras.

## Como executar

É necessário ter Python 3 instalado. Na pasta do projeto, inicie um servidor local:

```bash
python -m http.server 8000
```

Abra [http://localhost:8000](http://localhost:8000) no navegador. O servidor local permite que o mapa carregue o arquivo GeoJSON. Os serviços de mapas e algumas bibliotecas externas precisam de conexão com a internet.

## Estrutura

```text
IncluiMais/
├── index.html
├── mapa.html
├── acessibilidade.html
├── cadastro_estabelecimento.html
├── contato.html
├── impacto.html
├── midia.html
├── noticias.html
├── orcamento_hospedagem.html
├── sobre.html
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

## Limites do protótipo

O IncluiMais é um protótipo acadêmico. As informações do mapa não representam uma vistoria presencial nem uma certificação dos estabelecimentos. Quando um recurso for essencial para a visita, confirme as condições diretamente com o local.

## Equipe

| Integrante | RGM | GitHub |
|---|---:|---|
| Antonio Dantas da Silva Neto | 47788356 | [AntonioDS](https://github.com/AntonioDS) |
| Arthur de Jesus Salviano Oliveira | 47764988 | [arthurjso12-dev](https://github.com/arthurjso12-dev) |
| Gustavo Frutuoso José | 47604565 | [gustavofjose](https://github.com/gustavofjose) |
| Heitor Tureck de Oliveira | 47104503 | [syndaflod](https://github.com/syndaflod) |
