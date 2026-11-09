# Melhorias desde o MVP

O roteiro da 2ª entrega pede a lista dos pontos da 1ª entrega (MVP) e como cada um foi resolvido, com antes e depois.

> **Atenção, equipe:** a coluna "Ponto" foi montada a partir do roteiro da 1ª entrega e do histórico de commits. Se o professor deu um retorno do MVP, troque ou complete os pontos com o que ele apontou. Os prints de "antes" podem ser tirados do commit indicado (`git checkout <commit>`).

| # | Ponto | Antes (MVP) | Depois (versão final) | Onde ver |
|---:|---|---|---|---|
| 1 | Páginas mínimas do roteiro | Faltavam `projetos.html` e `galeria.html` (ainda ausentes no commit `d2e34a9`, de 29/10) | As 10 páginas obrigatórias existem e estão no menu, além de `mapa.html` e `cadastro_estabelecimento.html` | Menu do site |
| 2 | Página inicial | O mapa ficava no `index.html` | O `index.html` virou a entrada institucional, e o mapa foi para `mapa.html` | `index.html`, `mapa.html` |
| 3 | W3C Validator | Erros de validação | Nenhuma página com erro apontado pelo W3C | Commit `5958151` ("fix: w3c validator"), [`testes.md`](testes.md) |
| 4 | Sustentabilidade e ODS em todas as páginas | O tema aparecia em poucas páginas | Frase sobre as ODS 10 e 11 no rodapé de todas as páginas (o mapa não tem rodapé) | Rodapé do site |
| 5 | Dados com erro de digitação | "Univercidade" e "Cesário Galero" no cadastro da UNICID | "Universidade" e "Cesário Galeno" | `data/locais.json` |
| 6 | Publicação | Pasta local (.zip) | Site na Vercel com HTTPS | https://projetoincluimais.vercel.app |
| 7 | Acessibilidade | Recursos básicos | Alto contraste e ajuste de fonte salvos no `localStorage`, atalhos de pulo, VLibras, `aria-current` e nota 100 em acessibilidade no Lighthouse (home) | [`testes.md`](testes.md) |
| 8 | Cartão do local no mapa | Ícones em fila única quando o local não tinha recursos; selo "×"/"?" sobre os ícones; cartão cortado na borda do mapa | Ícones sempre nos mesmos 3 grupos; estado indicado pela cor; cartão abre do lado com espaço | `mapa.html`, [`testes.md`](testes.md) |
| 9 | Navegação no mapa | O mapa só andava 100 m e não alcançava parte dos locais | A navegação cobre o retângulo com todos os locais | `mapa.html` |
