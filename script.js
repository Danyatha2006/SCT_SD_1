/* =========================================================
   THERMOSENSE
   Temperature Intelligence Dashboard
   Conversion + History + References + Animations
   ========================================================= */


/* ===================== DOM ELEMENTS ===================== */

const temperatureInput =
    document.getElementById("temperatureInput");

const fromUnit =
    document.getElementById("fromUnit");

const toUnit =
    document.getElementById("toUnit");

const resultValue =
    document.getElementById("resultValue");

const resultUnit =
    document.getElementById("resultUnit");

const precisionSelect =
    document.getElementById("precision");

const swapButton =
    document.getElementById("swapButton");

const largeSwap =
    document.getElementById("largeSwap");

const copyResult =
    document.getElementById("copyResult");

const statusTemperature =
    document.getElementById("statusTemperature");

const temperatureCategory =
    document.getElementById("temperatureCategory");

const temperatureDescription =
    document.getElementById("temperatureDescription");

const temperatureIcon =
    document.getElementById("temperatureIcon");

const scaleIndicator =
    document.getElementById("scaleIndicator");

const historyList =
    document.getElementById("historyList");

const clearHistoryButton =
    document.getElementById("clearHistory");


/* ===================== CONSTANTS ===================== */

const unitSymbols = {
    C: "°C",
    F: "°F",
    K: "K"
};

const unitNames = {
    C: "Celsius",
    F: "Fahrenheit",
    K: "Kelvin"
};

const HISTORY_STORAGE_KEY =
    "thermosense_conversion_history";

const MAX_HISTORY_ITEMS = 10;


/* ===================== HISTORY STATE ===================== */

let conversionHistory =
    loadHistory();

let historyTimer;


/* ===================== CONVERSION ENGINE ===================== */

function convertToCelsius(value, unit) {

    switch (unit) {

        case "C":
            return value;

        case "F":
            return (value - 32) * 5 / 9;

        case "K":
            return value - 273.15;

        default:
            return NaN;
    }
}


function convertFromCelsius(celsius, unit) {

    switch (unit) {

        case "C":
            return celsius;

        case "F":
            return (celsius * 9 / 5) + 32;

        case "K":
            return celsius + 273.15;

        default:
            return NaN;
    }
}


function convertTemperature(
    value,
    sourceUnit,
    destinationUnit
) {

    const celsius =
        convertToCelsius(
            value,
            sourceUnit
        );

    if (Number.isNaN(celsius)) {
        return NaN;
    }

    return convertFromCelsius(
        celsius,
        destinationUnit
    );
}


/* ===================== VALIDATION ===================== */

function isValidTemperature(value, unit) {

    if (!Number.isFinite(value)) {
        return false;
    }

    const celsius =
        convertToCelsius(
            value,
            unit
        );

    return celsius >= -273.15;
}


/* ===================== TEMPERATURE CATEGORY ===================== */

function getTemperatureCategory(celsius) {

    if (celsius <= 0) {

        return {
            category: "FREEZING",
            icon: "❄️",
            description:
                "Extremely cold conditions around or below the freezing point."
        };
    }


    if (celsius <= 15) {

        return {
            category: "COLD",
            icon: "🧥",
            description:
                "A cool temperature with noticeably low thermal conditions."
        };
    }


    if (celsius <= 25) {

        return {
            category: "MODERATE",
            icon: "🌤️",
            description:
                "A moderate temperature generally associated with comfortable conditions."
        };
    }


    if (celsius <= 35) {

        return {
            category: "WARM",
            icon: "☀️",
            description:
                "A warm temperature with elevated thermal conditions."
        };
    }


    return {
        category: "HOT",
        icon: "🔥",
        description:
            "A high temperature with intense thermal conditions."
    };
}


/* ===================== TEMPERATURE SCALE ===================== */

