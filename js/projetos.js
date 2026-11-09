(() => {
    const grid = document.querySelector("[data-projects-grid]");
    const projetos = window.INCLUIMAIS_PROJETOS;
    if (!grid || !Array.isArray(projetos)) return;

    const criarTexto = (tag, texto, classe) => {
        const elemento = document.createElement(tag);
        if (classe) elemento.className = classe;
        elemento.textContent = texto;
        return elemento;
    };

    const criarDetalhe = (rotulo, texto) => {
        const linha = document.createElement("div");
        linha.append(criarTexto("dt", rotulo), criarTexto("dd", texto));
        return linha;
    };

    const criarCard = (projeto) => {
        const card = document.createElement("article");
        card.className = "project-card";

        const figura = document.createElement("figure");
        figura.className = "project-card-figure";
        if (projeto.imagem === "TODO") {
            const placeholder = criarTexto("div", projeto.imagem, "project-card-image-placeholder");
            placeholder.setAttribute("aria-hidden", "true");
            figura.append(placeholder);
        } else {
            const imagem = document.createElement("img");
            imagem.className = "project-card-image";
            imagem.src = projeto.imagem;
            imagem.alt = projeto.textoAlternativo;
            figura.append(imagem);
        }
        figura.append(criarTexto("figcaption", projeto.creditoImagem, "project-card-credit"));

        const conteudo = document.createElement("div");
        conteudo.className = "project-card-content";
        conteudo.append(
            criarTexto("p", projeto.eixo, "project-axis"),
            criarTexto("h3", projeto.titulo, "project-card-title"),
            criarTexto("p", projeto.descricao, "project-card-description")
        );

        const detalhes = document.createElement("dl");
        detalhes.className = "project-card-details";
        detalhes.append(criarDetalhe("Objetivo", projeto.objetivo), criarDetalhe("Público", projeto.publico));
        conteudo.append(detalhes);
        card.append(figura, conteudo);
        return card;
    };

    const fragmento = document.createDocumentFragment();
    projetos.forEach((projeto) => fragmento.append(criarCard(projeto)));
    grid.replaceChildren(fragmento);
})();
