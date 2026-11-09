import { categoriaDoLocal, deduplicarLocais, localBaseDoGeoJson } from "./locais-dados.js?v=20261109-unicid";
import { CATEGORIAS, iconeCategoria } from "../assets/categorias.js?v=transport-icons-20261028";

const CENTRO_INICIAL = [-23.53598, -46.55948];
const MODO_EMBED = new URLSearchParams(window.location.search).get("embed") === "1";
const RAIO_DESLOCAMENTO_METROS = 1050;
let locais = [];
let estadoCarregamentoLocais = "carregando";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

let mapa;
let camadaBase;
let camadaMarcadores;
let estiloMapaAtual = document.documentElement.classList.contains("alto-contraste") ? "dark" : "bright";
let estiloMapaAnteriorContraste = "bright";
let contrasteMapaAtivo = document.documentElement.classList.contains("alto-contraste");
const categoriasAtivas = new Set();
let categoriasRascunho = new Set();
let painelCategoriasModal = false;
let restaurarFocoCategorias = false;
const marcadores = {};

function aplicarEstiloMapa(estilo) {
  estiloMapaAtual = estilo;
  if (camadaBase) camadaBase.getMaplibreMap().setStyle(`https://tiles.openfreemap.org/styles/${estilo}`);
}

const idsPorCategoriaLocal = {
  "Banheiro": "banheiros", "Restaurante": "restaurantes", "Loja": "lojas", "Estacionamento": "estacionamentos",
  "Farmácia": "farmacias", "Academia": "academias", "Instituição de ensino": "ensino", "Espaço de lazer": "lazer",
  "Creche": "creche", "Posto de gasolina": "posto", "Metrô": "metro", "Ônibus": "onibus", "Bicicletário": "bicicletario",
  "Corpo de Bombeiros": "bombeiros", "Igreja": "igreja", "Polícia": "policia", "Lava-jato": "lavajato",
  "Dentista": "dentista", "Tatuagem": "tatuagem", "Banco": "banco", "Táxi": "taxi", "Hospital": "hospital"
};

const gruposCategorias = [
  { nome: "Banheiros", ids: ["banheiros"] },
  { nome: "Comer e comprar", ids: ["restaurantes", "lojas", "posto"] },
  { nome: "Saúde", ids: ["hospital", "farmacias", "dentista"] },
  { nome: "Transporte", ids: ["estacionamentos", "metro", "onibus", "bicicletario", "taxi"] },
  { nome: "Serviços", ids: ["banco", "policia", "bombeiros", "lavajato"] },
  { nome: "Educação e comunidade", ids: ["ensino", "creche", "igreja"] },
  { nome: "Lazer e bem-estar", ids: ["lazer", "academias", "tatuagem"] }
];

const nomesRecursos = {
  entradaAcessivel: "Entrada acessível",
  rampaAcessivel: "Rampa acessível",
  banheiroAcessivel: "Banheiro acessível",
  estacionamentoAcessivel: "Estacionamento acessível",
  libras: "Atendimento em Libras",
  pisoTatil: "Piso tátil",
  braille: "Material em braille"
};

const iconesRecursos = {
  entradaAcessivel: "assets/accessibility/entrada-acessivel.svg",
  rampaAcessivel: "assets/accessibility/rampa.svg?v=rampa-20261031-2",
  banheiroAcessivel: "assets/accessibility/banheiro-acessivel.svg",
  estacionamentoAcessivel: "assets/accessibility/estacionamento-acessivel.svg",
  libras: "assets/accessibility/libras.svg",
  pisoTatil: "assets/accessibility/piso-tatil.svg",
  braille: "assets/accessibility/image%20(2).svg?v=braille-20261031-3"
};

const iconesEstabelecimentos = {
  restaurante: "assets/icons/restaurante.svg#icon",
  farmacia: "assets/icons/farmacia.svg#icon",
  ensino: "assets/icons/instituicao-ensino.svg#icon",
  lazer: "assets/icons/espaco-lazer.svg#icon",
  estacionamento: "assets/icons/estacionamento.svg#icon",
  loja: "assets/icons/loja.svg#icon",
  banheiro: "assets/icons/banheiro.svg#icon",
  academia: "assets/icons/academia.svg#icon",
  creche: "assets/icons/creche.svg#icon",
  posto: "assets/icons/posto.svg#icon",
  metro: "assets/icons/metro.svg#icon",
  onibus: "assets/onibus.svg",
  bicicletario: "assets/icons/bicicletario.svg#icon",
  bombeiros: "assets/icons/bombeiros.svg#icon",
  igreja: "assets/icons/igreja.svg#icon",
  policia: "assets/icons/policia.svg#icon",
  lavajato: "assets/icons/lavajato.svg#icon",
  dentista: "assets/icons/dentista.svg#icon",
  tatuagem: "assets/icons/tatuagem.svg#icon",
  banco: "assets/icons/banco.svg#icon",
  taxi: "assets/icons/taxi.svg#icon",
  hospital: "assets/icons/hospital.svg#icon"
};

const coresCategorias = {
  restaurante: "#E65100",
  farmacia: "#C62828",
  ensino: "#3949AB",
  lazer: "#2E7D32",
  estacionamento: "#455A64",
  loja: "#6A1B9A",
  banheiro: "#0277BD",
  academia: "#00838F",
  creche: "#E91E63",
  posto: "#795548",
  metro: "#212121",
  onibus: "#1565C0",
  bicicletario: "#827717",
  bombeiros: "#BF360C",
  igreja: "#A66F00",
  policia: "#14325C",
  lavajato: "#0097A7",
  dentista: "#5E35B1",
  tatuagem: "#880E4F",
  banco: "#558B2F",
  taxi: "#F9A825",
  hospital: "#00796B"
};