function updateTemperatureScale(celsius) {

    const minimum = -20;
    const maximum = 60;

    let percentage =
        ((celsius - minimum) /
        (maximum - minimum)) * 100;

    percentage =
        Math.max(
            0,
            Math.min(
                100,
                percentage
            )
        );

    if (scaleIndicator) {

        scaleIndicator.style.left =
            `${percentage}%`;
    }
}


/* ===================== STATUS UPDATE ===================== */

function updateTemperatureStatus(celsius) {

    const status =
        getTemperatureCategory(celsius);

    const precision =
        Number(
            precisionSelect.value
        );


    if (temperatureIcon) {

        temperatureIcon.textContent =
            status.icon;
    }


    if (temperatureCategory) {

        temperatureCategory.textContent =
            status.category;
    }


    if (temperatureDescription) {

        temperatureDescription.textContent =
            status.description;
    }


    if (statusTemperature) {

        statusTemperature.textContent =
            `${celsius.toFixed(precision)}°C`;
    }


    updateTemperatureScale(
        celsius
    );
}


/* ===================== RESULT ANIMATION ===================== */

function animateResult() {

    if (!resultValue) {
        return;
    }


    resultValue.classList.remove(
        "result-update"
    );


    /*
        Force browser reflow so the
        animation can restart.
    */

    void resultValue.offsetWidth;


    resultValue.classList.add(
        "result-update"
    );
}


/* ===================== MAIN CONVERSION ===================== */

function updateConversion() {

    if (
        !temperatureInput ||
        !fromUnit ||
        !toUnit
    ) {
        return;
    }


    const rawValue =
        temperatureInput.value.trim();


    /*
        Empty input
    */

    if (rawValue === "") {

        if (resultValue) {

            resultValue.textContent =
                "—";
        }

        if (resultUnit) {

            resultUnit.textContent =
                unitSymbols[toUnit.value];
        }

        return;
    }


    const value =
        Number(rawValue);


    /*
        Validate temperature.
    */

    if (
        !isValidTemperature(
            value,
            fromUnit.value
        )
    ) {

        if (resultValue) {

            resultValue.textContent =
                "Invalid";
        }

        if (resultUnit) {

            resultUnit.textContent =
                unitSymbols[toUnit.value];
        }


        if (statusTemperature) {

            statusTemperature.textContent =
                "Invalid temperature";
        }


        if (temperatureCategory) {

            temperatureCategory.textContent =
                "ERROR";
        }


        if (temperatureIcon) {

            temperatureIcon.textContent =
                "⚠️";
        }


        if (temperatureDescription) {

            temperatureDescription.textContent =
                "Temperature cannot be below absolute zero.";
        }


        if (scaleIndicator) {

            scaleIndicator.style.left =
                "0%";
        }


        return;
    }


    /*
        Perform conversion.
    */

    const convertedValue =
        convertTemperature(
            value,
            fromUnit.value,
            toUnit.value
        );


    const precision =
        Number(
            precisionSelect.value
        );


    const formattedValue =
        convertedValue.toFixed(
            precision
        );


    /*
        Update result.
    */

    if (resultValue) {

        resultValue.textContent =
            formattedValue;

        animateResult();
    }


    if (resultUnit) {

        resultUnit.textContent =
            unitSymbols[toUnit.value];
    }


    /*
        Update temperature analysis.
    */

    const celsius =
        convertToCelsius(
            value,
            fromUnit.value
        );


    updateTemperatureStatus(
        celsius
    );
}


/* =========================================================
   HISTORY SYSTEM
   ========================================================= */


/* ===================== LOAD HISTORY ===================== */

function loadHistory() {

    try {

        const savedHistory =
            localStorage.getItem(
                HISTORY_STORAGE_KEY
            );


        if (!savedHistory) {

            return [];
        }


        const parsedHistory =
            JSON.parse(
                savedHistory
            );


        return Array.isArray(
            parsedHistory
        )
            ? parsedHistory
            : [];

    }
    catch (error) {

        console.error(
            "Unable to load conversion history:",
            error
        );

        return [];
    }
}


/* ===================== SAVE HISTORY ===================== */

