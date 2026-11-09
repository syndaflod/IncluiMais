// Regras compartilhadas pelo mapa e pela contagem de locais da página Sobre.

export function categoriaDoLocal(tags) {
  if (tags.railway === "subway_entrance" || tags.station === "subway" || tags.amenity === "subway" ||
      /metr[oô]/i.test(tags.name || "") && (tags.railway === "station" || tags.amenity === "bus_station" || tags.public_transport === "station")) return "Metrô";
  if (/terminal urbano carr[aã]o/i.test(tags.name || "")) return "Ônibus";
  if (tags.amenity === "bus_station" || tags.highway === "bus_stop" || (tags.public_transport === "platform" && tags.bus === "yes")) return "Ônibus";
  if (tags.amenity === "kindergarten" || tags.amenity === "childcare" || tags.amenity === "nursery") return "Creche";
  if (tags.amenity === "fuel") return "Posto de gasolina";
  if (tags.amenity === "bicycle_parking") return "Bicicletário";
  if (tags.amenity === "fire_station") return "Corpo de Bombeiros";
  if (tags.amenity === "place_of_worship") return "Igreja";
  if (tags.amenity === "police") return "Polícia";
  if (tags.amenity === "car_wash") return "Lava-jato";
  if (tags.amenity === "dentist" || tags.healthcare === "dentist") return "Dentista";
  if (tags.shop === "tattoo") return "Tatuagem";
  if (tags.amenity === "bank") return "Banco";
  if (tags.amenity === "taxi") return "Táxi";
  if (tags.amenity === "hospital" || tags.healthcare === "hospital") return "Hospital";
  if (tags.amenity === "fitness_centre" || tags.leisure === "fitness_centre" || tags.leisure === "sports_centre") return "Academia";
  if (tags.amenity === "university" || tags.amenity === "college" || tags.amenity === "school") return "Instituição de ensino";
  if (tags.amenity === "restaurant" || tags.amenity === "cafe" || tags.amenity === "fast_food") return "Restaurante";
  if (tags.amenity === "pharmacy") return "Farmácia";
  if (tags.amenity === "parking") return "Estacionamento";
  if (tags.amenity === "toilets") return "Banheiro";
  if (tags.shop) return "Loja";
  return tags.leisure ? "Espaço de lazer" : "Estabelecimento";
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

// Campos que decidem se a feature vira um local e se ela duplica outra.
export function localBaseDoGeoJson(feature) {
  const tags = feature.properties || {};
  if (!tags.name?.trim()) return null;
  if (!["amenity", "shop", "leisure", "healthcare", "tourism", "railway", "station", "public_transport", "highway"].some((tag) => tags[tag])) return null;
  const ponto = pontoDaFeature(feature);
  if (!ponto) return null;
  return {
    id: `geojson-${tags.osm_id}`,
    nome: tags.name.trim(),
    categoria: categoriaDoLocal(tags),
    numero: tags.addr_housenumber ? String(tags.addr_housenumber).trim() : "",
    latitude: ponto[0],
    longitude: ponto[1]
  };
}

// O GeoJSON mistura pontos, áreas e relações OSM do mesmo local.
// Mantém uma única entrada quando nome, categoria e posição são praticamente iguais.
export function deduplicarLocais(itens) {
  const resultado = [];
  const ids = new Set();
  for (const local of itens) {
    const nome = local.nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, " ").trim();
    const duplicado = resultado.some((existente) => {
      if (existente.categoria !== local.categoria) return false;
      const outroNome = existente.nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, " ").trim();
      if (outroNome !== nome) return false;
      // Mesmo nome em números diferentes da rua são prédios distintos (ex.: UNICID 448 e 475).
      if (local.numero && existente.numero && local.numero !== existente.numero) return false;
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

export function contarLocaisDoMapa(features) {
  return deduplicarLocais(features.map(localBaseDoGeoJson).filter(Boolean)).length;
}