function recursosAcessibilidade(tags = {}) {
  const campo = (...nomes) => nomes.map((nome) => tags[nome]).find((valor) => valor != null && valor !== "");
  const estado = (...nomes) => estadoAcessibilidade(campo(...nomes));
  const acessibilidade = {
    entradaAcessivel: estado("entrance:wheelchair", "wheelchair"),
    rampaAcessivel: estado("ramp:wheelchair", "ramp", "entrance:ramp"),
    banheiroAcessivel: estado("toilets:wheelchair", "wheelchair:toilets"),
    estacionamentoAcessivel: estado("parking:wheelchair"),
    libras: estado("sign_language:pt-BR", "sign_language", "communication:sign_language"),
    pisoTatil: estado("tactile_paving", "tactile_paving:floor"),
    braille: estado("braille", "information:braille")
  };
  return acessibilidade;
}

function estadoAcessibilidade(valor) {
  if (valor === "yes" || valor === "designated") return "available";
  if (valor === "no") return "unavailable";
  return "unknown";
}

function chaveCategoriaLocal(local) {
  const categorias = {
    "Restaurante": "restaurante", "Farmácia": "farmacia", "Instituição de ensino": "ensino",
    "Espaço de lazer": "lazer", "Estacionamento": "estacionamento", "Loja": "loja", "Banheiro": "banheiro", "Academia": "academia",
    "Creche": "creche", "Posto de gasolina": "posto", "Metrô": "metro", "Ônibus": "onibus", "Bicicletário": "bicicletario",
    "Corpo de Bombeiros": "bombeiros", "Igreja": "igreja", "Polícia": "policia", "Lava-jato": "lavajato",
    "Dentista": "dentista", "Tatuagem": "tatuagem", "Banco": "banco", "Táxi": "taxi", "Hospital": "hospital"
  };
  return categorias[local.categoria] || "padrao";
}

function iconeDoLocal(local) {
  if (chaveCategoriaLocal(local) === "onibus") {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M18 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M4 17h-2v-11a1 1 0 0 1 1 -1h14a5 7 0 0 1 5 7v5h-2m-4 0h-8"/><path d="M16 5l1.5 7l4.5 0"/><path d="M2 10l15 0"/><path d="M7 5l0 5"/><path d="M12 5l0 5"/></svg>';
  }
  const icone = iconesEstabelecimentos[chaveCategoriaLocal(local)];
  return icone
    ? `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="${icone}"></use></svg>`
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V7l8-4 8 4v13M8 20v-6h8v6M9 9h.01M15 9h.01"/></svg>';
}

function corDaCategoria(local) {
  return coresCategorias[chaveCategoriaLocal(local)] || "#455A64";
}

function idDaCategoriaLocal(local) {
  return idsPorCategoriaLocal[local.categoria] || "";
}

function atualizarCategoriasAtivas() {
  const botaoBanheiros = document.querySelector("#filtro-banheiros");
  const contagem = document.querySelector("#contador-categorias-ativas");
  const chips = document.querySelector("#categorias-ativas");
  const banheirosAtivos = categoriasAtivas.has("banheiros");
  botaoBanheiros.classList.toggle("ativo", banheirosAtivos);
  botaoBanheiros.setAttribute("aria-pressed", String(banheirosAtivos));
  botaoBanheiros.setAttribute("aria-label", `${banheirosAtivos ? "Remover filtro" : "Filtrar"} Banheiros`);
  botaoBanheiros.querySelector(".chip-remover").hidden = !banheirosAtivos;
  contagem.textContent = String(categoriasAtivas.size);

  const idsVisiveis = [...categoriasAtivas].filter((id) => id !== "banheiros");
  chips.innerHTML = idsVisiveis.map((id) => {
    const categoria = CATEGORIAS[id];
    return `<button class="chip-categoria chip-ativo" type="button" data-remover-categoria="${id}" aria-label="Remover filtro ${categoria.rotulo}"><span>${categoria.rotulo}</span><span class="chip-remover" aria-hidden="true">×</span></button>`;
  }).join("");
  chips.hidden = idsVisiveis.length === 0;
}

function atualizarEstadoDosGrupos() {
  document.querySelectorAll("[data-marcar-grupo]").forEach((botao) => {
    const checks = [...botao.closest("fieldset").querySelectorAll("input[data-categoria-id]")];
    const todosMarcados = checks.length > 0 && checks.every((check) => categoriasRascunho.has(check.dataset.categoriaId));
    botao.textContent = todosMarcados ? "Desmarcar todos" : "Marcar todos";
    botao.setAttribute("aria-pressed", String(todosMarcados));
  });
}