function saveHistory() {

    try {

        localStorage.setItem(
            HISTORY_STORAGE_KEY,
            JSON.stringify(
                conversionHistory
            )
        );

    }
    catch (error) {

        console.error(
            "Unable to save conversion history:",
            error
        );
    }
}


/* ===================== FORMAT TIME ===================== */

function formatTime(timestamp) {

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    ).format(
        new Date(timestamp)
    );
}


/* ===================== RECORD CONVERSION ===================== */

function recordConversion() {

    if (
        !temperatureInput ||
        !fromUnit ||
        !toUnit
    ) {
        return;
    }


    const rawValue =
        temperatureInput.value.trim();


    if (rawValue === "") {

        return;
    }


    const value =
        Number(rawValue);


    if (
        !isValidTemperature(
            value,
            fromUnit.value
        )
    ) {

        return;
    }


    const convertedValue =
        convertTemperature(
            value,
            fromUnit.value,
            toUnit.value
        );


    const precision =
        Number(
            precisionSelect.value
        );


    const formattedInput =
        value.toFixed(
            precision
        );


    const formattedOutput =
        convertedValue.toFixed(
            precision
        );


    /*
        Prevent identical consecutive
        entries.
    */

    const latestEntry =
        conversionHistory[0];


    if (
        latestEntry &&
        latestEntry.input ===
            formattedInput &&
        latestEntry.output ===
            formattedOutput &&
        latestEntry.from ===
            fromUnit.value &&
        latestEntry.to ===
            toUnit.value
    ) {

        return;
    }


    const historyEntry = {

        id:
            Date.now(),

        input:
            formattedInput,

        output:
            formattedOutput,

        from:
            fromUnit.value,

        to:
            toUnit.value,

        timestamp:
            Date.now()
    };


    conversionHistory.unshift(
        historyEntry
    );


    /*
        Keep only latest 10.
    */

    conversionHistory =
        conversionHistory.slice(
            0,
            MAX_HISTORY_ITEMS
        );


    saveHistory();

    renderHistory();
}


/* ===================== RENDER HISTORY ===================== */

function renderHistory() {

    if (!historyList) {

        return;
    }


    /*
        Empty state.
    */

    if (
        conversionHistory.length === 0
    ) {

        historyList.innerHTML = `
            <div class="history-empty">
                Your recent conversions will appear here.
            </div>
        `;

        return;
    }


    historyList.innerHTML =
        conversionHistory
            .map(
                (entry) => {

                    return `
                        <div
                            class="history-item"
                            data-id="${entry.id}"
                        >

                            <div class="history-conversion">

                                ${entry.input}
                                ${unitSymbols[entry.from]}

                                <span>→</span>

                                ${entry.output}
                                ${unitSymbols[entry.to]}

                            </div>

                            <span class="history-time">
                                ${formatTime(
                                    entry.timestamp
                                )}
                            </span>

                            <button
                                class="history-delete"
                                data-id="${entry.id}"
                                title="Delete conversion"
                                type="button"
                                aria-label="Delete conversion"
                            >
                                ×
                            </button>

                        </div>
                    `;
                }
            )
            .join("");
}


/* ===================== DELETE HISTORY ITEM ===================== */

function deleteHistoryItem(id) {

    conversionHistory =
        conversionHistory.filter(
            (entry) =>
                entry.id !== id
        );


    saveHistory();

    renderHistory();
}


/* ===================== CLEAR HISTORY ===================== */

function clearHistory() {

    if (
        conversionHistory.length === 0
    ) {

        return;
    }


    conversionHistory = [];

    saveHistory();

    renderHistory();
}


/* ===================== HISTORY CLICK ===================== */

if (historyList) {

    historyList.addEventListener(
        "click",
        (event) => {

            const deleteButton =
                event.target.closest(
                    ".history-delete"
                );


            if (!deleteButton) {

                return;
            }


            const id =
                Number(
                    deleteButton.dataset.id
                );


            deleteHistoryItem(id);
        }
    );
}


