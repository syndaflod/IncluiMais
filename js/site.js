(() => {
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

    document.querySelectorAll(".site-footer .footer-shell").forEach((footer) => {
      const brandText = footer.querySelector(":scope > p:first-child");
      if (!brandText || footer.querySelector(".footer-brand")) return;
      const brand = document.createElement("div");
      brand.className = "footer-brand";
      brand.innerHTML = '<img src="assets/logo-footer.svg" alt=""><p>Informação para uma cidade mais acessível.</p>';
      brandText.replaceWith(brand);
    });
  };

  configurarIdentidade();

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
    if (menu.querySelector(".nav-more")) return;
    menu.insertAdjacentHTML("beforeend", '<details class="nav-more"><summary>Mais</summary><div class="nav-more-menu"><a href="sobre.html">Sobre</a><a href="impacto.html">Impacto</a><a href="midia.html">Mídia</a><a href="noticias.html">Notícias</a><a href="orcamento_hospedagem.html">Orçamento</a></div></details>');
  });
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const form = document.querySelector("[data-demo-form]");
  const status = document.querySelector("[data-form-status]");
  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        status.textContent = "Revise os campos destacados antes de enviar.";
        return;
      }
      status.textContent = "Recebemos sua contribuição. Obrigado por ajudar a tornar a cidade mais acessível.";
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
    { terms: ["cadastro", "cadastrar", "sugerir"], answer: "Use a página Cadastro de estabelecimento para sugerir um local e informar os recursos de acessibilidade disponíveis." },
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
    const answer = match?.answer || "Ainda não tenho essa resposta. Tente perguntar sobre mapa, cadastro, filtros, contato ou privacidade.";
    messages.insertAdjacentHTML("beforeend", `<p class="chatbot-message"><strong>Você:</strong> ${question.replace(/[<>]/g, "")}</p><p class="chatbot-message"><strong>IncluiMais:</strong> ${answer}</p>`);
    input.value = "";
    messages.scrollTop = messages.scrollHeight;
  });
})();
