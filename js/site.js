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
      <div class="accessibility-skip-links" aria-label="Atalhos de navegação">
        <a href="#conteudo">Ir para o conteúdo</a>
        <a href="#menu-principal">Ir para o menu</a>
        <a href="#rodape-site">Ir para o rodapé</a>
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
      mobileMenu.querySelector(".mobile-accessibility-toggle")?.setAttribute("aria-expanded", "true");
      control.closest(".accessibility-controls")?.classList.add("is-open");
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector("[data-accessibility-controls]")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    requestAnimationFrame(() => control?.focus({ preventScroll: true }));
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
      { titulo: "O projeto", destinos: ["sobre.html", "impacto.html", "midia.html", "noticias.html", "orcamento_hospedagem.html"] },
      { titulo: "Ajuda", destinos: ["acessibilidade.html", "contato.html"] }
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
        : "Número de locais: [PREENCHER]";
    } catch {
      alvo.textContent = "Número de locais: [PREENCHER]";
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

  if (!document.querySelector("[vw]")) {
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
      oldMore.outerHTML = '<div class="nav-more"><button type="button" aria-haspopup="menu" aria-expanded="false">Mais<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button><div class="nav-more-menu" role="menu" hidden><a role="menuitem" href="sobre.html">Sobre</a><a role="menuitem" href="impacto.html">Impacto</a><a role="menuitem" href="midia.html">Mídia</a><a role="menuitem" href="noticias.html">Notícias</a><a role="menuitem" href="orcamento_hospedagem.html">Orçamento</a></div></div>';
    } else if (!menu.querySelector(".nav-more")) {
      menu.insertAdjacentHTML("beforeend", '<div class="nav-more"><button type="button" aria-haspopup="menu" aria-expanded="false">Mais<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button><div class="nav-more-menu" role="menu" hidden><a role="menuitem" href="sobre.html">Sobre</a><a role="menuitem" href="impacto.html">Impacto</a><a role="menuitem" href="midia.html">Mídia</a><a role="menuitem" href="noticias.html">Notícias</a><a role="menuitem" href="orcamento_hospedagem.html">Orçamento</a></div></div>');
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
  renderFooter();
  carregarContagemDeLocais();
  document.querySelectorAll("[data-reading-settings]").forEach((button) => button.addEventListener("click", focarAjustesLeitura));
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const form = document.querySelector("[data-demo-form]");
  const status = document.querySelector("[data-form-status]");
  if (form && status) {
    const mensagensDeErro = new Map([
      ["valueMissing", "Preencha este campo."],
      ["patternMismatch", "Informe o CEP no formato 00000-000."],
      ["typeMismatch", "Informe um valor válido."]
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
      const chaveDoErro = ["valueMissing", "patternMismatch", "typeMismatch"].find((chave) => estado[chave]);
      erro.textContent = mensagensDeErro.get(chaveDoErro) || "Revise esta informação.";
    };
    form.querySelectorAll("input, select, textarea").forEach((controle) => {
      controle.addEventListener("input", () => limparErro(controle));
      controle.addEventListener("change", () => limparErro(controle));
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
      status.textContent = "Esta é uma demonstração: a indicação foi validada no navegador, mas não é enviada nem publicada no mapa.";
      form.reset();
    });
  }

  const toggle = document.querySelector(".chatbot-toggle");
  const panel = document.querySelector(".chatbot-panel");
  const chatForm = document.querySelector(".chatbot-form");
  const input = document.querySelector("#chatbot-pergunta");
  const messages = document.querySelector(".chatbot-messages");
  if (!toggle || !panel || !chatForm || !input || !messages) return;

  const faq = [
    { terms: ["mapa", "local", "encontrar"], answer: "Abra o mapa para buscar locais por nome, categoria e recursos como entrada, banheiro ou estacionamento acessível." },
    { terms: ["indicar", "indicação", "sugerir"], answer: "Use a página Indicar um local para sugerir um local e informar os recursos de acessibilidade disponíveis." },
    { terms: ["filtro", "categoria"], answer: "No mapa, escolha uma categoria e marque os recursos desejados. Os resultados são atualizados na mesma tela." },
    { terms: ["dados", "privacidade", "lgpd"], answer: "Esta versão é demonstrativa e não envia seus dados para um servidor. Confira sempre as informações do local antes de visitá-lo." },
    { terms: ["contato", "sugestão", "erro"], answer: "Envie uma sugestão ou corrija uma informação pela página Contato. O retorno aparece no próprio formulário." }
  ];

  toggle.addEventListener("click", () => {
    const open = panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) input.focus();
  });

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    const normalized = question.toLocaleLowerCase("pt-BR");
    const match = faq.find((item) => item.terms.some((term) => normalized.includes(term)));
    const answer = match?.answer || "Ainda não tenho essa resposta. Tente perguntar sobre mapa, indicação, filtros, contato ou privacidade.";
    messages.insertAdjacentHTML("beforeend", `<p class="chatbot-message"><strong>Você:</strong> ${question.replace(/[<>]/g, "")}</p><p class="chatbot-message"><strong>IncluiMais:</strong> ${answer}</p>`);
    input.value = "";
    messages.scrollTop = messages.scrollHeight;
  });
})();