function renderizarPainelCategorias() {
  const contagens = Object.fromEntries(Object.keys(CATEGORIAS).map((id) => [id, 0]));
  locais.forEach((local) => {
    const id = idDaCategoriaLocal(local);
    if (id in contagens) contagens[id] += 1;
  });

  const grupos = gruposCategorias.map((grupo) => {
    const itens = grupo.ids.filter((id) => contagens[id] > 0);
    if (!itens.length) return "";
    const opcoes = itens.map((id) => {
      const categoria = CATEGORIAS[id];
      const quantidade = contagens[id];
      return `<label class="opcao-categoria" style="--categoria-cor:${categoria.cor}"><input type="checkbox" name="categorias" value="${id}" data-categoria-id="${id}"${categoriasRascunho.has(id) ? " checked" : ""}><span class="opcao-categoria-icone">${iconeCategoria(id, { tamanho: 19 })}</span><span class="opcao-categoria-nome">${categoria.rotulo}</span><span class="opcao-categoria-contagem"><span aria-hidden="true">${quantidade}</span><span class="visualmente-oculto">${quantidade} ${quantidade === 1 ? "local" : "locais"}</span></span></label>`;
    }).join("");
    return `<fieldset class="grupo-categorias-painel"><legend>${grupo.nome}</legend><button class="marcar-grupo" type="button" data-marcar-grupo aria-pressed="false">Marcar todos</button><div class="opcoes-categoria">${opcoes}</div></fieldset>`;
  }).join("");

  document.querySelector("#painel-categorias-grupos").innerHTML = grupos || `<p class="estado-categorias-vazio">${estadoCarregamentoLocais === "carregando" ? "Carregando categorias…" : "Nenhuma categoria disponível."}</p>`;
  atualizarEstadoDosGrupos();
  requestAnimationFrame(atualizarIndicadorScrollCategorias);
}

function atualizarIndicadorScrollCategorias() {
  const lista = document.querySelector("#painel-categorias-lista");
  const conteudo = document.querySelector("#painel-categorias-grupos");
  const temMais = conteudo.scrollHeight > conteudo.clientHeight + 1 &&
    conteudo.scrollTop + conteudo.clientHeight < conteudo.scrollHeight - 1;
  lista.dataset.temMais = String(temMais);
}

function sincronizarRascunhoCategorias() {
  categoriasRascunho = new Set(categoriasAtivas);
  document.querySelectorAll("input[data-categoria-id]").forEach((check) => {
    check.checked = categoriasRascunho.has(check.dataset.categoriaId);
  });
  atualizarEstadoDosGrupos();
}

function posicionarPainelCategorias() {
  if (painelCategoriasModal) return;
  const gatilho = document.querySelector("#abrir-categorias");
  const painel = document.querySelector("#painel-categorias");
  const caixa = gatilho.getBoundingClientRect();
  const rtl = getComputedStyle(gatilho).direction === "rtl";
  const inicioInline = rtl ? window.innerWidth - caixa.right : caixa.left;
  const largura = painel.getBoundingClientRect().width;
  const inicioLimitado = Math.max(16, Math.min(inicioInline, window.innerWidth - largura - 16));
  const altura = painel.getBoundingClientRect().height;
  const topoMaximo = Math.max(16, window.innerHeight - altura - 16);
  painel.style.insetBlockStart = `${Math.min(caixa.bottom + 8, topoMaximo)}px`;
  painel.style.insetInlineStart = `${inicioLimitado}px`;
}

function abrirPainelCategorias(reiniciarRascunho = true, focarTitulo = true) {
  const painel = document.querySelector("#painel-categorias");
  if (painel.open) return;
  if (reiniciarRascunho) sincronizarRascunhoCategorias();
  painelCategoriasModal = window.matchMedia("(max-width: 639px)").matches;
  if (painelCategoriasModal) {
    painel.showModal();
  } else {
    painel.show();
    posicionarPainelCategorias();
  }
  document.querySelector("#abrir-categorias").setAttribute("aria-expanded", "true");
  requestAnimationFrame(() => {
    atualizarIndicadorScrollCategorias();
    if (focarTitulo) document.querySelector("#titulo-painel-categorias").focus();
  });
}

function fecharPainelCategorias(restaurarFoco = true) {
  const painel = document.querySelector("#painel-categorias");
  if (!painel.open) return;
  restaurarFocoCategorias = restaurarFoco;
  painel.close();
}

function alternarCategoria(id) {
  if (categoriasAtivas.has(id)) categoriasAtivas.delete(id);
  else categoriasAtivas.add(id);
  categoriasRascunho = new Set(categoriasAtivas);
  atualizarCategoriasAtivas();
  sincronizarChecksDoPainel();
  filtrarLocais();
}

function sincronizarChecksDoPainel() {
  document.querySelectorAll("input[data-categoria-id]").forEach((check) => {
    check.checked = categoriasRascunho.has(check.dataset.categoriaId);
  });
  atualizarEstadoDosGrupos();
}

