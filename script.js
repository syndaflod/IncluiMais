const CENTRO_INICIAL = [-23.53598, -46.55948];
const RAIO_DESLOCAMENTO_METROS = 100;
const RAIO_TERRA_METROS = 6371000;
let locais = [];
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

let mapa;
let camadaBase;
let camadaMarcadores;
let categoriaAtual = "Todos";
const marcadores = {};

function escaparHtml(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caractere) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[caractere]);
}

const nomesRecursos = {
  entradaAcessivel: "Entrada acessível",
  banheiroAcessivel: "Banheiro acessível",
  estacionamentoAcessivel: "Estacionamento acessível",
  libras: "Atendimento em Libras",
  pisoTatil: "Piso tátil",
  braille: "Material em braille"
};

function estadoAcessibilidade(valor) {
  if (valor === "yes" || valor === "designated") return "available";
  if (valor === "no") return "unavailable";
  return "unknown";
}

function categoriaDoLocal(tags) {
  if (tags.amenity === "university" || tags.amenity === "college" || tags.amenity === "school") return "Instituição de ensino";
  if (tags.amenity === "restaurant" || tags.amenity === "cafe" || tags.amenity === "fast_food") return "Restaurante";
  if (tags.amenity === "pharmacy") return "Farmácia";
  if (tags.amenity === "parking") return "Estacionamento";
  if (tags.amenity === "toilets") return "Banheiro";
  if (tags.shop) return "Loja";
  return tags.leisure ? "Espaço de lazer" : "Estabelecimento";
}

function iconeDoLocal(local) {
  const icones = {
    "Restaurante": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3v18M14 8h6M17 3c3 1 3 5 3 8"/></svg>',
    "Farmácia": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    "Instituição de ensino": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 9 9-5 9 5-9 5-9-5ZM6 11v5c3 3 9 3 12 0v-5M21 9v7"/></svg>',
    "Espaço de lazer": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21V10M7 21h10M5 10h14M7 10c0-3 2-5 5-5s5 2 5 5M9 10c-1-2-1-4 1-6M15 10c1-2 1-4-1-6"/></svg>',
    "Estacionamento": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 20V4h5a4 4 0 0 1 0 8H8M8 12h5"/></svg>',
    "Loja": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16l-1 10H5L4 10ZM6 10l2-5h8l2 5M9 20v-6h6v6"/></svg>'
  };
  return icones[local.categoria] || '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V8l8-4 8 4v12M8 20v-6h8v6M9 9h.01M15 9h.01"/></svg>';
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
    acessibilidade: {
      cadeira: estadoAcessibilidade(tags.wheelchair),
      visual: "unknown",
      auditiva: "unknown",
      banheiro: estadoAcessibilidade(tags["toilets:wheelchair"]),
      entrada: estadoAcessibilidade(tags.wheelchair),
      elevador: estadoAcessibilidade(tags.elevator),
      tatil: estadoAcessibilidade(tags.tactile_paving),
      estacionamento: estadoAcessibilidade(tags.amenity === "parking" ? tags.wheelchair : tags["parking:wheelchair"])
    }
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
  const ponto = pontoDaFeature(feature);
  if (!tags.name?.trim() || !ponto) return null;
  if (!["amenity", "shop", "leisure", "healthcare", "tourism"].some((tag) => tags[tag])) return null;
  return {
    id: `geojson-${tags.osm_id}`,
    nome: tags.name.trim(),
    categoria: categoriaDoLocal(tags),
    endereco: [tags.addr_street, tags.addr_housenumber].filter(Boolean).join(", ") || "Endereço não informado",
    latitude: ponto[0],
    longitude: ponto[1],
    acessibilidade: null
  };
}

async function carregarLocaisGeoJson() {
  const resposta = await fetch("UNICID_2.geojson");
  const dados = await resposta.json();
  let cadastrados = [];
  try { cadastrados = JSON.parse(localStorage.getItem("incluimais-estabelecimentos") || "[]"); } catch (erro) { console.warn("Não foi possível ler os locais cadastrados neste navegador.", erro); }
  locais = [...dados.features.map(localDoGeoJson).filter(Boolean), ...cadastrados];
  filtrarLocais();
}

