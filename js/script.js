const CENTRO_INICIAL = [-23.53598, -46.55948];
const RAIO_DESLOCAMENTO_METROS = 100;
const RAIO_TERRA_METROS = 6371000;
// Novos estabelecimentos podem ser adicionados aqui futuramente.
const locais = [];

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
  // Indicador visual fixo no ponto inicial; não pertence à lista de estabelecimentos.
  L.marker(CENTRO_INICIAL, {
    icon: L.divIcon({ className: "icone-localizacao", html: '<span class="ponto-localizacao" aria-hidden="true"></span>', iconSize: [22, 22], iconAnchor: [11, 11] }),
    interactive: false, keyboard: false
  }).addTo(mapa);
  camadaMarcadores = L.layerGroup().addTo(mapa);
}

function recursosDoLocal(local) {
  return Object.keys(nomesRecursos).filter((recurso) => local[recurso]);
}

function conteudoPopup(local) {
  const recursos = recursosDoLocal(local).map((recurso) => `<li>${nomesRecursos[recurso]}</li>`).join("");
  return `<article><h2 class="popup-titulo">${local.nome}</h2><p class="popup-texto">${local.categoria}</p><p class="popup-texto">${local.endereco}</p><ul class="popup-recursos">${recursos}</ul></article>`;
}

// Remove os marcadores anteriores e cria apenas os que correspondem à busca atual.
function criarMarcadores(locaisFiltrados) {
  camadaMarcadores.clearLayers();
  Object.keys(marcadores).forEach((id) => delete marcadores[id]);

  locaisFiltrados.forEach((local) => {
    const marcador = L.marker([local.latitude, local.longitude]).bindPopup(conteudoPopup(local), { maxWidth: 260 });
    marcador.addTo(camadaMarcadores);
    marcadores[local.id] = marcador;
  });
}

function resumoRecursos(local) {
  const rotulos = { entradaAcessivel: "Entrada", banheiroAcessivel: "Banheiro", estacionamentoAcessivel: "Estacionamento", libras: "Libras", pisoTatil: "Piso tátil", braille: "Braille" };
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
      <span class="local-nome">${local.nome}</span>
      <span class="local-meta">${local.categoria}</span>
      <span class="local-meta">${local.endereco}</span>
      <span class="recursos-resumo">${resumoRecursos(local)}</span>
    </button>
  `).join("");

  document.querySelectorAll(".local-item").forEach((item) => {
    item.addEventListener("click", () => abrirLocal(Number(item.dataset.id)));
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
    const possuiRecursos = recursosSelecionados.every((recurso) => local[recurso]);
    return correspondeBusca && correspondeCategoria && possuiRecursos;
  });

  criarMarcadores(locaisFiltrados);
  mostrarLocais(locaisFiltrados);
}

function abrirLocal(id) {
  const local = locais.find((item) => item.id === id);
  const marcador = marcadores[id];
  if (!local || !marcador) return;
  mapa.setView(limitarCentro(L.latLng(local.latitude, local.longitude)), 19, { animate: true });
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

