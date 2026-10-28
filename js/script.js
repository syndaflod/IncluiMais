const CENTRO_INICIAL = [-23.53598, -46.55948];
const RAIO_DESLOCAMENTO_METROS = 100;
const RAIO_TERRA_METROS = 6371000;
let locais = [];
let estadoCarregamentoLocais = "carregando";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

let mapa;
let camadaBase;
let camadaMarcadores;
let categoriaAtual = "Todos";
const marcadores = {};

const nomesRecursos = {
  entradaAcessivel: "Entrada acessível",
  banheiroAcessivel: "Banheiro acessível",
  estacionamentoAcessivel: "Estacionamento acessível",
  libras: "Atendimento em Libras",
  pisoTatil: "Piso tátil",
  braille: "Material em braille"
};

const iconesRecursos = {
  entradaAcessivel: "assets/accessibility/entrada-acessivel.svg",
  banheiroAcessivel: "assets/accessibility/banheiro-acessivel.svg",
  estacionamentoAcessivel: "assets/accessibility/estacionamento-acessivel.svg",
  libras: "assets/accessibility/libras.svg",
  pisoTatil: "assets/accessibility/piso-tatil.svg",
  braille: "assets/accessibility/braille.svg"
};

const iconesEstabelecimentos = {
  restaurante: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v7M4.5 3v4.5a2.5 2.5 0 0 0 5 0V3M7 10v11M17 3v18M14.5 8h5M17 3c2.5 1.6 2.5 4.4 2.5 7"/></svg>',
  farmacia: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10.5 20.5 10-10a4.95 4.95 0 0 0-7-7l-10 10a4.95 4.95 0 0 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>',
  ensino: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 9 9-5 9 5-9 5-9-5ZM6 11v5c3.5 3 8.5 3 12 0v-5M21 9v7"/></svg>',
  lazer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5a4 4 0 0 0-3.7 5.5A3.5 3.5 0 0 0 9 16h6a3.5 3.5 0 0 0 .7-7A4 4 0 0 0 12 3.5ZM12 16v5M9 21h6"/></svg>',
  estacionamento: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 20V4h6a4 4 0 0 1 0 8H7M7 12h6"/></svg>',
  loja: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16l-1.2 10H5.2L4 10ZM6 10l2-5h8l2 5M9 20v-6h6v6"/></svg>',
  banheiro: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM8 4v5h8V4M8 13h8M8 16h5"/></svg>',
  academia: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/></svg>',
  padrao: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V7l8-4 8 4v13M8 20v-6h8v6M9 9h.01M15 9h.01"/></svg>'
};