async function carregarLocaisOverpass() {
  const [latitude, longitude] = CENTRO_INICIAL;
  const consulta = `[out:json][timeout:20];(nwr(around:${RAIO_DESLOCAMENTO_METROS},${latitude},${longitude})[name][amenity~"university|college|school|restaurant|cafe|fast_food|pharmacy|parking|toilets"];nwr(around:${RAIO_DESLOCAMENTO_METROS},${latitude},${longitude})[name][shop];nwr(around:${RAIO_DESLOCAMENTO_METROS},${latitude},${longitude})[name][leisure];);out center tags;`;
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

// Projeta qualquer centro fora do raio sobre a borda do círculo geográfico.
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

function configurarLimiteCircular() {
  const arraste = mapa.dragging._draggable;
  let posicaoBrutaAnterior;
  arraste.on("dragstart", () => {
    posicaoBrutaAnterior = arraste._startPos.clone();
  });
  // Intercepta mouse e touch antes de o Leaflet mover o painel do mapa.
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
  const corrigirOutrosMovimentos = () => {
    if (corrigindo) return;
    const centroAtual = mapa.getCenter();
    const centroLimitado = limitarCentro(centroAtual);
    if (centroLimitado === centroAtual) return;
    corrigindo = true;
    mapa.setView(centroLimitado, mapa.getZoom(), { animate: false });
    corrigindo = false;
  };
  mapa.on("moveend zoomend", corrigirOutrosMovimentos);
}

function inicializarMapa() {
  let centroInicial = CENTRO_INICIAL;
  if (new URLSearchParams(window.location.search).has("cadastro")) {
    try {
      const cadastrados = JSON.parse(localStorage.getItem("incluimais-estabelecimentos") || "[]");
      const ultimoLocal = cadastrados[cadastrados.length - 1];
      if (ultimoLocal) centroInicial = [ultimoLocal.latitude, ultimoLocal.longitude];
    } catch { /* O mapa continua no centro padrão se o armazenamento local estiver inválido. */ }
  }
  mapa = L.map("mapa", {
    minZoom: 17,
    maxZoom: 19,
    inertia: false,
    zoomControl: false,
    attributionControl: false
  }).setView(centroInicial, 17);
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
  if (!new URLSearchParams(window.location.search).has("cadastro")) {
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
  window.addEventListener("load", atualizarLayoutMapa, { once: true });
}

function recursosDoLocal(local) {
  return [...Object.keys(nomesRecursos), "cardapioAcessivel", "caoGuia"].filter((recurso) => local[recurso]);
}

function conteudoPopup(local) {
  const acessibilidade = local.acessibilidade || {};
  const svg = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M8 12h8M12 8v8"/></svg>';
  const categorias = [
    ["cadeira", "Cadeira de rodas"], ["visual", "Acessibilidade visual"],
    ["auditiva", "Acessibilidade auditiva"], ["banheiro", "Banheiro acessível"],
    ["entrada", "Entrada acessível"], ["elevador", "Elevador acessível"],
    ["tatil", "Piso tátil"], ["estacionamento", "Estacionamento acessível"]
  ];
  const status = { available: ["Disponível", "✓"], unavailable: ["Não disponível", "×"], unknown: ["Não informado", "?"] };
  return `<article class="popup-estabelecimento"><div class="cabecalho-estabelecimento"><span class="logo-estabelecimento" aria-hidden="true">${iconeDoLocal(local)}</span><div class="identidade-estabelecimento"><h2 class="popup-titulo">${escaparHtml(local.nome)}</h2><span class="endereco-estabelecimento">${escaparHtml(local.endereco)}</span><span class="distancia-estabelecimento">${escaparHtml(local.telefone || "IncluiMais")}</span></div><button class="fechar-estabelecimento" type="button" aria-label="Fechar informações">×</button></div><div class="indicadores-resumo" role="group" aria-label="Indicadores de acessibilidade">${categorias.map(([chave, nome]) => `<span class="indicador estado-${acessibilidade[chave] || "unknown"}" title="${nome}: ${status[acessibilidade[chave]]?.[0] || status.unknown[0]}">${svg}</span>`).join("")}</div></article>`;
}

// Remove os marcadores anteriores e cria apenas os que correspondem à busca atual.
function criarMarcadores(locaisFiltrados) {
  camadaMarcadores.clearLayers();
  Object.keys(marcadores).forEach((id) => delete marcadores[id]);

  locaisFiltrados.forEach((local) => {
    const marcador = L.marker([local.latitude, local.longitude], {
      icon: L.divIcon({ className: "pin-estabelecimento", html: `<span class="pin-estabelecimento-forma"><span class="pin-estabelecimento-icone">${iconeDoLocal(local)}</span></span>`, iconSize: [44, 54], iconAnchor: [22, 52], popupAnchor: [0, -48] })
    }).bindPopup(conteudoPopup(local), { maxWidth: 320, minWidth: 280, closeButton: false, className: "popup-acessibilidade" });
    marcador.on("popupopen", (evento) => {
      const popup = evento.popup.getElement();
      popup.querySelector(".fechar-estabelecimento").addEventListener("click", () => marcador.closePopup());
    });
    marcador.addTo(camadaMarcadores);
    marcadores[local.id] = marcador;
  });
}

function resumoRecursos(local) {
  const rotulos = { entradaAcessivel: "Entrada", banheiroAcessivel: "Banheiro", estacionamentoAcessivel: "Estacionamento", libras: "Libras", pisoTatil: "Piso tátil", braille: "Braille", cardapioAcessivel: "Cardápio", caoGuia: "Cão-guia" };
  return recursosDoLocal(local).slice(0, 3).map((recurso) => `<span class="recurso-tag">${rotulos[recurso]}</span>`).join("");
}

// Atualiza a lista lateral com os mesmos locais exibidos no mapa.
function mostrarLocais(locaisFiltrados) {
  const lista = document.querySelector("#lista-locais");
  const contador = document.querySelector("#contador-resultados");
  contador.textContent = `${locaisFiltrados.length} ${locaisFiltrados.length === 1 ? "local" : "locais"}`;

  if (!locaisFiltrados.length) {
    lista.innerHTML = `<p class="estado-vazio">${locais.length ? "Nenhum local corresponde aos filtros escolhidos." : "Nenhum estabelecimento cadastrado ainda."}</p>`;
    return;
  }

  lista.innerHTML = locaisFiltrados.map((local) => `
    <button class="local-item" type="button" data-id="${local.id}">
      <span class="local-nome">${escaparHtml(local.nome)}</span>
      <span class="local-meta">${escaparHtml(local.categoria)}</span>
      <span class="local-meta">${escaparHtml(local.endereco)}</span>
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
    const acessibilidade = local.acessibilidade || {};
    const mapeamento = { entradaAcessivel: "entrada", banheiroAcessivel: "banheiro", estacionamentoAcessivel: "estacionamento", libras: "libras", pisoTatil: "tatil", braille: "braille" };
    const possuiRecursos = recursosSelecionados.every((recurso) => local[recurso] || acessibilidade[mapeamento[recurso]] === "available");
    return correspondeBusca && correspondeCategoria && possuiRecursos;
  });

  criarMarcadores(locaisFiltrados);
  mostrarLocais(locaisFiltrados);
}

function abrirLocal(id) {
  const local = locais.find((item) => item.id === id);
  const marcador = marcadores[id];
  if (!local || !marcador) return;
  mapa.setView([local.latitude, local.longitude], 19, { animate: true });
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
      document.querySelectorAll(".botao-categoria").forEach((item) => item.classList.toggle("ativo", item === botao));
      filtrarLocais();
    });
  });
}

inicializarMapa();
configurarEventos();
filtrarLocais();
carregarLocaisGeoJson().catch((erro) => console.error("Não foi possível carregar o GeoJSON:", erro));