/* =========================================================
   QUICK REFERENCE TEMPERATURES
   ========================================================= */

const referenceItems =
    document.querySelectorAll(
        ".reference-item"
    );


const referenceTemperatures = [

    {
        value: 0,
        unit: "C"
    },

    {
        value: 25,
        unit: "C"
    },

    {
        value: 37,
        unit: "C"
    },

    {
        value: 100,
        unit: "C"
    }

];


referenceItems.forEach(
    (reference, index) => {

        reference.addEventListener(
            "click",
            () => {

                const selected =
                    referenceTemperatures[index];


                /*
                    Fill converter.
                */

                temperatureInput.value =
                    selected.value;


                fromUnit.value =
                    selected.unit;


                /*
                    If destination is also
                    Celsius, switch it to
                    Fahrenheit for a more
                    useful reference result.
                */

                if (
                    toUnit.value === "C"
                ) {

                    toUnit.value =
                        "F";
                }


                updateConversion();

                recordConversion();


                /*
                    Smoothly return to
                    converter.
                */

                const converterCard =
                    document.querySelector(
                        ".converter-card"
                    );


                if (converterCard) {

                    converterCard.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }

            }
        );
    }
);


/* =========================================================
   UNIT SWAP
   ========================================================= */

function swapUnits() {

    if (
        !fromUnit ||
        !toUnit
    ) {
        return;
    }


    const currentFrom =
        fromUnit.value;

    const currentTo =
        toUnit.value;


    /*
        Swap units.
    */

    fromUnit.value =
        currentTo;

    toUnit.value =
        currentFrom;


    updateConversion();

    recordConversion();


    /*
        Rotate swap buttons.
    */

    if (swapButton) {

        swapButton.style.transform =
            "rotate(180deg)";
    }


    if (largeSwap) {

        largeSwap.style.transform =
            "rotate(180deg)";
    }


    setTimeout(
        () => {

            if (swapButton) {

                swapButton.style.transform =
                    "";
            }


            if (largeSwap) {

                largeSwap.style.transform =
                    "";
            }

        },
        350
    );
}


/* =========================================================
   COPY RESULT
   ========================================================= */

async function copyConversionResult() {

    if (
        !resultValue ||
        !resultUnit
    ) {
        return;
    }


    const value =
        resultValue.textContent;

    const unit =
        resultUnit.textContent;


    /*
        Don't copy empty or invalid results.
    */

    if (
        value === "—" ||
        value === "Invalid"
    ) {

        return;
    }


    const textToCopy =
        `${value} ${unit}`;


    try {

        await navigator.clipboard.writeText(
            textToCopy
        );


        const originalText =
            copyResult.textContent;


        copyResult.textContent =
            "✓ Copied";


        copyResult.style.color =
            "var(--success)";


        setTimeout(
            () => {

                copyResult.textContent =
                    originalText;

                copyResult.style.color =
                    "";

            },
            1500
        );

    }
    catch (error) {

        console.error(
            "Unable to copy result:",
            error
        );
    }
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */


/* ===================== INPUT ===================== */

if (temperatureInput) {

    temperatureInput.addEventListener(
        "input",
        () => {

            updateConversion();


            /*
                Wait until the user stops
                typing before recording.
            */

            clearTimeout(
                historyTimer
            );


            historyTimer =
                setTimeout(
                    recordConversion,
                    1200
                );
        }
    );
}


/* ===================== FROM UNIT ===================== */

if (fromUnit) {

    fromUnit.addEventListener(
        "change",
        () => {

            updateConversion();

            recordConversion();
        }
    );
}


/* ===================== TO UNIT ===================== */

if (toUnit) {

    toUnit.addEventListener(
        "change",
        () => {

            updateConversion();

            recordConversion();
        }
    );
}


/* ===================== PRECISION ===================== */

if (precisionSelect) {

    precisionSelect.addEventListener(
        "change",
        () => {

            updateConversion();
        }
    );
}


/* ===================== SWAP ===================== */

if (swapButton) {

    swapButton.addEventListener(
        "click",
        swapUnits
    );
}


if (largeSwap) {

    largeSwap.addEventListener(
        "click",
        swapUnits
    );
}


/* ===================== COPY ===================== */

if (copyResult) {

    copyResult.addEventListener(
        "click",
        copyConversionResult
    );
}


/* ===================== CLEAR HISTORY ===================== */

if (clearHistoryButton) {

    clearHistoryButton.addEventListener(
        "click",
        clearHistory
    );
}


/* =========================================================
   INITIALIZE APPLICATION
   ========================================================= */

renderHistory();


if (temperatureInput) {

    temperatureInput.value =
        "32";
}


updateConversion();
/* =========================================================
   THEME SYSTEM
   ========================================================= */

const themeToggle =
    document.getElementById("themeToggle");

const themeIcon =
    document.getElementById("themeIcon");

const THEME_STORAGE_KEY =
    "thermosense_theme";


/* ===================== APPLY THEME ===================== */

function applyTheme(theme) {

    document.documentElement.setAttribute(
        "data-theme",
        theme
    );


    if (themeIcon) {

        themeIcon.textContent =
            theme === "light"
                ? "☀️"
                : "🌙";
    }


    if (themeToggle) {

        themeToggle.setAttribute(
            "aria-label",
            theme === "light"
                ? "Switch to dark mode"
                : "Switch to light mode"
        );
    }
}


/* ===================== LOAD THEME ===================== */

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            THEME_STORAGE_KEY
        );


    if (
        savedTheme === "light" ||
        savedTheme === "dark"
    ) {

        return savedTheme;
    }


    /*
        Follow the user's operating
        system preference if no
        theme has been saved.
    */

    if (
        window.matchMedia &&
        window.matchMedia(
            "(prefers-color-scheme: light)"
        ).matches
    ) {

        return "light";
    }


    return "dark";
}