function recursosAcessibilidade(tags = {}) {
  const campo = (...nomes) => nomes.map((nome) => tags[nome]).find((valor) => valor != null && valor !== "");
  const estado = (...nomes) => estadoAcessibilidade(campo(...nomes));
  const acessibilidade = {
    entradaAcessivel: estado("entrance:wheelchair", "wheelchair"),
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

function categoriaDoLocal(tags) {
  if (tags.amenity === "fitness_centre" || tags.leisure === "fitness_centre" || tags.leisure === "sports_centre") return "Academia";
  if (tags.amenity === "university" || tags.amenity === "college" || tags.amenity === "school") return "Instituição de ensino";
  if (tags.amenity === "restaurant" || tags.amenity === "cafe" || tags.amenity === "fast_food") return "Restaurante";
  if (tags.amenity === "pharmacy") return "Farmácia";
  if (tags.amenity === "parking") return "Estacionamento";
  if (tags.amenity === "toilets") return "Banheiro";
  if (tags.shop) return "Loja";
  return tags.leisure ? "Espaço de lazer" : "Estabelecimento";
}

function chaveCategoriaLocal(local) {
  const categorias = {
    "Restaurante": "restaurante", "Farmácia": "farmacia", "Instituição de ensino": "ensino",
    "Espaço de lazer": "lazer", "Estacionamento": "estacionamento", "Loja": "loja", "Banheiro": "banheiro", "Academia": "academia"
  };
  return categorias[local.categoria] || "padrao";
}

function iconeDoLocal(local) {
  return iconesEstabelecimentos[chaveCategoriaLocal(local)];
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

function pontoDaFeature(feature) {
  const coordenadas = feature.geometry?.coordinates;
  if (!coordenadas) return null;
  if (feature.geometry.type === "Point") return [coordenadas[1], coordenadas[0]];
  const pontos = [];
  const coletar = (valor) => {
    if (typeof valor[0] === "number") pontos.push(valor);
    else valor.forEach(coletar);
  };
  coletar(coordenadas);
  if (!pontos.length) return null;
  return [
    pontos.reduce((total, ponto) => total + ponto[1], 0) / pontos.length,
    pontos.reduce((total, ponto) => total + ponto[0], 0) / pontos.length
  ];
}

function localDoGeoJson(feature) {
  const tags = feature.properties || {};
  if (!tags.name?.trim()) return null;
  if (!["amenity", "shop", "leisure", "healthcare", "tourism"].some((tag) => tags[tag])) return null;
  const ponto = pontoDaFeature(feature);
  if (!ponto) return null;
  return {
    id: `geojson-${tags.osm_id}`,
    nome: tags.name.trim(),
    categoria: categoriaDoLocal(tags),
    endereco: [tags.addr_street, tags.addr_housenumber].filter(Boolean).join(", ") || "Endereço não informado",
    latitude: ponto[0],
    longitude: ponto[1],
    acessibilidade: recursosAcessibilidade(tags)
  };
}

async function carregarLocaisGeoJson() {
  estadoCarregamentoLocais = "carregando";
  filtrarLocais();
  try {
    const resposta = await fetch("data/locais.json");
    if (!resposta.ok) throw new Error(`O arquivo de locais respondeu ${resposta.status}`);
    const dados = await resposta.json();
    locais = deduplicarLocais(dados.features.map(localDoGeoJson).filter(Boolean));
    estadoCarregamentoLocais = "carregado";
  } catch (erro) {
    console.error("Não foi possível carregar o GeoJSON:", erro);
    locais = [];
    estadoCarregamentoLocais = "erro";
  }
  filtrarLocais();
}

// O GeoJSON mistura pontos, áreas e relações OSM do mesmo local.
// Mantém uma única entrada quando nome, categoria e posição são praticamente iguais.
function deduplicarLocais(itens) {
  const resultado = [];
  const ids = new Set();
  for (const local of itens) {
    const nome = local.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, " ").trim();
    const duplicado = resultado.some((existente) => {
      if (existente.categoria !== local.categoria) return false;
      const outroNome = existente.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, " ").trim();
      if (outroNome !== nome) return false;
      // Praças e instituições podem vir duplicadas como way e relation OSM,
      // com centroides diferentes para o mesmo espaço ou campus.
      if (["Espaço de lazer", "Instituição de ensino"].includes(local.categoria)) return true;
      const lat = (local.latitude - existente.latitude) * 111320;
      const lng = (local.longitude - existente.longitude) * 111320 * Math.cos(local.latitude * Math.PI / 180);
      return Math.hypot(lat, lng) < 45;
    });
    if (!duplicado && !ids.has(local.id)) {
      resultado.push(local);
      ids.add(local.id);
    }
  }
  return resultado;
}

async function carregarLocaisOverpass() {
  const [latitude, longitude] = CENTRO_INICIAL;
  const consulta = `[out:json][timeout:20];(nwr(around:${RAIO_DESLOCAMENTO_METROS},${latitude},${longitude})[name][amenity~"university|college|school|restaurant|cafe|fast_food|pharmacy|parking|toilets|fitness_centre"];nwr(around:${RAIO_DESLOCAMENTO_METROS},${latitude},${longitude})[name][shop];nwr(around:${RAIO_DESLOCAMENTO_METROS},${latitude},${longitude})[name][leisure];);out center tags;`;
  try {
    const resposta = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(consulta)}`);
    if (!resposta.ok) throw new Error(`Overpass respondeu ${resposta.status}`);
    const dados = await resposta.json();
    locais = dados.elements.map(localDoElemento).filter(Boolean);
    filtrarLocais();
  } catch (erro) {
    console.error("Não foi possível carregar estabelecimentos do OpenStreetMap:", erro);
    locais = [];
    filtrarLocais();
  }
}

function limitarCentro(latlng) {
  const distancia = mapa.distance(CENTRO_INICIAL, latlng);
  if (distancia <= RAIO_DESLOCAMENTO_METROS) return latlng;

  const rad = Math.PI / 180;
  const latitudeOrigem = CENTRO_INICIAL[0] * rad;
  const longitudeOrigem = CENTRO_INICIAL[1] * rad;
  const latitudeDestino = latlng.lat * rad;
  const diferencaLongitude = (latlng.lng - CENTRO_INICIAL[1]) * rad;
  const rumo = Math.atan2(
    Math.sin(diferencaLongitude) * Math.cos(latitudeDestino),
    Math.cos(latitudeOrigem) * Math.sin(latitudeDestino) -
      Math.sin(latitudeOrigem) * Math.cos(latitudeDestino) * Math.cos(diferencaLongitude)
  );
  const angulo = RAIO_DESLOCAMENTO_METROS / RAIO_TERRA_METROS;
  const latitudeLimitada = Math.asin(
    Math.sin(latitudeOrigem) * Math.cos(angulo) +
      Math.cos(latitudeOrigem) * Math.sin(angulo) * Math.cos(rumo)
  );
  const longitudeLimitada = longitudeOrigem + Math.atan2(
    Math.sin(rumo) * Math.sin(angulo) * Math.cos(latitudeOrigem),
    Math.cos(angulo) - Math.sin(latitudeOrigem) * Math.sin(latitudeLimitada)
  );
  return L.latLng(latitudeLimitada / rad, longitudeLimitada / rad);
}

// Limita o centro a um raio de 100 m com operações simples em pixels durante o arrasto.
// A correção geográfica mais cara acontece apenas ao terminar o gesto ou mudar o zoom.
function configurarLimiteCircular() {
  const arraste = mapa.dragging._draggable;
  let posicaoBrutaAnterior;
  arraste.on("dragstart", () => {
    posicaoBrutaAnterior = arraste._startPos.clone();
  });
  // Limita mouse e toque antes de o Leaflet mover o painel do mapa.
  arraste.on("predrag", () => {
    const posicaoBruta = arraste._newPos.clone();
    const deslocamento = posicaoBruta.subtract(posicaoBrutaAnterior || arraste._startPos);
    posicaoBrutaAnterior = posicaoBruta;
    const posicaoAtual = mapa._getMapPanePos();
    const centroProjetado = mapa.project(mapa.getCenter());
    const centroPretendido = mapa.unproject(centroProjetado.subtract(deslocamento));
    const centroLimitado = limitarCentro(centroPretendido);
    arraste._newPos = posicaoAtual.add(centroProjetado.subtract(mapa.project(centroLimitado)));
  });

  let corrigindo = false;
  const corrigirCentro = () => {
    if (corrigindo) return;
    const centroLimitado = limitarCentro(mapa.getCenter());
    if (mapa.distance(centroLimitado, mapa.getCenter()) < 0.01) return;
    corrigindo = true;
    mapa.setView(centroLimitado, mapa.getZoom(), { animate: false });
    corrigindo = false;
  };
  mapa.on("moveend zoomend", corrigirCentro);
}

function inicializarMapa() {
  mapa = L.map("mapa", {
    minZoom: 17,
    maxZoom: 19,
    inertia: false,
    zoomControl: false,
    attributionControl: false
  }).setView(CENTRO_INICIAL, 19);
  configurarLimiteCircular();
  L.control.zoom({
    position: "bottomright",
    zoomInTitle: "Aproximar mapa",
    zoomOutTitle: "Afastar mapa"
  }).addTo(mapa);
  // OpenFreeMap fornece o mapa-base com dados do OpenStreetMap sem usar os servidores de tiles da OSMF.
  camadaBase = L.maplibreGL({
    style: "https://tiles.openfreemap.org/styles/bright"
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
  L.marker(CENTRO_INICIAL, {
    icon: L.divIcon({ className: "icone-localizacao", html: '<span class="ponto-localizacao" aria-hidden="true"></span>', iconSize: [22, 22], iconAnchor: [11, 11] }),
    interactive: false, keyboard: false
  }).addTo(mapa);
  camadaMarcadores = L.layerGroup().addTo(mapa);

  // O mapa é criado dentro de um flex container. Em alguns navegadores o
  // tamanho final só fica disponível depois do primeiro layout; sem esta
  // atualização, os overlays podem só aparecer após um zoom.
  const atualizarLayoutMapa = () => {
    mapa.invalidateSize({ animate: false, pan: false });
    document.querySelector(".campo-busca").getBoundingClientRect();
  };
  mapa.whenReady(() => requestAnimationFrame(atualizarLayoutMapa));
}

function recursosDoLocal(local) {
  return Object.keys(nomesRecursos).filter((recurso) => local.acessibilidade?.[recurso] === "available");
}

function conteudoPopup(local) {
  const acessibilidade = local.acessibilidade || {};
  const status = { available: ["Disponível", "✓"], unavailable: ["Não disponível", "×"], unknown: ["Não informado", "?"] };
  const indicadores = Object.entries(nomesRecursos).map(([chave, nome]) => {
    const estado = acessibilidade[chave] || "unknown";
    return `<span class="indicador estado-${estado}" role="img" aria-label="${nome}: ${status[estado]?.[0] || status.unknown[0]}" title="${nome}: ${status[estado]?.[0] || status.unknown[0]}"><img src="${iconesRecursos[chave]}" alt=""></span>`;
  }).join("");
  return `<article class="popup-estabelecimento"><div class="cabecalho-estabelecimento"><span class="logo-estabelecimento categoria-${chaveCategoriaLocal(local)}" aria-hidden="true">${iconeDoLocal(local)}</span><div class="identidade-estabelecimento"><h2 class="popup-titulo">${local.nome}</h2><span class="endereco-estabelecimento">${local.endereco}</span></div><button class="fechar-estabelecimento" type="button" aria-label="Fechar informações"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div class="indicadores-resumo" role="group" aria-label="Recursos de acessibilidade">${indicadores}</div></article>`;
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
      icon: L.divIcon({ className: "pin-estabelecimento", html: `<span class="pin-estabelecimento-forma categoria-${chaveCategoriaLocal(local)}"><span class="pin-estabelecimento-icone">${iconeDoLocal(local)}</span></span>`, iconSize: [44, 54], iconAnchor: [22, 52], popupAnchor: [0, -48] })
    }).bindPopup(conteudoPopup(local), { maxWidth: 320, minWidth: 280, closeButton: false, className: "popup-acessibilidade" });
    marcador.on("popupopen", (evento) => {
      const popup = evento.popup.getElement();
      popup.querySelector(".fechar-estabelecimento").addEventListener("click", () => marcador.closePopup());
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
    const correspondeCategoria = categoriaAtual === "Todos" || local.categoria === categoriaAtual;
    const possuiRecursos = recursosSelecionados.every((recurso) => local.acessibilidade?.[recurso] === "available");
    return correspondeBusca && correspondeCategoria && possuiRecursos;
  });

  criarMarcadores(locaisFiltrados);
  mostrarLocais(locaisFiltrados);
}

function abrirLocal(id) {
  const local = locais.find((item) => item.id === id);
  const marcador = marcadores[id];
  if (!local || !marcador) return;
  mapa.setView([local.latitude, local.longitude], 19, { animate: false });
  marcador.openPopup();
}

function configurarEventos() {
  document.querySelectorAll('input[name="tema-mapa"]').forEach((opcao) => {
    opcao.addEventListener("change", () => {
      if (opcao.checked) {
        camadaBase.getMaplibreMap().setStyle(`https://tiles.openfreemap.org/styles/${opcao.value}`);
        document.querySelector(".menu-temas").open = false;
      }
    });
  });
  document.querySelector("#busca").addEventListener("input", filtrarLocais);
  document.querySelectorAll("[data-recurso]").forEach((campo) => campo.addEventListener("change", filtrarLocais));
  document.querySelectorAll(".botao-categoria").forEach((botao) => {
    botao.addEventListener("click", () => {
      categoriaAtual = botao.dataset.categoria;
      document.querySelectorAll(".botao-categoria").forEach((item) => {
        const ativo = item === botao;
        item.classList.toggle("ativo", ativo);
        item.setAttribute("aria-pressed", String(ativo));
      });
      filtrarLocais();
    });
  });
}

inicializarMapa();
configurarEventos();
filtrarLocais();
carregarLocaisGeoJson();
