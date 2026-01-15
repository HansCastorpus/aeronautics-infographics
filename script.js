// script.js - full rewrite with dropdown improvements and external arrows

let items = [];

// Load JSON
fetch("./items.json")
  .then((res) => res.json())
  .then((data) => {
    items = data;
    startApp();
  })
  .catch((err) => console.error("Failed to load items.json:", err));

// Placeholder flags
const countryFlags = {
  "U.S.A": "images/flags/USA.png",
  Malaysia: "images/flags/france.png",
  France: "images/flags/France.png",
  Kenya: "images/flags/france.png",
  Canada: "images/flags/france.png",
  Japan: "images/flags/Japan.png",
  Germany: "images/flags/Germany.png",
  Nigeria: "images/flags/france.png",
  Mexico: "images/flags/france.png",
  India: "images/flags/france.png",
  "Great Britain": "images/flags/UK.png",
  Sweden: "images/flags/Sweden.png",
  Italy: "images/flags/Italy.png",
  Switzerland: "images/flags/Switzerland.png",
  Australia: "images/flags/Australia.png",
  Canada: "images/flags/Canada.png",
  Poland: "images/flags/Poland.png",
};

function startApp() {
  let currentIndex = 0;

  const selected = {
    continents: [],
    countries: [],
    hair: [],
    eye: [],
    gender: [],
    role: [],
    type: [],
    scale: [],
    era: [],
  };

  let filteredItems = items;
  let activeSort = null;
  let ascending = true;

  // ------------------- CONTINENT / COUNTRY MAP -------------------
  const continentMap = {};
  for (const p of items) {
    if (!continentMap[p.Continent]) continentMap[p.Continent] = [];
    if (!continentMap[p.Continent].includes(p.country)) {
      continentMap[p.Continent].push(p.country);
    }
  }

  const AircraftNames = [...new Set(items.map((p) => p.AircraftName))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  const Companies = [...new Set(items.map((p) => p.Company))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  const EngineBuilders = [...new Set(items.map((p) => p.EngineBuilder))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  const Role = [...new Set(items.map((p) => p.Role))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  const Type = [...new Set(items.map((p) => p.Type))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  const Scale = [...new Set(items.map((p) => p.Scale))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  const Era = [...new Set(items.map((p) => p.Era))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));




  // ------------------- RENDER ITEM -------------------
function renderItem() {
  const wrapper = document.getElementById("image-wrapper");
  const item = filteredItems[currentIndex];

  if (!item) {
    wrapper.innerHTML = `<div class="no-results">No items match your filters.</div>`;
    return;
  }

  wrapper.innerHTML = `<img src="${item.image}" alt="${item.name}">`;
}



  // ------------------- FILTERS -------------------
  function applyFilters() {
    filteredItems = items.filter((item) => {
      const contMatch =
        selected.continents.length === 0 ||
        selected.continents.includes(item.Continent);
      const countryMatch =
        selected.countries.length === 0 ||
        selected.countries.includes(item.country);
      const hairMatch =
        selected.hair.length === 0 || selected.hair.includes(item.AircraftName);
      const eyeMatch =
        selected.eye.length === 0 || selected.eye.includes(item.Company);
      const genderMatch =
        selected.gender.length === 0 ||
        selected.gender.includes(item.EngineBuilder);
      const roleMatch =
        selected.role.length === 0 || selected.role.includes(item.Role);
      const typeMatch =
        selected.type.length === 0 || selected.type.includes(item.Type);
      const scaleMatch =
        selected.scale.length === 0 || selected.scale.includes(item.Scale);
      const eraMatch =
        selected.era.length === 0 || selected.era.includes(item.Era);
      return (
        contMatch &&
        countryMatch &&
        hairMatch &&
        eyeMatch &&
        genderMatch &&
        roleMatch &&
        typeMatch &&
        scaleMatch &&
        eraMatch
      );
    });

    if (activeSort) {
      filteredItems.sort((a, b) => {
        const av = Number(a[activeSort]) || 0;
        const bv = Number(b[activeSort]) || 0;
        return ascending ? av - bv : bv - av;
      });
    }

    currentIndex = 0;
    renderItem();
    updateButtonStates();
    updateSortToggleUI();
  }

  // ------------------- CONTINENT / COUNTRY TOGGLE -------------------
  function toggleContinent(cont) {
    const isActive = selected.continents.includes(cont);
    if (!isActive) {
      selected.continents.push(cont);
      continentMap[cont].forEach((c) => {
        if (!selected.countries.includes(c)) selected.countries.push(c);
      });
    } else {
      selected.continents = selected.continents.filter((x) => x !== cont);
      selected.countries = selected.countries.filter(
        (c) => !continentMap[cont].includes(c)
      );
    }
    applyFilters();
  }

  function toggleCountry(country) {
    const isActive = selected.countries.includes(country);
    const parentCont = Object.keys(continentMap).find((cont) =>
      continentMap[cont].includes(country)
    );
    if (!isActive) {
      selected.countries.push(country);
      if (!selected.continents.includes(parentCont))
        selected.continents.push(parentCont);
    } else {
      selected.countries = selected.countries.filter((c) => c !== country);
      if (!continentMap[parentCont].some((c) => selected.countries.includes(c)))
        selected.continents = selected.continents.filter(
          (cont) => cont !== parentCont
        );
    }
    applyFilters();
  }

  // ------------------- BUILD CONTINENT / COUNTRY UI -------------------
  const continentImages = {
    Asia: "images/continents/asia.png",
    Europe: "images/continents/europe.png",
    Americas: "images/continents/americas.png",
    Africa: "images/continents/africa.png",
    Oceania: "images/continents/oceania.png",
  };

  const filtersDiv = document.getElementById("filters");
  filtersDiv.innerHTML = "";

  Object.keys(continentMap)
    .sort()
    .forEach((cont) => {
      const block = document.createElement("div");
      block.className = "continent-group";

      const contBtn = document.createElement("button");
      const img = document.createElement("img");
      img.src = continentImages[cont] || "images/flags/placeholder.png";
      img.alt = cont;
      img.className = "country-flag";
      contBtn.appendChild(img);

      const span = document.createElement("span");
      span.textContent = cont;
      contBtn.appendChild(span);

      contBtn.addEventListener("click", () => toggleContinent(cont));

      block.appendChild(contBtn);

      const countriesDiv = document.createElement("div");
      countriesDiv.className = "country-buttons";

      continentMap[cont].sort().forEach((c) => {
        const btn = document.createElement("button");
        btn.dataset.country = c;

        const img = document.createElement("img");
        img.src = countryFlags[c] || "images/flags/placeholder.png";
        img.alt = c;
        btn.appendChild(img);

        const span = document.createElement("span");
        span.textContent = c;
        btn.appendChild(span);

        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleCountry(c);
        });

        countriesDiv.appendChild(btn);
      });

      block.appendChild(countriesDiv);
      filtersDiv.appendChild(block);
    });

  // ------------------- DROPDOWNS -------------------
  const extraFiltersDiv = document.getElementById("extra-filters");

  function createDropdown(label, options, targetArray) {
    const container = document.createElement("div");
    container.className = "dropdown-filter";

    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("inactive");

    const icon = document.createElement("img");
    icon.src = `images/icons/${label.toLowerCase().replace(/\s+/g, "_")}.png`;
    icon.className = "dropdown-button-icon";
    button.appendChild(icon);

    const span = document.createElement("span");
    span.textContent = label;
    button.appendChild(span);

    container.appendChild(button);

    const panel = document.createElement("div");
    panel.className = "dropdown-panel";
    panel.style.display = "none";
    panel.style.opacity = 0;
    panel.style.transform = "translateY(-10px)";

    options.forEach((opt) => {
      const row = document.createElement("label");
      row.style.display = "flex";
      row.style.flexDirection = "row";
      row.style.alignItems = "center";
      row.style.gap = "6px";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = opt;

      cb.addEventListener("change", () => {
        targetArray.length = 0;
        panel
          .querySelectorAll("input:checked")
          .forEach((x) => targetArray.push(x.value));
        button.classList.toggle("active", targetArray.length > 0);
        button.classList.toggle("inactive", targetArray.length === 0);
        applyFilters();
      });

      const spanText = document.createElement("span");
      spanText.textContent = opt;

      row.appendChild(cb);
      row.appendChild(spanText);
      panel.appendChild(row);
    });

    container.appendChild(panel);
    extraFiltersDiv.appendChild(container);

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      document
        .querySelectorAll(".dropdown-filter.open")
        .forEach((openContainer) => {
          if (openContainer !== container) {
            openContainer.classList.remove("open");
            const openPanel = openContainer.querySelector(".dropdown-panel");
            openPanel.style.opacity = 0;
            openPanel.style.transform = "translateY(-10px)";
            setTimeout(() => (openPanel.style.display = "none"), 250);
          }
        });

      const isOpen = container.classList.toggle("open");
      panel.style.display = isOpen ? "block" : "none";
      requestAnimationFrame(() => {
        panel.style.opacity = isOpen ? 1 : 0;
        panel.style.transform = isOpen ? "translateY(0)" : "translateY(-10px)";
      });
    });

    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) {
        container.classList.remove("open");
        panel.style.opacity = 0;
        panel.style.transform = "translateY(-10px)";
        setTimeout(() => (panel.style.display = "none"), 250);
      }
    });
  }

  createDropdown("Aircraft Name", AircraftNames, selected.hair);
  createDropdown("Company", Companies, selected.eye);
  createDropdown("Engine Manufacturer", EngineBuilders, selected.gender);
  createDropdown("Role", Role, selected.role);
  createDropdown("Type", Type, selected.type);
  createDropdown("Scale", Scale, selected.scale);
  createDropdown("Era", Era, selected.era);

  document.querySelectorAll(".dropdown-filter button").forEach((button) => {
    button.classList.remove("active");
  });

  // ------------------- NUMERIC SORT -------------------
  const numericContainer = document.getElementById("numeric-filters");
  const toggleBtn = document.getElementById("toggleOrderBtn");
  if (toggleBtn && !numericContainer.contains(toggleBtn))
    numericContainer.insertBefore(toggleBtn, numericContainer.firstChild);

  const allowedNumeric = [
    "Crew",
    "Max Speed - km.h",
    "Service Ceiling - m",
    "Operational Range - km",
    "Length - m",
    "Span - m",
    "Height - m",
    "Armament Bombs - kg",
    "Fuel Load - l",
    "Passenger Capacity",
    "Empty Weight - kg",
    "Max Weight - kg",
    "Horsepower - hp",
    "Thrust - kn",
    "Quantity Produced",
  ];
  const numericKeys = allowedNumeric.filter((k) =>
    items.some((i) => typeof i[k] === "number")
  );

  for (const key of numericKeys) {
    const btn = document.createElement("button");
    btn.dataset.field = key;

    const icon = document.createElement("img");
    icon.src = `images/icons/${key
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[()]/g, "")}.png`;
    icon.className = "dropdown-button-icon";
    btn.appendChild(icon);

    const span = document.createElement("span");
    span.textContent = key;
    btn.appendChild(span);

    btn.addEventListener("click", () => {
      if (activeSort !== key) {
        activeSort = key;
        ascending = false;
      }
      if (toggleBtn) numericContainer.insertBefore(toggleBtn, btn);
      applyFilters();
    });

    numericContainer.appendChild(btn);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      if (!activeSort) return;
      ascending = !ascending;
      applyFilters();
    });
  }

  function updateSortToggleUI() {
    if (!toggleBtn) return;
    toggleBtn.classList.remove("asc-active", "desc-active");
    if (activeSort)
      toggleBtn.classList.add(ascending ? "asc-active" : "desc-active");
  }

  // ------------------- RESET -------------------
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      selected.continents.length = 0;
      selected.countries.length = 0;
      selected.hair.length = 0;
      selected.eye.length = 0;
      selected.gender.length = 0;
      selected.role.length = 0;
      selected.type.length = 0;

      activeSort = null;
      ascending = true;

      document
        .querySelectorAll("#extra-filters input[type=checkbox]")
        .forEach((cb) => (cb.checked = false));
      document
        .querySelectorAll("#extra-filters > .dropdown-filter > button")
        .forEach((b) => b.classList.remove("active"));
      numericContainer
        .querySelectorAll("button")
        .forEach((b) => b.classList.remove("active"));
      if (toggleBtn) {
        numericContainer.prepend(toggleBtn);
        toggleBtn.classList.remove("asc-active", "desc-active");
      }

      applyFilters();
    });
  }

  // ------------------- BUTTON STATES -------------------
  function updateButtonStates() {
    document
      .querySelectorAll(".continent-group > button:first-child")
      .forEach((btn) => {
        const cont = btn.textContent;
        const active = selected.continents.includes(cont);
        const inactive = selected.continents.length > 0 && !active;
        btn.classList.toggle("active", active);
        btn.classList.toggle("inactive", inactive);
      });

    document.querySelectorAll(".country-buttons button").forEach((btn) => {
      const country = btn.dataset.country;
      const parent = Object.keys(continentMap).find((cont) =>
        continentMap[cont].includes(country)
      );
      const activeCountry = selected.countries.includes(country);
      const inactive =
        selected.countries.length === 0 && selected.continents.length === 0
          ? false
          : !activeCountry;
      btn.classList.toggle("active", activeCountry);
      btn.classList.toggle("inactive", inactive);
      const img = btn.querySelector("img");
      if (img) img.style.filter = inactive ? "grayscale(100%)" : "none";
    });

    numericContainer.querySelectorAll("button").forEach((btn) => {
      const field = btn.dataset.field;
      if (!field) return;
      btn.classList.toggle("active", field === activeSort);
    });
  }

  // ------------------- NAVIGATION ARROWS -------------------
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  function bindExternalArrows() {
    if (nextBtn)
      nextBtn.onclick = () => {
        if (!filteredItems.length) return;
        currentIndex = (currentIndex + 1) % filteredItems.length;
        renderItem();
      };
    if (prevBtn)
      prevBtn.onclick = () => {
        if (!filteredItems.length) return;
        currentIndex =
          (currentIndex - 1 + filteredItems.length) % filteredItems.length;
        renderItem();
      };
  }

  bindExternalArrows();

  // ------------------- PHOTO MODAL -------------------
  const showImageBtn = document.getElementById("showImageBtn");
  const imageModal = document.getElementById("imageModal");

  showImageBtn.addEventListener("click", () => {
    imageModal.classList.add("show");
  });

  // Close modal when clicking outside the image
  imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) {
      imageModal.classList.remove("show");
    }
  });

  // Close modal when pressing Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      imageModal.classList.remove("show");
    }
  });

  // ------------------- INITIALIZE -------------------
  applyFilters();
}