function localDoElemento(elemento) {
  const tags = elemento.tags || {};
  const latitude = elemento.lat ?? elemento.center?.lat;
  const longitude = elemento.lon ?? elemento.center?.lon;
  if (!tags.name || latitude == null || longitude == null) return null;

  return {
    id: `${elemento.type}-${elemento.id}`,
    nome: tags.name,
    categoria: categoriaDoLocal(tags),
    endereco: [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(", ") || "Endereço não informado",
    latitude,
    longitude,
    acessibilidade: recursosAcessibilidade(tags)
  };
}

function localDoGeoJson(feature) {
  const tags = feature.properties || {};
  const base = localBaseDoGeoJson(feature);
  if (!base) return null;
  const acessibilidade = recursosAcessibilidade(tags);
  // A UNICID has been verified as providing every resource tracked here.
  // Keep this explicit so a stale or incomplete OSM tag cannot make its card
  // appear gray after the local dataset has been updated.
  if (/UNICID|Universidade Cidade de S[aã]o Paulo/i.test(tags.name || "")) {
    Object.keys(nomesRecursos).forEach((recurso) => { acessibilidade[recurso] = "available"; });
  }
  return {
    ...base,
    endereco: [tags.addr_street, tags.addr_housenumber].filter(Boolean).join(", ") || "Endereço não informado",
    acessibilidade
  };
}

async function carregarLocaisGeoJson() {
  estadoCarregamentoLocais = "carregando";
  filtrarLocais();
  try {
    const resposta = await fetch("data/locais.json", { cache: "no-cache" });
    if (!resposta.ok) throw new Error(`O arquivo de locais respondeu ${resposta.status}`);
    const dados = await resposta.json();
    locais = deduplicarLocais(dados.features.map(localDoGeoJson).filter(Boolean));
    estadoCarregamentoLocais = "carregado";
  } catch (erro) {
    console.error("Não foi possível carregar o GeoJSON:", erro);
    locais = [];
    estadoCarregamentoLocais = "erro";
  }
  renderizarPainelCategorias();
  filtrarLocais();
  abrirLocalSolicitado();
}

async function carregarLocaisOverpass() {
  const [latitude, longitude] = CENTRO_INICIAL;
  const consulta = `[out:json][timeout:20];(nwr(around:${RAIO_DESLOCAMENTO_METROS},${latitude},${longitude})[name][amenity~"university|college|school|restaurant|cafe|fast_food|pharmacy|parking|toilets|fitness_centre|kindergarten|childcare|nursery|fuel|subway|bicycle_parking|fire_station|place_of_worship|police|car_wash|dentist|bank|taxi|hospital|bus_station"];nwr(around:${RAIO_DESLOCAMENTO_METROS},${latitude},${longitude})[name][shop];nwr(around:${RAIO_DESLOCAMENTO_METROS},${latitude},${longitude})[name][leisure];nwr(around:${RAIO_DESLOCAMENTO_METROS},${latitude},${longitude})[name][railway~"station|subway_entrance"];nwr(around:${RAIO_DESLOCAMENTO_METROS},${latitude},${longitude})[name][public_transport=station];nwr(around:${RAIO_DESLOCAMENTO_METROS},${latitude},${longitude})[name][station=subway];);out center tags;`;
  try {
    const resposta = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(consulta)}`);
    if (!resposta.ok) throw new Error(`Overpass respondeu ${resposta.status}`);
    const dados = await resposta.json();
    locais = dados.elements.map(localDoElemento).filter(Boolean);
    renderizarPainelCategorias();
    filtrarLocais();
    abrirLocalSolicitado();
  } catch (erro) {
    console.error("Não foi possível carregar estabelecimentos do OpenStreetMap:", erro);
    locais = [];
    renderizarPainelCategorias();
    filtrarLocais();
  }
}

// Retângulo que envolve todos os locais da área piloto (data/locais.json), com ~110 m de folga.
const LIMITES_AREA = [[-23.5425, -46.5690], [-23.5279, -46.5514]];

// Mantém a vista dentro da área dos locais. O zoom mínimo fica um nível acima do que
// faria a área inteira caber na tela, para não afastar demais.
function configurarLimiteDaArea() {
  const limites = L.latLngBounds(LIMITES_AREA);
  mapa.setMaxBounds(limites);
  const ajustarZoomMinimo = () => {
    mapa.setMinZoom(Math.min(mapa.getBoundsZoom(limites) + 1, mapa.getMaxZoom()));
  };
  ajustarZoomMinimo();
  mapa.on("resize", ajustarZoomMinimo);
}

function inicializarMapa() {
  mapa = L.map("mapa", {
    minZoom: MODO_EMBED ? 16 : 15,
    maxBoundsViscosity: 1,
    maxZoom: 20,
    inertia: false,
    dragging: !MODO_EMBED,
    scrollWheelZoom: !MODO_EMBED,
    doubleClickZoom: !MODO_EMBED,
    boxZoom: !MODO_EMBED,
    keyboard: !MODO_EMBED,
    touchZoom: !MODO_EMBED,
    zoomControl: false,
    attributionControl: false
  }).setView(CENTRO_INICIAL, MODO_EMBED ? 19 : 20);
  if (!MODO_EMBED) configurarLimiteDaArea();
  if (!MODO_EMBED) {
    L.control.zoom({
      position: "bottomright",
      zoomInTitle: "Aproximar mapa",
      zoomOutTitle: "Afastar mapa"
    }).addTo(mapa);
  }
  // OpenFreeMap fornece o mapa-base com dados do OpenStreetMap sem usar os servidores de tiles da OSMF.
  camadaBase = L.maplibreGL({
    style: `https://tiles.openfreemap.org/styles/${estiloMapaAtual}`
  }).addTo(mapa);
  const glMap = camadaBase.getMaplibreMap();
  const ocultarPois = () => {
    if (!glMap.getStyle()) return;
    glMap.getStyle().layers.forEach((layer) => {
      if (layer["source-layer"] === "poi") {
        glMap.setLayoutProperty(layer.id, "visibility", "none");
      }
    });
  };
  glMap.once("load", ocultarPois);
  glMap.on("style.load", ocultarPois);
  // Indicador visual fixo no ponto inicial; não pertence à lista de estabelecimentos.
  if (!MODO_EMBED) {
    L.marker(CENTRO_INICIAL, {
      icon: L.divIcon({ className: "icone-localizacao", html: '<span class="ponto-localizacao" aria-hidden="true"></span>', iconSize: [22, 22], iconAnchor: [11, 11] }),
      interactive: false, keyboard: false
    }).addTo(mapa);
  }
  camadaMarcadores = L.layerGroup().addTo(mapa);

  // O mapa é criado dentro de um flex container. Em alguns navegadores o
  // tamanho final só fica disponível depois do primeiro layout; sem esta
  // atualização, os overlays podem só aparecer após um zoom.
  const atualizarLayoutMapa = () => {
    mapa.invalidateSize({ animate: false, pan: false });
    document.querySelector(".campo-busca").getBoundingClientRect();
  };
  mapa.whenReady(() => requestAnimationFrame(atualizarLayoutMapa));

  // Quando o contêiner muda de tamanho (por exemplo, o iframe da home cresce depois de carregar),
  // o Leaflet e a camada do MapLibre precisam ser remedidos; sem isso sobra uma faixa sem mapa embaixo.
  if ("ResizeObserver" in window) {
    let medida = "";
    new ResizeObserver(([entrada]) => {
      const { width, height } = entrada.contentRect;
      const atual = `${Math.round(width)}x${Math.round(height)}`;
      if (!width || !height || atual === medida) return;
      medida = atual;
      mapa.invalidateSize({ animate: false, pan: false });
      glMap.resize();
    }).observe(document.getElementById("mapa"));
  }
}

