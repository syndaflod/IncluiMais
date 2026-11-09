# Testes do site

Site testado: https://projetoincluimais.vercel.app

Data dos testes: 09/11/2026. Os prints estão em [`evidencias/`](evidencias/).

## Situação

| Teste | Situação |
|---|---|
| Validação HTML no W3C | Feita nas 12 páginas; 3 precisam de novo teste (ver abaixo) |
| Formulários | Feito no computador |
| Chatbot com IA | Feito no computador |
| Multimídia | Vídeo com print; áudio e iframe informados pela equipe |
| Home no celular | Feito com print |
| Outras páginas no celular | Pendente |
| Navegação só por teclado | Pendente |
| Contraste no Lighthouse | Pendente |

## Validação HTML (W3C)

Ferramenta: [Nu Html Checker](https://validator.w3.org/nu/), por endereço, na versão publicada.

| Página | Resultado | Evidência |
|---|---|---|
| `index.html` | Sem erros nem avisos | [print](evidencias/w3c-index.png) |
| `mapa.html` | Sem erros relatados pela equipe; 1 aviso sobre `h1` dentro de `aside`/`section` | [print parcial](evidencias/w3c-mapa.png) |
| `acessibilidade.html` | Sem erros nem avisos | [print](evidencias/w3c-acessibilidade.png) |
| `cadastro_estabelecimento.html` | Sem erros nem avisos | [print](evidencias/w3c-cadastro-estabelecimento.png) |
| `contato.html` | Sem erros nem avisos | [print](evidencias/w3c-contato.png) |
| `sobre.html` | Sem erros nem avisos | [print](evidencias/w3c-sobre.png) |
| `projetos.html` | Sem erros; 1 aviso de `section` sem título | [print](evidencias/w3c-projetos.png) |
| `noticias.html` | Sem erros nem avisos | [print](evidencias/w3c-noticias.png) |
| `galeria.html` | Sem erros nem avisos | [print](evidencias/w3c-galeria.png) |
| `midia.html` | Sem erros nem avisos | [print](evidencias/w3c-midia.png) |
| `impacto.html` | Sem erros nem avisos | [print](evidencias/w3c-impacto.png) |
| `orcamento_hospedagem.html` | Sem erros nem avisos na versão anterior da página | [print](evidencias/w3c-orcamento.png) |

### Observações

- **`mapa.html`:** o print mostra apenas os primeiros itens “Info”, sobre a barra final em tags como `<meta />`, que não são erros. Ele não mostra a lista completa. Decisão sobre o aviso do `h1`: mantido, porque é o único título principal da página e removê-lo exigiria mudar a estrutura da barra lateral.
- **`projetos.html`:** depois do print, a `section` foi trocada por `div` para resolver o aviso.
- **`orcamento_hospedagem.html`:** o print é de antes da inclusão da comparação de domínios.
- **Conteúdo gerado por JavaScript:** o W3C analisa o HTML recebido do servidor. Rodapé, galeria e cartões de projetos são inseridos depois pelo JavaScript e não entram nessa validação.

## Formulários

Validação em JavaScript, testada no computador enviando os formulários vazios.

| Formulário | Resultado | Evidência |
|---|---|---|
| Contato | Mostra “Preencha este campo.” nos campos obrigatórios e pede revisão antes de enviar. Os campos opcionais não são marcados | [print](evidencias/desktop-contato-erros.png) |
| Indicar local | Mostra erro por campo em nome, categoria, endereço e CEP | [print](evidencias/desktop-indicar-local-erros.png) |

Informado pela equipe: e-mail inválido no Contato mostra “Informe um e-mail válido, como nome@exemplo.com”.

## Chatbot com IA

| Teste | Resultado | Evidência |
|---|---|---|
| Pergunta “Olá a onde fica a unicid?” no site publicado | Respondeu com o endereço da UNICID | [print](evidencias/desktop-chatbot-resposta.png) |

## Multimídia

| Recurso | Resultado | Evidência |
|---|---|---|
| Vídeo em `midia.html` | Exibido, com descrição em texto | [print](evidencias/desktop-midia-video.png) |
| Áudio e iframe em `midia.html` | Carregam, segundo a equipe | Sem print |

## Responsividade

| Tela | Resultado | Evidência |
|---|---|---|
| Home no computador | Título, mapa e menu visíveis; chatbot aberto no print | [print](evidencias/home-desktop.png) |
| Home no celular | Layout em uma coluna, com menu recolhido | [print](evidencias/home-celular.png) |

## Outras verificações informadas pela equipe

- `projetos.html` e `galeria.html` abrem.
- O filtro de notícias funciona.
- A opção “Apoie” aparece no menu e leva à área de apoio em Contato.

## Problemas encontrados e correções

| Problema | Correção | Situação |
|---|---|---|
| Nome “Univercidade” e rua “Cesário Galero” no cadastro da UNICID, visíveis nos prints da home | Dados ajustados para “Universidade” e “Cesário Galeno” em `data/locais.json` | Corrigido; aguardando publicação |
| Aviso de `section` sem título em `projetos.html` | Troca por `div` | Corrigido; aguardando publicação |
| Sustentabilidade/ODS presente em poucas páginas | Frase sobre as ODS 10 e 11 no rodapé, exceto em `mapa.html`, que não tem rodapé | Conferido em servidor local; aguardando publicação |

## Testes pendentes

- [ ] Publicar a versão final e repetir o W3C de `mapa.html` (com “errors & warnings only”), `projetos.html` e `orcamento_hospedagem.html`.
- [ ] Navegar pelo site só com Tab, Enter e Esc.
- [ ] Rodar o Lighthouse e registrar acessibilidade e contraste.
- [ ] Testar no celular: menu aberto, mapa com local selecionado, formulário, tabela do orçamento e mídia.
