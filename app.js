(() => {
  "use strict";

  const AGENT_ID = 20236;
  const AGENT_URL = `https://app.virtuals.io/virtuals/${AGENT_ID}`;
  const API_URL = "https://api2.virtuals.io/api/virtuals/20236?populate[0]=image&populate[1]=launchInfo&populate[2]=creator&populate[3]=venturePartner.image&populate[4]=genesis&populate[5]=tokenomics.project&populate[6]=vibesInfo";
  const FALLBACK_CONTRACT = "0xB34bE18a6F069F00702caC8155C128A91C28CeC4";

  const select = (selector) => document.querySelector(selector);
  const selectAll = (selector) => [...document.querySelectorAll(selector)];

  const setText = (selector, value) => {
    selectAll(selector).forEach((element) => {
      element.textContent = value;
    });
  };

  const asNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  };

  const compactNumber = (value, maximumFractionDigits = 1) => {
    const number = asNumber(value);
    if (number === null) return "—";

    return new Intl.NumberFormat("en-US", {
      notation: Math.abs(number) >= 1000 ? "compact" : "standard",
      maximumFractionDigits,
    }).format(number);
  };

  const currency = (value) => {
    const number = asNumber(value);
    if (number === null) return "—";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: Math.abs(number) >= 1000 ? "compact" : "standard",
      maximumFractionDigits: number === 0 ? 0 : 1,
    }).format(number);
  };

  const shortenAddress = (address) => {
    if (typeof address !== "string" || address.length < 12) return "Unavailable";
    return `${address.slice(0, 8)}…${address.slice(-6)}`;
  };

  const setupNavigation = () => {
    const toggle = select("[data-nav-toggle]");
    const links = select("[data-nav-links]");
    if (!toggle || !links) return;

    const close = () => {
      toggle.setAttribute("aria-expanded", "false");
      links.classList.remove("is-open");
      select(".nav-toggle .sr-only").textContent = "Open navigation";
    };

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      links.classList.toggle("is-open", !isOpen);
      select(".nav-toggle .sr-only").textContent = isOpen ? "Open navigation" : "Close navigation";
    });

    links.addEventListener("click", (event) => {
      if (event.target.closest("a")) close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) close();
    });
  };

  const setupContractCopy = () => {
    const button = select("[data-copy-contract]");
    if (!button) return;

    button.addEventListener("click", async () => {
      const contract = button.dataset.contract || FALLBACK_CONTRACT;
      try {
        await navigator.clipboard.writeText(contract);
        button.textContent = "Copied";
      } catch (_error) {
        button.textContent = "Copy failed";
      }

      window.setTimeout(() => {
        button.textContent = "Copy";
      }, 1800);
    });
  };

  const updateContract = (contract) => {
    if (typeof contract !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(contract)) return;

    setText("[data-contract-address]", shortenAddress(contract));
    const copyButton = select("[data-copy-contract]");
    const baseScanLink = select("[data-basescan-link]");
    if (copyButton) copyButton.dataset.contract = contract;
    if (baseScanLink) baseScanLink.href = `https://basescan.org/token/${contract}`;
  };

  const updateAcpStatus = (agent) => {
    const acpId = agent.v3AcpAgentId || agent.acpAgentId;
    const acpStatus = select("[data-acp-status]");
    const economyStatus = select("[data-economyos-status]");

    if (acpId) {
      setText("[data-agent-state]", `ACP agent ${acpId} live`);
      setText("[data-integration-state]", "ACP identity active");
      setText("[data-acp-note]", `Bastet is registered as ACP agent ${acpId}. Follow the Virtuals profile for current services, jobs, and reputation.`);
      if (acpStatus) {
        acpStatus.textContent = `Agent ${acpId} active`;
        acpStatus.classList.add("is-live");
      }
      if (economyStatus) {
        economyStatus.textContent = "Identity active";
        economyStatus.classList.add("is-live");
      }
      return;
    }

    setText("[data-agent-state]", "Virtuals profile · ACP pending");
    setText("[data-integration-state]", "Profile live · ACP pending");
  };

  const updateTokenConsole = (agent) => {
    const contract = agent.tokenAddress || agent.preToken || FALLBACK_CONTRACT;
    const holderCount = agent.holderCount ?? agent.holders;
    const status = typeof agent.status === "string" ? agent.status.replaceAll("_", " ") : "LIVE";

    setText("[data-token-name]", agent.name || "Bastet the Protector");
    setText("[data-token-symbol]", `$${agent.symbol || "BASTET"}`);
    setText("[data-token-chain]", agent.chain || "BASE");
    setText("[data-chain]", agent.chain === "BASE" ? "Base" : agent.chain || "Base");
    setText("[data-token-status]", status);
    setText('[data-metric="market-cap"]', compactNumber(agent.mcapInVirtual));
    setText('[data-metric="liquidity"]', currency(agent.liquidityUsd));
    setText('[data-metric="holders"]', compactNumber(holderCount, 0));
    setText('[data-metric="volume"]', currency(agent.volume24h));
    updateContract(contract);
  };

  const loadVirtualsData = async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 9000);

    try {
      const response = await fetch(API_URL, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Virtuals API returned ${response.status}`);

      const payload = await response.json();
      const agent = payload && typeof payload.data === "object" ? payload.data : payload;
      if (!agent || Number(agent.id) !== AGENT_ID) throw new Error("Unexpected Virtuals response");

      updateTokenConsole(agent);
      updateAcpStatus(agent);
      setText("[data-sync-label]", "Live");
      setText("[data-sync-time]", `Live Virtuals data received ${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date())}`);
    } catch (_error) {
      setText("[data-sync-label]", "Unavailable");
      setText("[data-token-status]", "API OFFLINE");
      setText("[data-agent-state]", "Virtuals profile available");
      setText("[data-integration-state]", "Profile link available");
      setText("[data-sync-time]", "Live metrics unavailable — open the Virtuals profile for current data");
      const syncDot = select(".sync-dot");
      if (syncDot) syncDot.classList.add("is-error");
      updateContract(FALLBACK_CONTRACT);
    } finally {
      window.clearTimeout(timeout);
    }
  };

  document.documentElement.dataset.agentUrl = AGENT_URL;
  setText("[data-year]", new Date().getFullYear());
  setupNavigation();
  setupContractCopy();
  updateContract(FALLBACK_CONTRACT);
  loadVirtualsData();
})();