function recursosDoLocal(local) {
  return Object.keys(nomesRecursos).filter((recurso) => local.acessibilidade?.[recurso] === "available");
}

function conteudoPopup(local) {
  const acessibilidade = local.acessibilidade || {};
  const grupos = [
    ["entradaAcessivel", "rampaAcessivel", "estacionamentoAcessivel"],
    ["libras"],
    ["pisoTatil", "braille", "banheiroAcessivel"]
  ];
  const ordem = grupos.flat();
  const recursosOrdenados = [...ordem, ...Object.keys(nomesRecursos).filter((chave) => !ordem.includes(chave))].filter((chave, indice, lista) => lista.indexOf(chave) === indice);
  const disponiveis = recursosOrdenados.filter((chave) => acessibilidade[chave] === "available");
  const renderTile = (chave) => {
    const nome = nomesRecursos[chave];
    const estado = acessibilidade[chave] || "unknown";
    const descricao = estado === "available" ? nome : `${nome} (${estado === "unavailable" ? "não disponível" : "não informado"})`;
    if (estado !== "available") return `<span class="tile tile-${estado} estado-${estado}" role="img" aria-label="${descricao}" title="${descricao}"><img src="${iconesRecursos[chave]}" alt=""></span>`;
    return `<button type="button" class="tile tile-disponivel estado-available" aria-label="${nome}" title="${nome}" aria-pressed="false" data-recurso-nome="${nome}"><img src="${iconesRecursos[chave]}" alt=""></button>`;
  };
  // Mantém sempre a mesma disposição em grupos, independentemente do estado de cada recurso.
  const extras = recursosOrdenados.filter((chave) => !ordem.includes(chave));
  const gruposDeRecursos = [...grupos, extras]
    .filter((grupo) => grupo.length)
    .map((grupo) => `<div class="grp">${grupo.map(renderTile).join("")}</div>`).join("");
  const dica = MODO_EMBED || !disponiveis.length ? "" : " · toque num ícone";
  const cap = `<p class="cap" aria-live="polite"><strong>${disponiveis.length} ${disponiveis.length === 1 ? "disponível" : "disponíveis"}</strong>${dica}</p>`;
  const destino = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${local.latitude},${local.longitude}`)}`;
  return `<article class="popup-estabelecimento" style="--categoria-cor:${corDaCategoria(local)}"><div class="cabecalho-estabelecimento"><span class="logo-estabelecimento categoria-${chaveCategoriaLocal(local)}" style="--categoria-cor:${corDaCategoria(local)}" aria-hidden="true">${iconeDoLocal(local)}</span><div class="identidade-estabelecimento"><h2 class="popup-titulo">${local.nome}</h2><span class="endereco-estabelecimento">${local.endereco}</span></div><button class="fechar-estabelecimento" type="button" aria-label="Fechar informações"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div class="indicadores-resumo" role="group" aria-label="Recursos de acessibilidade">${gruposDeRecursos}</div>${cap}<div class="popup-acoes"><a class="popup-como-chegar" href="${destino}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m3 11 18-8-8 18-2-8-8-2z"/></svg>Como chegar</a><a class="popup-detalhes" href="acessibilidade.html">Ver detalhes</a></div></article>`;
}

