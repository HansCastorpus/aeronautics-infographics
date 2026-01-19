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

function isSmallScreen() {
  return window.matchMedia("(max-width: 2560px)").matches;
}

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

  const showImageBtn = document.getElementById("showImageBtn");
  const imageModal = document.getElementById("imageModal");
  const modalImg = imageModal.querySelector("img");

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
  const Role = [
    ...new Set(
      items
        .map((p) => (Array.isArray(p.Role) ? p.Role : [p.Role]))
        .flat()
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  const Type = [
    ...new Set(
      items
        .map((p) => (Array.isArray(p.Type) ? p.Type : [p.Type]))
        .flat()
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  const Scale = [
    ...new Set(
      items
        .map((p) => (Array.isArray(p.Scale) ? p.Scale : [p.Scale]))
        .flat()
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  const Era = [
    ...new Set(
      items
        .map((p) => (Array.isArray(p.Era) ? p.Era : [p.Era]))
        .flat()
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

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
      // ---------------- SINGLE-VALUE FIELDS ----------------
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

      // ---------------- MULTI-VALUE FIELDS (ALL SELECTED MUST MATCH) ----------------
      function matchesMultiExact(fieldValue, selectedArray) {
        if (!fieldValue) return selectedArray.length === 0; // no value only matches if nothing is selected
        if (selectedArray.length === 0) return true; // nothing selected, match everything

        const fieldArr = Array.isArray(fieldValue) ? fieldValue : [fieldValue];

        // Check that every selected value exists in the field array
        return selectedArray.every((val) => fieldArr.includes(val));
      }

      const roleMatch = matchesMultiExact(item.Role, selected.role);
      const typeMatch = matchesMultiExact(item.Type, selected.type);
      const scaleMatch = matchesMultiExact(item.Scale, selected.scale);
      const eraMatch = matchesMultiExact(item.Era, selected.era);

      // ---------------- COMBINE ALL ----------------
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

    // ---------------- SORTING ----------------
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

  // Helper to flatten all values for a field (supports arrays in JSON)
  function getUniqueOptions(fieldArray) {
    return [
      ...new Set(
        fieldArray
          .map((item) => {
            if (!item) return [];
            return Array.isArray(item) ? item : [item]; // handle single values and arrays
          })
          .flat()
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }

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

  // ------------------- CREATE DROPDOWNS -------------------
  // Flatten arrays in JSON so multi-value fields are separate options
  createDropdown(
    "Aircraft Name",
    getUniqueOptions(AircraftNames),
    selected.hair
  );
  createDropdown("Company", getUniqueOptions(Companies), selected.eye);
  createDropdown(
    "Engine Manufacturer",
    getUniqueOptions(EngineBuilders),
    selected.gender
  );
  createDropdown("Role", getUniqueOptions(Role), selected.role);
  createDropdown("Type", getUniqueOptions(Type), selected.type);
  createDropdown("Scale", getUniqueOptions(Scale), selected.scale);
  createDropdown("Era", getUniqueOptions(Era), selected.era);

  document.querySelectorAll(".dropdown-filter button").forEach((button) => {
    button.classList.remove("active");
  });

  // ------------------- NUMERIC SORT -------------------
  const numericContainer = document.getElementById("numeric-filters");
  const toggleBtn = document.getElementById("toggleOrderBtn");

  // ---------- TOGGLE PLACEHOLDER ----------
  const togglePlaceholder = document.createElement("div");
  togglePlaceholder.className = "toggle-placeholder";
  toggleBtn.parentNode.insertBefore(togglePlaceholder, toggleBtn);
  togglePlaceholder.appendChild(toggleBtn);

  function placeToggleCorrectly(referenceBtn = null) {
    if (!toggleBtn) return;

    if (isSmallScreen()) {
      // ALWAYS lock toggle back to placeholder on small screens
      if (toggleBtn.parentNode !== togglePlaceholder) {
        togglePlaceholder.appendChild(toggleBtn);
      }
    } else {
      // On large screens, move next to active numeric button
      if (referenceBtn) {
        numericContainer.insertBefore(toggleBtn, referenceBtn);
      }
    }
  }

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

      // Only reorder toggle on LARGE screens
      placeToggleCorrectly(btn);
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
      // Clear all selections
      Object.keys(selected).forEach((k) => (selected[k].length = 0));

      // Reset sort
      activeSort = null;
      ascending = true;

      // Reset checkboxes & dropdowns
      document
        .querySelectorAll("#extra-filters input[type=checkbox]")
        .forEach((cb) => (cb.checked = false));
      document
        .querySelectorAll("#extra-filters > .dropdown-filter > button")
        .forEach((b) => {
          b.classList.remove("active");
          b.classList.add("inactive");
        });

      numericContainer
        .querySelectorAll("button")
        .forEach((b) => b.classList.remove("active"));

      // Restore toggle button to placeholder
      if (toggleBtn && togglePlaceholder) {
        togglePlaceholder.appendChild(toggleBtn);
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

  // ------------------- LEFT-COLUMN EXTRA IMAGE MODAL -------------------

  showImageBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    const isOpen = imageModal.classList.contains("show");

    if (isOpen) {
      closeExtraImage();
      return;
    }

    const currentItem = filteredItems[currentIndex];
    if (!currentItem?.extraImage) return;

    modalImg.src = currentItem.extraImage;
    modalImg.alt = currentItem.AircraftName || "Extra Image";

    // Set copyright caption
    const captionDiv = imageModal.querySelector(".image-caption");
    captionDiv.textContent = currentItem.copyright || "";

    imageModal.classList.add("show");
    showImageBtn.classList.add("active");
  });

  // Escape key still closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeExtraImage();
    }
  });

  // Close on ANY click on the overlay
  imageModal.addEventListener("click", () => {
    closeExtraImage();
  });

  function closeExtraImage() {
    imageModal.classList.remove("show");
    showImageBtn.classList.remove("active");
  }

  showImageBtn.classList.add("active"); // when opening
  showImageBtn.classList.remove("active"); // when closing

  // Close extra image when navigating
  const navArrows = [
    document.getElementById("prevBtn"),
    document.getElementById("nextBtn"),
  ];

  navArrows.forEach((arrow) => {
    arrow.addEventListener("click", () => {
      closeExtraImage(); // reuses your existing function
    });
  });

  // Get all buttons on the page except the show image button
  const allButtons = Array.from(document.querySelectorAll("button")).filter(
    (btn) => btn !== showImageBtn
  );

  // Close extra image whenever any of these buttons is clicked
  allButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      closeExtraImage();
    });
  });

  // Confused as to what that does

  window.addEventListener("resize", () => {
    placeToggleCorrectly();
  });

  // ------------------- INITIALIZE -------------------
  applyFilters();
}