/* ===================== TOGGLE THEME ===================== */

function toggleTheme() {

    const currentTheme =
        document.documentElement.getAttribute(
            "data-theme"
        ) || "dark";


    const nextTheme =
        currentTheme === "dark"
            ? "light"
            : "dark";


    applyTheme(
        nextTheme
    );


    localStorage.setItem(
        THEME_STORAGE_KEY,
        nextTheme
    );
}


/* ===================== THEME EVENT ===================== */

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        toggleTheme
    );
}


/* ===================== INITIAL THEME ===================== */

applyTheme(
    loadTheme()
);
/* =========================================================
   SIDEBAR NAVIGATION
   ========================================================= */

const navItems =
    document.querySelectorAll(
        ".navigation .nav-item"
    );


const navigationTargets = [
    ".main-content",
    ".converter-card",
    ".scale-card",
    ".history-card",
    ".references-card"
];


navItems.forEach(
    (navItem, index) => {

        navItem.addEventListener(
            "click",
            () => {

                navItems.forEach(
                    (item) => {
                        item.classList.remove(
                            "active"
                        );
                    }
                );


                navItem.classList.add(
                    "active"
                );


                const targetSelector =
                    navigationTargets[index];


                const target =
                    document.querySelector(
                        targetSelector
                    );


                if (!target) {
                    return;
                }


                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        );
    }
);


/* =========================================================
   SIDEBAR BOTTOM BUTTONS
   ========================================================= */

const sidebarBottomItems =
    document.querySelectorAll(
        ".sidebar-bottom .nav-item"
    );


/*
   SETTINGS BUTTON
*/

if (sidebarBottomItems[0]) {

    sidebarBottomItems[0].addEventListener(
        "click",
        () => {

            const precision =
                document.getElementById(
                    "precision"
                );


            if (precision) {

                precision.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });


                precision.focus();
            }
        }
    );
}


/*
   APPEARANCE BUTTON
*/

if (sidebarBottomItems[1]) {

    sidebarBottomItems[1].addEventListener(
        "click",
        () => {

            if (themeToggle) {

                themeToggle.click();
            }
        }
    );
}