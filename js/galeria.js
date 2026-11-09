(() => {
    const grid = document.querySelector("[data-gallery-grid]");
    const projetos = window.INCLUIMAIS_PROJETOS;
    if (!grid || !Array.isArray(projetos)) return;

    const criarTexto = (tag, texto, classe) => {
        const elemento = document.createElement(tag);
        if (classe) elemento.className = classe;
        elemento.textContent = texto;
        return elemento;
    };

    const criarItem = (projeto) => {
        const figura = document.createElement("figure");
        figura.className = "gallery-item";

        if (projeto.imagem === "TODO") {
            const pendente = criarTexto("div", "Imagem pendente", "gallery-image-placeholder");
            pendente.setAttribute("role", "img");
            pendente.setAttribute("aria-label", "Imagem pendente");
            figura.append(pendente);
        } else {
            const imagem = document.createElement("img");
            imagem.className = "gallery-image";
            imagem.src = projeto.imagem;
            imagem.alt = projeto.textoAlternativo;
            figura.append(imagem);
        }

        const legenda = document.createElement("figcaption");
        legenda.append(
            criarTexto("p", projeto.eixo, "project-axis"),
            criarTexto("h2", projeto.titulo, "gallery-title")
        );
        figura.append(legenda);
        return figura;
    };

    const fragmento = document.createDocumentFragment();
    projetos.forEach((projeto) => fragmento.append(criarItem(projeto)));
    grid.replaceChildren(fragmento);
})();