// Escolhe de que lado do marcador o cartão aparece para ele caber na área visível do mapa:
// marcador perto da borda esquerda → cartão à direita; perto da direita → à esquerda;
// perto do topo → abaixo; nos demais casos → acima (padrão). A seta acompanha o marcador.
const POPUP_LADOS = ["popup-pos-acima", "popup-pos-abaixo", "popup-pos-direita", "popup-pos-esquerda"];
function posicionarPopup(marcador) {
  const popup = marcador.getPopup();
  const elemento = popup?.getElement();
  const wrapper = elemento?.querySelector(".leaflet-popup-content-wrapper");
  if (!wrapper) return;
  const margem = 12;
  const seta = 20;
  const largura = elemento.offsetWidth;
  const altura = wrapper.offsetHeight;
  const tamanho = mapa.getSize();
  const caixa = mapa.getContainer().getBoundingClientRect();
  const area = {
    esquerda: Math.max(0, -caixa.left) + margem,
    topo: Math.max(0, -caixa.top) + margem,
    direita: Math.min(tamanho.x, (window.innerWidth || caixa.right) - caixa.left) - margem,
    baixo: Math.min(tamanho.y, (window.innerHeight || caixa.bottom) - caixa.top) - margem
  };
  const ponto = mapa.latLngToContainerPoint(marcador.getLatLng());
  const icone = marcador.options.icon.options;
  const ancora = ponto.add(L.point(icone.popupAnchor));
  const meioMarcadorY = ponto.y - icone.iconAnchor[1] + icone.iconSize[1] / 2;
  const meiaLarguraMarcador = icone.iconSize[0] / 2;
  const limitar = (valor, minimo, maximo) => Math.max(minimo, Math.min(valor, Math.max(minimo, maximo)));

  const topoAcima = ancora.y + 7 - seta - altura;
  const topoAbaixo = ponto.y + 4 + seta;
  const cabeAcima = topoAcima >= area.topo;
  const cabeAbaixo = topoAbaixo + altura <= area.baixo;
  const lateral = meiaLarguraMarcador + seta + largura;
  const pertoEsquerda = ponto.x - area.esquerda < largura / 2;
  const pertoDireita = area.direita - ponto.x < largura / 2;

  let lado;
  if (pertoEsquerda && area.direita - ponto.x >= lateral) lado = "direita";
  else if (pertoDireita && ponto.x - area.esquerda >= lateral) lado = "esquerda";
  else if (cabeAcima) lado = "acima";
  else if (cabeAbaixo) lado = "abaixo";
  else lado = area.direita - ponto.x >= ponto.x - area.esquerda ? "direita" : "esquerda";

  let x0;
  let y0;
  if (lado === "acima" || lado === "abaixo") {
    x0 = limitar(ponto.x - largura / 2, area.esquerda, area.direita - largura);
    y0 = lado === "acima" ? topoAcima : topoAbaixo;
    elemento.style.setProperty("--popup-seta-x", `${limitar(ponto.x - x0, 24, largura - 24)}px`);
  } else {
    x0 = lado === "direita" ? ponto.x + meiaLarguraMarcador + seta : ponto.x - meiaLarguraMarcador - seta - largura;
    y0 = limitar(meioMarcadorY - altura / 2, area.topo, area.baixo - altura);
    elemento.style.setProperty("--popup-seta-y", `${limitar(meioMarcadorY - y0, 24, altura - 24)}px`);
  }
  // O Leaflet posiciona a base do popup (com a margem da seta) no ponto ancora + offset.
  popup.options.offset = L.point(Math.round(x0 + largura / 2 - ancora.x), Math.round(y0 + altura + seta - ancora.y));
  elemento.classList.remove(...POPUP_LADOS);
  elemento.classList.add(`popup-pos-${lado}`);
  popup._updatePosition();
}

// Remove os marcadores anteriores e cria apenas os que correspondem à busca atual.
function criarMarcadores(locaisFiltrados) {
  camadaMarcadores.clearLayers();
  Object.keys(marcadores).forEach((id) => delete marcadores[id]);
  const novosMarcadores = [];

  locaisFiltrados.forEach((local) => {
    const marcador = L.marker([local.latitude, local.longitude], {
      title: local.nome,
      alt: local.nome,
      keyboard: !MODO_EMBED,
      icon: L.divIcon({ className: `pin-estabelecimento${MODO_EMBED && !/UNICID|Universidade Cidade de S[aã]o Paulo/i.test(local.nome) ? " pin-preview-secundario" : ""}`, html: `<span class="pin-estabelecimento-forma categoria-${chaveCategoriaLocal(local)}" style="--categoria-cor:${corDaCategoria(local)}"><span class="pin-estabelecimento-icone">${iconeDoLocal(local)}</span></span>`, iconSize: [44, 54], iconAnchor: [22, 52], popupAnchor: [0, -48] })
    }).bindPopup(conteudoPopup(local), { maxWidth: 320, minWidth: 280, closeButton: false, className: "popup-acessibilidade", autoPan: false });
    marcador.on("popupopen", (evento) => {
      if (!MODO_EMBED) posicionarPopup(marcador);
      const popup = evento.popup.getElement();
      popup.querySelector(".fechar-estabelecimento").addEventListener("click", () => marcador.closePopup());
      const cap = popup.querySelector(".cap");
      const padrao = cap.innerHTML;
      const tiles = [...popup.querySelectorAll(".tile-disponivel")];
      const mostrarNome = (tile) => { cap.innerHTML = `<strong>${tile.dataset.recursoNome}</strong>`; };
      const restaurarCap = () => { cap.innerHTML = padrao; };
      tiles.forEach((tile) => {
        tile.addEventListener("mouseenter", () => mostrarNome(tile));
        tile.addEventListener("mouseleave", restaurarCap);
        tile.addEventListener("focus", () => mostrarNome(tile));
        tile.addEventListener("blur", restaurarCap);
        tile.addEventListener("click", () => {
          tiles.forEach((item) => item.setAttribute("aria-pressed", item === tile ? "true" : "false"));
          mostrarNome(tile);
        });
      });
    });
    novosMarcadores.push(marcador);
    marcadores[local.id] = marcador;
  });
  novosMarcadores.forEach((marcador) => marcador.addTo(camadaMarcadores));
}

function resumoRecursos(local) {
  return recursosDoLocal(local).slice(0, 3).map((recurso) => `<span class="recurso-tag">${nomesRecursos[recurso]}</span>`).join("");
}

