# IncluiMais

**Encontre lugares mais acessíveis.**

O IncluiMais é um projeto acadêmico desenvolvido para facilitar a localização de estabelecimentos e a consulta de recursos de acessibilidade. A plataforma utiliza um mapa interativo para apresentar locais próximos à área da Universidade Cidade de São Paulo (UNICID), permitindo pesquisar estabelecimentos, filtrar categorias e consultar informações relacionadas à acessibilidade.

## Sobre o projeto

A proposta do IncluiMais é contribuir para uma sociedade mais inclusiva, tornando informações sobre acessibilidade mais fáceis de encontrar e consultar.

Por meio de uma interface interativa, o usuário pode explorar estabelecimentos no mapa, pesquisar por nome e categoria, aplicar filtros de recursos de acessibilidade e visualizar indicadores sobre as condições informadas para cada local.

O projeto utiliza dados geográficos do OpenStreetMap e um conjunto de dados em GeoJSON para representar os estabelecimentos da área piloto.

## Funcionalidades

- **Mapa interativo:** visualização de estabelecimentos por meio de marcadores geográficos.
- **Busca de estabelecimentos:** pesquisa por nome, categoria ou endereço.
- **Filtros por categoria:** seleção de banheiros, restaurantes, lojas, estacionamentos, farmácias, instituições de ensino e espaços de lazer.
- **Filtros de acessibilidade:** busca por entrada acessível, banheiro acessível, estacionamento acessível, atendimento em Libras, piso tátil e material em braille.
- **Informações dos estabelecimentos:** consulta de endereço e indicadores de acessibilidade.
- **Temas do mapa:** seleção entre diferentes estilos de visualização cartográfica.
- **Área geográfica delimitada:** exploração concentrada em um raio de aproximadamente 100 metros do ponto inicial.
- **Cadastro de estabelecimentos:** formulário para informar dados do local e recursos de acessibilidade.
- **Interface responsiva:** adaptação para diferentes tamanhos de tela.

## Categorias de estabelecimentos

O IncluiMais organiza os locais nas seguintes categorias:

- Banheiros
- Restaurantes
- Lojas
- Estacionamentos
- Farmácias
- Instituições de ensino
- Espaços de lazer

## Recursos de acessibilidade

A plataforma permite consultar informações relacionadas aos seguintes recursos:

| Recurso | Descrição |
|---|---|
| Entrada acessível | Informações sobre acesso para pessoas com mobilidade reduzida |
| Banheiro acessível | Indicação de banheiro adaptado |
| Estacionamento acessível | Informações sobre estacionamento acessível |
| Atendimento em Libras | Recurso de comunicação em Língua Brasileira de Sinais |
| Piso tátil | Indicação de recursos de orientação tátil |
| Material em braille | Informação sobre materiais acessíveis a pessoas com deficiência visual |

Os indicadores distinguem recursos identificados como disponíveis, indisponíveis ou não informados. A ausência de informação não significa necessariamente que o estabelecimento não possua o recurso.

## Tecnologias utilizadas

| Tecnologia | Aplicação |
|---|---|
| HTML5 | Estrutura das páginas |
| CSS3 | Estilização, layout e responsividade |
| JavaScript | Lógica da aplicação, pesquisa e filtros |
| Leaflet.js | Gerenciamento do mapa e dos marcadores |
| MapLibre GL JS | Renderização dos estilos cartográficos |
| Leaflet-MapLibre-GL | Integração do MapLibre ao Leaflet |
| OpenFreeMap | Fornecimento dos estilos do mapa |
| OpenStreetMap | Dados geográficos dos estabelecimentos |
| Overpass API | Consulta de dados geográficos do OpenStreetMap |
| GeoJSON | Armazenamento e leitura dos dados da área piloto |
| LocalStorage | Armazenamento local dos estabelecimentos cadastrados |
| VLibras | Integração com tecnologia de tradução para Libras |

## Como executar o projeto

**Pré-requisitos**

- Navegador atualizado.
- Conexão com a internet.
- Visual Studio Code com a extensão Live Server, ou outro servidor HTTP local.

**Passos para execução**

1. Clone o repositório:

   ```bash
   git clone https://github.com/syndaflod/IncluiMais.git
   ```

2. Acesse a pasta do projeto:

   ```bash
   cd IncluiMais
   ```

3. Abra a pasta no Visual Studio Code.

4. Inicie o projeto utilizando o Live Server e abra o endereço local disponibilizado pela extensão.

A utilização de um servidor HTTP local é recomendada para permitir o carregamento correto dos arquivos GeoJSON e dos recursos externos.

## Estrutura do projeto

```text
IncluiMais/
├── index.html
├── cadastro.html
├── style.css
├── script.js
├── UNICID_2.geojson
└── README.md
```

- `index.html`: página principal com o mapa, a busca, os filtros e a lista de estabelecimentos.
- `cadastro.html`: página destinada ao cadastro de estabelecimentos.
- `style.css`: estilos visuais, componentes da interface e regras responsivas.
- `script.js`: lógica do mapa, carregamento de dados, marcadores, pesquisa e filtros.
- `UNICID_2.geojson`: conjunto de dados geográficos utilizado na área piloto.
- `README.md`: documentação do projeto.

## Área piloto

O projeto utiliza como referência inicial uma área próxima à Universidade Cidade de São Paulo (UNICID), na capital paulista.

A navegação é limitada a um raio aproximado de 100 metros do ponto central definido no código, mantendo o escopo do protótipo concentrado em uma região específica.

## Equipe

| Integrante | RGM | Usuário GitHub |
|---|---:|---|
| Antonio Dantas da Silva Neto | 47788356 | [AntonioDS](https://github.com/AntonioDS) |
| Arthur de Jesus Salviano Oliveira | 47764988 | [arthurjso12-dev](https://github.com/arthurjso12-dev) |
| Gustavo Frutuoso José | 47604565 | [gustavofjose](https://github.com/gustavofjose) |
| Heitor Tureck de Oliveira | 47104503 | [syndaflod](https://github.com/syndaflod) |

## Objetivos acadêmicos

- Aplicar conhecimentos de desenvolvimento Front-End.
- Desenvolver uma aplicação web interativa utilizando JavaScript.
- Integrar mapas digitais e dados geográficos.
- Implementar mecanismos de busca e filtragem.
- Explorar princípios de acessibilidade, inclusão e usabilidade.
- Desenvolver uma solução tecnológica voltada às necessidades da sociedade.

## Status do projeto

**Em desenvolvimento.**

O IncluiMais é um protótipo acadêmico. As informações de acessibilidade dependem dos dados disponíveis e não representam, necessariamente, uma avaliação presencial ou uma certificação dos estabelecimentos.

## Créditos e fontes de dados

- [OpenStreetMap](https://www.openstreetmap.org/) — dados geográficos.
- [OpenFreeMap](https://openfreemap.org/) — estilos cartográficos.
- [Leaflet](https://leafletjs.com/) — biblioteca de mapas interativos.
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) — renderização cartográfica.
- [VLibras](https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras) — tecnologia assistiva para tradução de conteúdos digitais em Libras.

---

Desenvolvido como projeto acadêmico do curso de Ciência da Computação.
