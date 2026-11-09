(() => {
  const FONT_SCALES = [100, 112, 125, 150];

  const configurarControlesAcessibilidade = () => {
    const root = document.documentElement;
    const currentScale = () => Number.parseInt(root.dataset.fontScale || "100", 10);
    const announce = (message) => {
      const live = document.querySelector("[data-accessibility-status]");
      if (live) live.textContent = message;
    };

    const bar = document.querySelector("[data-accessibility-controls]");
    if (!bar) return;
    document.querySelector("#conteudo")?.setAttribute("tabindex", "-1");
    document.querySelector("#menu-principal")?.setAttribute("tabindex", "-1");
    document.querySelector("[data-site-footer]")?.setAttribute("tabindex", "-1");
    if (!bar.querySelector("[role=group]")) bar.innerHTML = `
      <div class="accessibility-skip-links" role="group" aria-label="Atalhos de navegação">
        <a href="#conteudo">Ir para o conteúdo</a>
        <a href="#menu-principal">Ir para o menu</a>
        ${document.querySelector("[data-site-footer]") ? '<a href="#rodape-site">Ir para o rodapé</a>' : ""}
      </div>
      <span class="accessibility-bar-label">Ajustes de leitura</span>
      <span class="accessibility-controls-slot" data-controls-slot>
        <span class="accessibility-controls" role="group" aria-label="Ajustes de leitura">
          <button type="button" data-font-increase aria-label="Aumentar tamanho da fonte">A+</button>
          <button type="button" data-font-decrease aria-label="Diminuir tamanho da fonte">A-</button>
          <button type="button" class="contrast-button" data-contrast-toggle aria-label="Ativar alto contraste" aria-pressed="false">
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 2v14a7 7 0 0 1 0-14Z" fill="currentColor"/></svg>
            <span>Alto contraste</span>
          </button>
        </span>
      </span>
      <span class="visually-hidden" data-accessibility-status aria-live="polite"></span>`;

    const increase = document.querySelector("[data-font-increase]");
    const decrease = document.querySelector("[data-font-decrease]");
    const contrast = document.querySelector("[data-contrast-toggle]");
    const controls = document.querySelector(".accessibility-controls");
    const nav = document.querySelector(".site-nav");
    const mobileQuery = window.matchMedia("(max-width: 48rem)");
    let mobileButton = document.querySelector("[data-mobile-accessibility]");
    if (!mobileButton && nav) {
      mobileButton = document.createElement("button");
      mobileButton.type = "button";
      mobileButton.className = "mobile-accessibility-toggle";
      mobileButton.dataset.mobileAccessibility = "true";
      mobileButton.setAttribute("aria-expanded", "false");
      mobileButton.textContent = "Ajustes";
      nav.insertBefore(mobileButton, nav.firstChild);
      mobileButton.addEventListener("click", () => {
        const open = controls.classList.toggle("is-open");
        mobileButton.setAttribute("aria-expanded", String(open));
      });
    }
    const adaptControls = () => {
      const slot = document.querySelector("[data-controls-slot]");
      if (!controls || !slot || !nav) return;
      if (mobileQuery.matches) nav.append(controls);
      else slot.append(controls);
      if (!mobileQuery.matches) {
        controls.classList.remove("is-open");
        mobileButton?.setAttribute("aria-expanded", "false");
      }
    };
    adaptControls();
    mobileQuery.addEventListener("change", adaptControls);
    const update = () => {
      const scale = currentScale();
      increase.disabled = scale === FONT_SCALES.at(-1);
      decrease.disabled = scale === FONT_SCALES[0];
      const isContrast = root.classList.contains("alto-contraste");
      contrast.setAttribute("aria-pressed", String(isContrast));
      contrast.setAttribute("aria-label", isContrast ? "Desativar alto contraste" : "Ativar alto contraste");
    };

    increase.addEventListener("click", () => {
      const next = FONT_SCALES[Math.min(FONT_SCALES.indexOf(currentScale()) + 1, FONT_SCALES.length - 1)];
      root.dataset.fontScale = String(next);
      root.style.setProperty("--im-font-scale", String(next / 100));
      localStorage.setItem("incluimais-font-scale", String(next));
      announce(`Fonte ${next}%`);
      update();
    });
    decrease.addEventListener("click", () => {
      const next = FONT_SCALES[Math.max(FONT_SCALES.indexOf(currentScale()) - 1, 0)];
      root.dataset.fontScale = String(next);
      root.style.setProperty("--im-font-scale", String(next / 100));
      localStorage.setItem("incluimais-font-scale", String(next));
      announce(`Fonte ${next}%`);
      update();
    });
    contrast.addEventListener("click", () => {
      root.classList.add("theme-switching");
      const isContrast = root.classList.toggle("alto-contraste");
      localStorage.setItem("incluimais-high-contrast", String(isContrast));
      announce(isContrast ? "Alto contraste ativado" : "Alto contraste desativado");
      update();
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
    });
    update();
  };

  const focarAjustesLeitura = () => {
    const control = document.querySelector("[data-font-increase]");
    const mobileMenu = control?.closest(".site-nav");
    if (mobileMenu) {
      mobileMenu.classList.add("is-open");
      document.querySelector(".nav-toggle")?.setAttribute("aria-expanded", "true");
      mobileMenu.querySelector(".mobile-accessibility-toggle")?.setAttribute("aria-expanded", "true");
      control.closest(".accessibility-controls")?.classList.add("is-open");
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector("[data-accessibility-controls]")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    requestAnimationFrame(() => control?.focus({ preventScroll: true }));
  };

  const renderProjects = () => {
    const grid = document.querySelector("[data-projects-grid]");
    if (!grid) return;
    const projetos = window.INCLUIMAIS_PROJETOS;
    if (!Array.isArray(projetos)) return;

    const text = (tag, value, className) => {
      const element = document.createElement(tag);
      if (className) element.className = className;
      element.textContent = value || "";
      return element;
    };
    const detail = (label, value) => {
      const row = document.createElement("div");
      row.append(text("dt", label), text("dd", value));
      return row;
    };
    const cards = projetos.map((projeto) => {
      const card = document.createElement("article");
      card.className = "project-card";

      const content = document.createElement("div");
      content.className = "project-card-content";
      content.append(
        text("h3", projeto.titulo, "project-card-title"),
        text("p", projeto.descricao, "project-card-description")
      );
      const details = document.createElement("dl");
      details.className = "project-card-details";
      details.append(detail("Objetivo", projeto.objetivo), detail("Público", projeto.publico));
      content.append(details);

      const imageSource = typeof projeto.imagem === "string" ? projeto.imagem.trim() : "";
      if (imageSource && imageSource !== "TODO") {
        const figure = document.createElement("figure");
        figure.className = "project-card-figure";
        const image = document.createElement("img");
        image.className = "project-card-image";
        image.src = imageSource;
        image.alt = projeto.textoAlternativo || "";
        figure.append(image);
        if (projeto.creditoImagem && projeto.creditoImagem !== "TODO") {
          const caption = text("figcaption", projeto.creditoImagem, "project-card-credit");
          figure.append(caption);
        }
        card.append(figure);
      }
      card.append(content);
      return card;
    });
    grid.replaceChildren(...cards);
  };

  const renderGallery = async () => {
    const grid = document.querySelector("[data-gallery-grid]");
    const dialog = document.querySelector("[data-gallery-dialog]");
    const frame = document.querySelector("[data-lightbox-frame]");
    const caption = document.querySelector("[data-lightbox-caption]");
    const closeButton = document.querySelector("[data-gallery-close]");
    if (!grid || !dialog || !frame || !caption || !closeButton) return;

    const makeText = (tag, value, className) => {
      const element = document.createElement(tag);
      if (className) element.className = className;
      element.textContent = value || "";
      return element;
    };
    const renderSource = (item, target) => {
      const sourceLine = document.createElement("p");
      sourceLine.className = "gallery-source";
      sourceLine.append(document.createTextNode("Fonte: "));
      if (item.fonteUrl) {
        try {
          const url = new URL(item.fonteUrl, window.location.href);
          if (url.protocol === "https:" || url.protocol === "http:") {
            const sourceLink = makeText("a", item.fonte);
            sourceLink.href = url.href;
            sourceLink.target = "_blank";
            sourceLink.rel = "noopener noreferrer";
            sourceLine.append(sourceLink);
          } else {
            sourceLine.append(document.createTextNode(item.fonte || ""));
          }
        } catch {
          sourceLine.append(document.createTextNode(item.fonte || ""));
        }
      } else {
        sourceLine.append(document.createTextNode(item.fonte || ""));
      }
      sourceLine.append(document.createTextNode(` · ${item.licenca || ""}`));
      target.append(sourceLine);
    };
    const makePending = () => {
      const placeholder = makeText("div", "Imagem pendente", "gallery-image-placeholder");
      placeholder.setAttribute("role", "img");
      placeholder.setAttribute("aria-label", "Imagem pendente");
      return placeholder;
    };

    let imageItems = [];
    let returnFocusTo = null;
    let currentDialogIndex = -1;
    const showInDialog = (item) => {
      frame.replaceChildren();
      caption.replaceChildren();
      const image = document.createElement("img");
      image.src = item.src;
      image.alt = item.alt || "";
      frame.append(image);
      caption.append(makeText("p", item.legenda, "gallery-caption"));
      renderSource(item, caption);
    };
    const openImage = (item, trigger) => {
      if (!item || !trigger || !trigger.querySelector("img")?.naturalWidth) return;
      returnFocusTo = trigger;
      currentDialogIndex = imageItems.indexOf(item);
      showInDialog(item);
      dialog.showModal();
      closeButton.focus();
    };
    closeButton.addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => {
      if (returnFocusTo?.isConnected) returnFocusTo.focus();
      returnFocusTo = null;
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const direction = event.key === "ArrowRight" ? 1 : -1;
      if (!imageItems.length) return;
      event.preventDefault();
      currentDialogIndex = (currentDialogIndex + direction + imageItems.length) % imageItems.length;
      showInDialog(imageItems[currentDialogIndex]);
    });
    grid.addEventListener("click", (event) => {
      const trigger = event.target.closest(".gallery-open");
      if (!trigger || !grid.contains(trigger)) return;
      openImage(imageItems[Number.parseInt(trigger.dataset.galleryIndex, 10)], trigger);
    });

    try {
      const response = await fetch("data/galeria.json");
      if (!response.ok) throw new Error("Não foi possível carregar os dados da galeria.");
      const items = await response.json();
      if (!Array.isArray(items)) return;

      const figures = items.map((item, index) => {
        const figure = document.createElement("figure");
        figure.className = "gallery-item";
        const source = typeof item.src === "string" ? item.src.trim() : "";
        const isPending = !source || source === "TODO";

        if (isPending) {
          const imageFrame = document.createElement("div");
          imageFrame.className = "gallery-image-frame";
          imageFrame.append(makePending());
          figure.append(imageFrame);
        } else {
          const trigger = document.createElement("button");
          trigger.type = "button";
          trigger.className = "gallery-open";
          trigger.dataset.galleryIndex = String(imageItems.length);
          trigger.setAttribute("aria-label", `Abrir imagem: ${item.legenda || item.alt || "Imagem"}`);
          const imageFrame = document.createElement("span");
          imageFrame.className = "gallery-image-frame";
          const image = document.createElement("img");
          image.className = "gallery-image";
          image.src = source;
          image.alt = item.alt || "";
          image.onerror = () => {
            const pendingFrame = document.createElement("div");
            pendingFrame.className = "gallery-image-frame";
            pendingFrame.append(makePending());
            trigger.replaceWith(pendingFrame);
            imageItems = imageItems.filter((candidate) => candidate !== item);
            grid.querySelectorAll(".gallery-open").forEach((button, buttonIndex) => {
              button.dataset.galleryIndex = String(buttonIndex);
            });
          };
          imageFrame.append(image);
          trigger.append(imageFrame);
          imageItems.push(item);
          figure.append(trigger);
        }

        const figcaption = document.createElement("figcaption");
        figcaption.className = "gallery-caption-block";
        figcaption.append(makeText("p", item.legenda, "gallery-caption"));
        renderSource(item, figcaption);
        figure.append(figcaption);
        return figure;
      });
      grid.replaceChildren(...figures);
    } catch {
      grid.replaceChildren();
    }
  };

  const renderFooter = () => {
    const footer = document.querySelector("[data-site-footer]");
    const menu = document.querySelector(".site-nav");
    if (!footer || !menu) return;
    const contributionLink = menu.querySelector('a[href="cadastro_estabelecimento.html"]');
    if (contributionLink) contributionLink.textContent = "Indicar local";
    footer.id = "rodape-site";
    footer.tabIndex = -1;
    if (!document.body.id) document.body.id = "topo";

    const links = [...menu.querySelectorAll("a[href]")].map((link) => ({
      href: link.getAttribute("href"),
      label: link.textContent.trim()
    }));
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const grupos = [
      { titulo: "Explorar", destinos: ["index.html", "mapa.html", "cadastro_estabelecimento.html"] },
      { titulo: "O projeto", destinos: ["sobre.html", "projetos.html", "galeria.html", "impacto.html", "midia.html", "noticias.html", "orcamento_hospedagem.html"] },
      { titulo: "Ajuda", destinos: ["acessibilidade.html", "contato.html", "contato.html#apoie"] }
    ];
    const navigation = grupos.map(({ titulo, destinos }) => {
      const items = destinos.map((destino) => links.find((link) => link.href === destino)).filter(Boolean).map(({ href, label }) => {
        const current = href === currentPath || (currentPath === "index.html" && href === "./");
        return `<li><a href="${href}"${current ? ' aria-current="page"' : ""}>${label}</a></li>`;
      }).join("");
      const readingControl = titulo === "Ajuda"
        ? '<li><button class="footer-reading-button" type="button" data-reading-settings>Ajustar leitura e contraste</button></li>'
        : "";
      return `<div class="footer-nav-group"><h2>${titulo}</h2><ul>${items}${readingControl}</ul></div>`;
    }).join("");

    footer.innerHTML = `
      <div class="footer-shell">
        <div class="footer-column footer-about">
          <a class="footer-title" href="index.html"><img src="assets/logo-footer.svg" alt=""><span>IncluiMais</span></a>
          <p>O IncluiMais reúne informações sobre acessibilidade em locais e espaços próximos à UNICID.</p>
          <p>Você pode consultar o mapa, filtrar recursos, contribuir com indicações e enviar sugestões.</p>
        </div>
        <nav class="footer-navigation" aria-label="Navegação do rodapé">
          ${navigation}
        </nav>
      </div>
      <div class="footer-bottom"><div class="footer-bottom-shell">
        <span>© ${new Date().getFullYear()} IncluiMais</span>
        <button class="back-to-top" type="button">Voltar ao topo<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg></button>
      </div></div>`;

    document.querySelector(".back-to-top")?.addEventListener("click", (event) => {
      event.preventDefault();
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
      requestAnimationFrame(() => document.querySelector(".accessibility-skip-links a")?.focus({ preventScroll: true }));
    });
  };

  const carregarContagemDeLocais = async () => {
    const alvo = document.querySelector("[data-locais-count]");
    if (!alvo) return;
    try {
      const resposta = await fetch("data/locais.json");
      if (!resposta.ok) throw new Error("Falha ao carregar os dados");
      const dados = await resposta.json();
      const locais = Array.isArray(dados?.features) ? dados.features : [];
      alvo.textContent = locais.length
        ? `${locais.length} locais registrados no mapa`
        : "";
      alvo.hidden = !locais.length;
    } catch {
      alvo.hidden = true;
    }
  };

  const configurarIdentidade = () => {
    if (!document.body.classList.contains("map-page")) {
      const favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) {
        const novoFavicon = document.createElement("link");
        novoFavicon.rel = "icon";
        novoFavicon.type = "image/svg+xml";
        novoFavicon.href = "assets/icon.svg";
        document.head.appendChild(novoFavicon);
      }
    }

    document.querySelectorAll(".brand, .site-logo").forEach((brand) => {
      brand.className = "site-logo";
      brand.setAttribute("aria-label", "IncluiMais, página inicial");
      brand.innerHTML = '<img src="assets/icon.svg" alt=""><span>IncluiMais</span>';
    });

  };

  configurarIdentidade();
  configurarControlesAcessibilidade();
  renderProjects();
  renderGallery();

  const configurarMovimento = () => {
    const hero = document.querySelector(".hero");
    const heroHeading = hero?.querySelector("h1");
    const heroParagraph = hero?.querySelector("p");
    const heroActions = hero?.querySelector(".hero-actions");
    const heroArt = hero?.querySelector(".hero-art");

    [heroHeading, heroParagraph, heroActions, heroArt].filter(Boolean).forEach((elemento) => {
      elemento.classList.add("motion-reveal");
    });
    if (heroHeading) heroHeading.style.setProperty("--motion-delay", "60ms");
    if (heroParagraph) heroParagraph.style.setProperty("--motion-delay", "130ms");
    if (heroActions) heroActions.style.setProperty("--motion-delay", "200ms");

    document.querySelectorAll(".section-heading, .page-heading, .content > h2, .content > h3, .content > p, .content > ul, .content > table, .surface, .form > .field, .form > .button").forEach((elemento, indice) => {
      elemento.classList.add("motion-reveal");
      elemento.style.setProperty("--motion-delay", `${Math.min(indice * 35, 175)}ms`);
    });

    document.body.classList.add("motion-ready");
    const elementos = document.querySelectorAll(".motion-reveal");
    if (!("IntersectionObserver" in window)) {
      elementos.forEach((elemento) => elemento.classList.add("is-visible"));
      return;
    }
    const observador = new IntersectionObserver((entradas, observer) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("is-visible");
        observer.unobserve(entrada.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    elementos.forEach((elemento) => observador.observe(elemento));
  };

  configurarMovimento();

  if (!document.documentElement.classList.contains("map-embed") && !document.querySelector("[vw]")) {
    document.body.insertAdjacentHTML("beforeend", '<div vw class="enabled"><div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div></div>');
    const vlibrasScript = document.createElement("script");
    vlibrasScript.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    vlibrasScript.onload = () => {
      if (window.VLibras) new window.VLibras.Widget("https://vlibras.gov.br/app");
    };
    document.body.appendChild(vlibrasScript);
  }

  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  document.querySelectorAll("nav.site-nav, .map-header nav").forEach((menu) => {
    const oldMore = menu.querySelector("details.nav-more");
    if (oldMore) {
      oldMore.outerHTML = '<div class="nav-more"><button type="button" aria-haspopup="menu" aria-expanded="false">Mais<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button><div class="nav-more-menu" role="menu" hidden><a role="menuitem" href="sobre.html">Sobre</a><a role="menuitem" href="projetos.html">Projetos</a><a role="menuitem" href="galeria.html">Galeria</a><a role="menuitem" href="impacto.html">Impacto</a><a role="menuitem" href="midia.html">Mídia</a><a role="menuitem" href="noticias.html">Notícias</a><a role="menuitem" href="orcamento_hospedagem.html">Orçamento</a><a role="menuitem" href="contato.html#apoie">Apoie</a></div></div>';
    } else if (!menu.querySelector(".nav-more")) {
      menu.insertAdjacentHTML("beforeend", '<div class="nav-more"><button type="button" aria-haspopup="menu" aria-expanded="false">Mais<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button><div class="nav-more-menu" role="menu" hidden><a role="menuitem" href="sobre.html">Sobre</a><a role="menuitem" href="projetos.html">Projetos</a><a role="menuitem" href="galeria.html">Galeria</a><a role="menuitem" href="impacto.html">Impacto</a><a role="menuitem" href="midia.html">Mídia</a><a role="menuitem" href="noticias.html">Notícias</a><a role="menuitem" href="orcamento_hospedagem.html">Orçamento</a><a role="menuitem" href="contato.html#apoie">Apoie</a></div></div>');
    }
    menu.querySelector('a[href="cadastro_estabelecimento.html"]')?.classList.add("nav-cta");
  });
  document.querySelectorAll(".nav-more").forEach((more) => {
    const button = more.querySelector("button");
    const menu = more.querySelector(".nav-more-menu");
    const items = [...menu.querySelectorAll("a")];
    const close = (restore = false) => {
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
      if (restore) button.focus();
    };
    button.addEventListener("click", () => {
      const open = menu.hidden;
      menu.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      if (open) items[0]?.focus();
    });
    more.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { event.preventDefault(); close(true); }
      if ((event.key === "ArrowDown" || event.key === "ArrowRight") && event.target === button) {
        event.preventDefault();
        menu.hidden = false;
        button.setAttribute("aria-expanded", "true");
        items[0]?.focus();
        return;
      }
      if ((event.key === "ArrowUp" || event.key === "ArrowLeft") && event.target === button) {
        event.preventDefault();
        menu.hidden = false;
        button.setAttribute("aria-expanded", "true");
        items.at(-1)?.focus();
        return;
      }
      if (!items.length || menu.hidden) return;
      const index = items.indexOf(document.activeElement);
      if (event.key === "ArrowDown" || event.key === "ArrowRight") { event.preventDefault(); items[(index + 1) % items.length].focus(); }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") { event.preventDefault(); items[(index - 1 + items.length) % items.length].focus(); }
      if (event.key === "Home") { event.preventDefault(); items[0].focus(); }
      if (event.key === "End") { event.preventDefault(); items.at(-1).focus(); }
    });
    more.addEventListener("focusout", (event) => { if (!more.contains(event.relatedTarget)) close(); });
  });
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav a[href]").forEach((link) => {
    if (link.getAttribute("href") === currentPath) link.setAttribute("aria-current", "page");
  });
  renderFooter();
  carregarContagemDeLocais();
  document.querySelectorAll("[data-reading-settings]").forEach((button) => button.addEventListener("click", focarAjustesLeitura));
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    document.querySelector('.accessibility-skip-links a[href="#menu-principal"]')?.addEventListener("click", () => {
      if (getComputedStyle(navToggle).display === "none") return;
      nav.classList.add("is-open");
      navToggle.setAttribute("aria-expanded", "true");
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || event.defaultPrevented || !nav.classList.contains("is-open")) return;
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.focus();
    });
  }

  const form = document.querySelector("[data-demo-form]");
  const status = document.querySelector("[data-form-status]");
  if (form && status) {
    const mensagensDeErro = new Map([
      ["valueMissing", "Preencha este campo."],
      ["patternMismatch", "Confira o formato deste campo."],
      ["typeMismatch", "Informe um valor válido."],
      ["badInput", "Informe um valor válido."],
      ["rangeUnderflow", "Informe um valor dentro do limite."],
      ["rangeOverflow", "Informe um valor dentro do limite."],
      ["stepMismatch", "Informe um valor dentro do limite."]
    ]);
    const limparErro = (controle) => {
      controle.removeAttribute("aria-invalid");
      const erro = document.querySelector(`[data-error-for="${controle.name || controle.id}"]`);
      if (erro) erro.textContent = "";
    };
    const mostrarErro = (controle) => {
      const erro = document.querySelector(`[data-error-for="${controle.name || controle.id}"]`);
      if (!erro) return;
      controle.setAttribute("aria-invalid", "true");
      const estado = controle.validity;
      const chaveDoErro = [...mensagensDeErro.keys()].find((chave) => estado[chave]);
      const mensagemDoCampo = {
        patternMismatch: controle.dataset.errorPattern,
        typeMismatch: controle.dataset.errorType,
        badInput: controle.dataset.errorType || controle.dataset.errorRange,
        rangeUnderflow: controle.dataset.errorRange,
        rangeOverflow: controle.dataset.errorRange,
        stepMismatch: controle.dataset.errorRange
      }[chaveDoErro];
      erro.textContent = mensagemDoCampo || mensagensDeErro.get(chaveDoErro) || "Revise esta informação.";
    };
    form.querySelectorAll("input, select, textarea").forEach((controle) => {
      controle.addEventListener("input", () => limparErro(controle));
      controle.addEventListener("change", () => limparErro(controle));
    });
    document.querySelectorAll("[data-assunto]").forEach((link) => {
      link.addEventListener("click", () => {
        const assunto = form.querySelector("#assunto");
        if (!assunto) return;
        assunto.value = link.dataset.assunto;
        limparErro(assunto);
      });
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.querySelectorAll("input, select, textarea").forEach(limparErro);
      const invalidos = [...form.querySelectorAll("input, select, textarea")].filter((controle) => !controle.checkValidity());
      if (invalidos.length) {
        invalidos.forEach(mostrarErro);
        invalidos[0].focus();
        status.textContent = "Revise os campos destacados antes de enviar.";
        return;
      }
      status.textContent = form.dataset.success || "Formulário validado no navegador.";
      form.reset();
    });
  }

  const filtrosNoticias = [...document.querySelectorAll("[data-news-filter]")];
  const noticias = [...document.querySelectorAll("[data-news-category]")];
  const statusNoticias = document.querySelector("[data-news-status]");
  filtrosNoticias.forEach((botao) => {
    botao.addEventListener("click", () => {
      const categoria = botao.dataset.newsFilter;
      filtrosNoticias.forEach((item) => item.setAttribute("aria-pressed", String(item === botao)));
      let visiveis = 0;
      noticias.forEach((noticia) => {
        const mostrar = categoria === "todas" || noticia.dataset.newsCategory === categoria;
        noticia.hidden = !mostrar;
        if (mostrar) visiveis += 1;
      });
      if (statusNoticias) statusNoticias.textContent = `${visiveis} ${visiveis === 1 ? "conteúdo" : "conteúdos"} em exibição.`;
    });
  });

  const chatbot = document.querySelector(".chatbot");
  const toggle = document.querySelector(".chatbot-toggle");
  const panel = document.querySelector(".chatbot-panel");
  const chatForm = document.querySelector(".chatbot-form");
  const input = document.querySelector("#chatbot-pergunta");
  const messages = document.querySelector(".chatbot-messages");
  const sendButton = chatForm?.querySelector("button[type=submit]");
  if (!chatbot || !toggle || !panel || !chatForm || !input || !messages || !sendButton) return;

  const CHAT_TIMEOUT_MS = 45000;
  const CHAT_HISTORY_LIMIT = 6;
  const chatHistory = [];

  // Usado quando o assistente não está configurado ou não responde.
  const faq = [
    { terms: ["mapa", "local", "encontrar"], answer: "Abra o mapa para buscar locais por nome, categoria e recursos como entrada, banheiro ou estacionamento acessível." },
    { terms: ["indicar", "indicação", "sugerir"], answer: "Use a página Indicar um local para sugerir um local e informar os recursos de acessibilidade disponíveis." },
    { terms: ["filtro", "categoria"], answer: "No mapa, escolha uma categoria e marque os recursos desejados. Os resultados são atualizados na mesma tela." },
    { terms: ["dados", "privacidade", "lgpd"], answer: "Com o assistente de IA ativo, as perguntas deste chat são enviadas ao Make e ao serviço de IA para gerar a resposta, então não informe dados pessoais. Os formulários do site são demonstrativos e não enviam dados." },
    { terms: ["contato", "sugestão", "erro"], answer: "Envie uma sugestão ou corrija uma informação pela página Contato. O retorno aparece no próprio formulário." }
  ];

  toggle.addEventListener("click", () => {
    const open = panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) input.focus();
  });

  // Texto vindo da IA nunca passa por innerHTML: textContent impede a injeção de HTML.
  const addChatMessage = (author, text) => {
    const message = document.createElement("p");
    message.className = "chatbot-message";
    const label = document.createElement("strong");
    label.textContent = `${author}:`;
    const body = document.createElement("span");
    body.textContent = ` ${text}`;
    message.append(label, body);
    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
    return body;
  };

  const askAssistant = async (endpoint, question) => {
    const response = await fetch(endpoint, {
      method: "POST",
      body: new URLSearchParams({
        pergunta: question,
        historico: chatHistory.map(({ author, text }) => `${author}: ${text}`).join("\n")
      }),
      signal: AbortSignal.timeout(CHAT_TIMEOUT_MS)
    });
    if (!response.ok) throw new Error(`Assistente respondeu ${response.status}`);
    const answer = (await response.text()).trim();
    if (!answer) throw new Error("Assistente não devolveu uma resposta");
    return answer;
  };

  const answerFromFaq = (question, assistantFailed) => {
    const normalized = question.toLocaleLowerCase("pt-BR");
    const match = faq.find((item) => item.terms.some((term) => normalized.includes(term)));
    if (match) return match.answer;
    return assistantFailed
      ? "O assistente está indisponível no momento. Enquanto isso, posso ajudar com mapa, indicação, filtros, contato ou privacidade."
      : "Ainda não tenho essa resposta. Tente perguntar sobre mapa, indicação, filtros, contato ou privacidade.";
  };

  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || sendButton.disabled) return;
    const endpoint = chatbot.dataset.chatEndpoint?.trim();

    addChatMessage("Você", question);
    input.value = "";

    if (!endpoint) {
      addChatMessage("IncluiMais", answerFromFaq(question, false));
      return;
    }

    sendButton.disabled = true;
    const reply = addChatMessage("IncluiMais", "Pensando…");
    try {
      const answer = await askAssistant(endpoint, question);
      reply.textContent = ` ${answer}`;
      chatHistory.push({ author: "Usuário", text: question }, { author: "IncluiMais", text: answer });
      chatHistory.splice(0, Math.max(chatHistory.length - CHAT_HISTORY_LIMIT, 0));
    } catch (error) {
      console.warn("Chatbot: usando FAQ local.", error);
      reply.textContent = ` ${answerFromFaq(question, true)}`;
    } finally {
      sendButton.disabled = false;
      messages.scrollTop = messages.scrollHeight;
    }
  });
})();