// Atualiza a lista lateral com os mesmos locais exibidos no mapa.
function mostrarLocais(locaisFiltrados) {
  const lista = document.querySelector("#lista-locais");
  const contador = document.querySelector("#contador-resultados");
  contador.textContent = estadoCarregamentoLocais === "carregando"
    ? "Carregando…"
    : `${locaisFiltrados.length} ${locaisFiltrados.length === 1 ? "local" : "locais"}`;

  if (!locaisFiltrados.length) {
    if (estadoCarregamentoLocais === "carregando") {
      lista.innerHTML = '<p class="estado-vazio" role="status">Carregando locais…</p>';
    } else if (estadoCarregamentoLocais === "erro") {
      lista.innerHTML = '<div class="estado-vazio" role="status"><p>Não foi possível carregar os locais.</p><button class="tentar-novamente" type="button">Tentar novamente</button></div>';
      lista.querySelector(".tentar-novamente").addEventListener("click", carregarLocaisGeoJson);
    } else {
      lista.innerHTML = `<p class="estado-vazio">${locais.length ? "Nenhum local corresponde aos filtros escolhidos." : "Nenhum local disponível nesta área."}</p>`;
    }
    return;
  }

  lista.innerHTML = locaisFiltrados.map((local) => `
    <button class="local-item" type="button" data-id="${local.id}">
      <span class="local-nome">${local.nome}</span>
      <span class="local-meta local-categoria">${local.categoria}</span>
      <span class="local-meta local-endereco">${local.endereco}</span>
      <span class="recursos-resumo">${resumoRecursos(local)}</span>
    </button>
  `).join("");

  document.querySelectorAll(".local-item").forEach((item) => {
    item.addEventListener("click", () => abrirLocal(item.dataset.id));
  });
}

// Pesquisa, categoria e recursos selecionados são aplicados ao mesmo tempo.
function filtrarLocais() {
  const termo = document.querySelector("#busca").value.trim().toLocaleLowerCase("pt-BR");
  const recursosSelecionados = [...document.querySelectorAll("[data-recurso]:checked")].map((campo) => campo.dataset.recurso);
  const locaisFiltrados = locais.filter((local) => {
    const textoDoLocal = `${local.nome} ${local.categoria} ${local.endereco}`.toLocaleLowerCase("pt-BR");
    const correspondeBusca = !termo || textoDoLocal.includes(termo);
    const idCategoria = idDaCategoriaLocal(local);
    const correspondeCategoria = categoriasAtivas.size === 0 || categoriasAtivas.has(idCategoria);
    const possuiRecursos = recursosSelecionados.every((recurso) => local.acessibilidade?.[recurso] === "available");
    return correspondeBusca && correspondeCategoria && possuiRecursos;
  });

  criarMarcadores(locaisFiltrados);
  mostrarLocais(locaisFiltrados);
  return locaisFiltrados;
}

function centralizarNosTerminaisOnibus() {
  const terminais = locais.filter((local) => idDaCategoriaLocal(local) === "onibus");
  if (!terminais.length) return;
  const latitude = terminais.reduce((soma, local) => soma + local.latitude, 0) / terminais.length;
  const longitude = terminais.reduce((soma, local) => soma + local.longitude, 0) / terminais.length;
  // Reposiciona a vista para os terminais sem mudar o zoom escolhido pelo usuário.
  mapa.setView([latitude, longitude], mapa.getZoom(), { animate: false });
}

function abrirLocal(id) {
  const local = locais.find((item) => item.id === id)
    || (id === "unicid" ? locais.find((item) => /UNICID|Universidade Cidade de S[aã]o Paulo/i.test(item.nome)) : null);
  const marcador = marcadores[id];
  const marcadorDoLocal = marcador || (local && marcadores[local.id]);
  if (!local || !marcadorDoLocal) return;
  mapa.setView([local.latitude, local.longitude], MODO_EMBED ? 17 : 20, { animate: false });
  marcadorDoLocal.openPopup();
  if (MODO_EMBED) requestAnimationFrame(() => centralizarPopupComMarcador(marcadorDoLocal));
}

function centralizarPopupComMarcador(marcador) {
  const popup = marcador.getPopup()?.getElement();
  if (!popup || !mapa.getSize().x || !mapa.getSize().y) return;
  const popupRect = popup.getBoundingClientRect();
  const mapaRect = mapa.getContainer().getBoundingClientRect();
  const ponto = mapa.latLngToContainerPoint(marcador.getLatLng());
  const icone = marcador.options.icon.options;
  const marcadorEsquerda = ponto.x - icone.iconAnchor[0];
  const marcadorTopo = ponto.y - icone.iconAnchor[1];
  const esquerda = Math.min(popupRect.left - mapaRect.left, marcadorEsquerda);
  const direita = Math.max(popupRect.right - mapaRect.left, marcadorEsquerda + icone.iconSize[0]);
  const topo = Math.min(popupRect.top - mapaRect.top, marcadorTopo);
  const baixo = Math.max(popupRect.bottom - mapaRect.top, ponto.y);
  const deslocamentoX = (esquerda + direita) / 2 - mapa.getSize().x / 2;
  const deslocamentoY = (topo + baixo) / 2 - mapa.getSize().y / 2;
  mapa.panBy([deslocamentoX, deslocamentoY], { animate: false });
}

function abrirLocalSolicitado() {
  const id = new URLSearchParams(window.location.search).get("local");
  if (id) abrirLocal(id);
}

function configurarEventos() {
  const sincronizarContrasteMapa = () => {
    const ativo = document.documentElement.classList.contains("alto-contraste");
    if (ativo === contrasteMapaAtivo) return;
    if (ativo) {
      estiloMapaAnteriorContraste = estiloMapaAtual;
      contrasteMapaAtivo = true;
      aplicarEstiloMapa("dark");
    } else {
      contrasteMapaAtivo = false;
      aplicarEstiloMapa(estiloMapaAnteriorContraste);
    }
  };
  new MutationObserver(sincronizarContrasteMapa).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  document.querySelector("#busca").addEventListener("input", filtrarLocais);
  document.querySelectorAll("[data-recurso]").forEach((campo) => campo.addEventListener("change", filtrarLocais));
  const gatilhoCategorias = document.querySelector("#abrir-categorias");
  const painelCategorias = document.querySelector("#painel-categorias");
  const gatilhoBanheiros = document.querySelector("#filtro-banheiros");

  gatilhoCategorias.addEventListener("click", () => {
    if (painelCategorias.open) fecharPainelCategorias();
    else abrirPainelCategorias();
  });
  document.querySelector("#fechar-painel-categorias").addEventListener("click", () => fecharPainelCategorias());
  painelCategorias.addEventListener("cancel", () => { restaurarFocoCategorias = true; });
  painelCategorias.addEventListener("close", () => {
    if (painelCategorias.open) return;
    gatilhoCategorias.setAttribute("aria-expanded", "false");
    const deveRestaurarFoco = restaurarFocoCategorias;
    restaurarFocoCategorias = false;
    if (deveRestaurarFoco) requestAnimationFrame(() => gatilhoCategorias.focus());
  });
  painelCategorias.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !painelCategoriasModal) {
      evento.preventDefault();
      fecharPainelCategorias();
    }
  });
  document.addEventListener("pointerdown", (evento) => {
    if (!painelCategorias.open || painelCategoriasModal || painelCategorias.contains(evento.target) || gatilhoCategorias.contains(evento.target)) return;
    fecharPainelCategorias(false);
  });
  window.addEventListener("resize", () => {
    if (painelCategorias.open && !painelCategoriasModal) posicionarPainelCategorias();
    atualizarIndicadorScrollCategorias();
  });
  document.querySelector("#painel-categorias-grupos").addEventListener("scroll", atualizarIndicadorScrollCategorias, { passive: true });
  const larguraCelular = window.matchMedia("(max-width: 639px)");
  larguraCelular.addEventListener("change", () => {
    if (!painelCategorias.open || painelCategoriasModal === larguraCelular.matches) return;
    const focoAnterior = document.activeElement;
    fecharPainelCategorias(false);
    abrirPainelCategorias(false, false);
    requestAnimationFrame(() => {
      if (focoAnterior && painelCategorias.contains(focoAnterior)) focoAnterior.focus();
      else document.querySelector("#titulo-painel-categorias").focus();
    });
  });

  gatilhoBanheiros.addEventListener("click", () => alternarCategoria("banheiros"));
  document.querySelector("#categorias-ativas").addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-remover-categoria]");
    if (!botao) return;
    const botoes = [...document.querySelectorAll("[data-remover-categoria]")];
    const proximoIndice = botoes.indexOf(botao);
    const proximoId = botoes[proximoIndice + 1]?.dataset.removerCategoria || botoes[proximoIndice - 1]?.dataset.removerCategoria;
    alternarCategoria(botao.dataset.removerCategoria);
    const proximo = proximoId && document.querySelector(`[data-remover-categoria="${proximoId}"]`);
    (proximo || gatilhoCategorias).focus();
  });
  document.querySelector("#painel-categorias-grupos").addEventListener("change", (evento) => {
    const check = evento.target.closest("input[data-categoria-id]");
    if (!check) return;
    if (check.checked) categoriasRascunho.add(check.dataset.categoriaId);
    else categoriasRascunho.delete(check.dataset.categoriaId);
    atualizarEstadoDosGrupos();
  });
  document.querySelector("#painel-categorias-grupos").addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-marcar-grupo]");
    if (!botao) return;
    const checks = [...botao.closest("fieldset").querySelectorAll("input[data-categoria-id]")];
    const marcar = !checks.every((check) => categoriasRascunho.has(check.dataset.categoriaId));
    checks.forEach((check) => {
      check.checked = marcar;
      if (marcar) categoriasRascunho.add(check.dataset.categoriaId);
      else categoriasRascunho.delete(check.dataset.categoriaId);
    });
    atualizarEstadoDosGrupos();
  });
  document.querySelector("#limpar-categorias").addEventListener("click", () => {
    categoriasRascunho.clear();
    categoriasAtivas.clear();
    atualizarCategoriasAtivas();
    sincronizarChecksDoPainel();
    filtrarLocais();
  });
  document.querySelector("#aplicar-categorias").addEventListener("click", () => {
    categoriasAtivas.clear();
    categoriasRascunho.forEach((id) => categoriasAtivas.add(id));
    atualizarCategoriasAtivas();
    filtrarLocais();
    if (categoriasAtivas.has("onibus")) centralizarNosTerminaisOnibus();
    fecharPainelCategorias();
  });
  painelCategorias.addEventListener("click", (evento) => {
    if (evento.target === painelCategorias && painelCategoriasModal) fecharPainelCategorias();
  });
  renderizarPainelCategorias();
  atualizarCategoriasAtivas();
}

inicializarMapa();
configurarEventos();
filtrarLocais();
carregarLocaisGeoJson();
