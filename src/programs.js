const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const arrowIcon = `
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M4 10h11M11 5l5 5-5 5"></path>
  </svg>
`;

function field(label, attributes) {
  return `
    <label class="field">
      <span>${label}</span>
      <input ${attributes} />
    </label>
  `;
}

function showError(element, message) {
  element.textContent = message;
  element.hidden = !message;
}

export function calculatePayroll(days, rate, deduction) {
  const gross = days * rate;
  return { gross, net: gross - deduction };
}

export function mountPayrollProgram(container) {
  container.innerHTML = `
    <div class="program">
      <form id="payroll-add-form">
        <div class="form-grid form-grid--four">
          ${field("Employee name", 'name="name" placeholder="e.g. Maria Santos"')}
          ${field("Days worked", 'name="days" type="number" min="0.5" step="0.5" placeholder="20"')}
          ${field("Daily rate", 'name="rate" type="number" min="0" step="0.01" placeholder="750.00"')}
          ${field("Deduction", 'name="deduction" type="number" min="0" step="0.01" placeholder="500.00"')}
        </div>
        <button class="primary-button" type="submit">Add employee ${arrowIcon}</button>
      </form>

      <p class="form-error" id="payroll-error" hidden></p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Employee</th>
              <th>Days</th>
              <th>Daily rate</th>
              <th>Gross pay</th>
              <th>Deduction</th>
              <th>Net pay</th>
            </tr>
          </thead>
          <tbody id="payroll-rows"></tbody>
        </table>
      </div>

      <form class="delete-row" id="payroll-delete-form">
        ${field("Remove by line number", 'name="line" type="number" min="1" placeholder="No."')}
        <button class="secondary-button" type="submit">Remove record</button>
      </form>
    </div>
  `;

  const entries = [];
  let nextId = 1;
  const addForm = container.querySelector("#payroll-add-form");
  const deleteForm = container.querySelector("#payroll-delete-form");
  const rows = container.querySelector("#payroll-rows");
  const error = container.querySelector("#payroll-error");

  function renderRows() {
    rows.replaceChildren();

    if (entries.length === 0) {
      const row = rows.insertRow();
      const cell = row.insertCell();
      cell.colSpan = 7;
      cell.className = "empty-cell";
      cell.textContent = "No payroll records yet. Add your first employee above.";
      return;
    }

    entries.forEach((entry, index) => {
      const { gross, net } = calculatePayroll(entry.days, entry.rate, entry.deduction);
      const row = rows.insertRow();
      const values = [
        index + 1,
        entry.name,
        entry.days,
        peso.format(entry.rate),
        peso.format(gross),
        peso.format(entry.deduction),
        peso.format(net),
      ];

      values.forEach((value, cellIndex) => {
        const cell = row.insertCell();
        cell.textContent = value;
        if (cellIndex === 1) cell.className = "employee-name";
        if (cellIndex === 6) cell.className = "net-pay";
      });
    });
  }

  addForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(addForm);
    const name = data.get("name").trim();
    const daysInput = data.get("days");
    const rateInput = data.get("rate");
    const deductionInput = data.get("deduction");
    const days = Number(daysInput);
    const rate = Number(rateInput);
    const deduction = Number(deductionInput);

    if (!name || !daysInput || !rateInput || !deductionInput) {
      showError(error, "Complete all employee fields before adding a record.");
      return;
    }
    if (days <= 0 || rate < 0 || deduction < 0) {
      showError(error, "Days must be above zero; monetary values cannot be negative.");
      return;
    }

    entries.push({ id: nextId++, name, days, rate, deduction });
    addForm.reset();
    showError(error, "");
    renderRows();
  });

  deleteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const lineInput = new FormData(deleteForm).get("line");
    const line = Number(lineInput);

    if (!Number.isInteger(line) || line < 1 || line > entries.length) {
      showError(error, "Enter a line number currently shown in the table.");
      return;
    }

    entries.splice(line - 1, 1);
    deleteForm.reset();
    showError(error, "");
    renderRows();
  });

  renderRows();
}

export function calculateNumberLab(value) {
  let factorial = 1n;
  let factor = 1;
  while (factor <= value) {
    factorial *= BigInt(factor);
    factor++;
  }

  let sum = 0;
  let addend = 1;
  do {
    sum += addend;
    addend++;
  } while (addend <= value);

  let averageTotal = 0;
  for (let number = 1; number <= value; number++) {
    averageTotal += number;
  }

  return {
    factorial: factorial.toString(),
    sum,
    average: averageTotal / value,
  };
}

export function mountNumberProgram(container) {
  container.innerHTML = `
    <div class="program">
      <form class="inline-form" id="number-form">
        ${field("Integer value (n)", 'name="number" type="number" min="1" max="500" step="1" placeholder="Enter 1–500"')}
        <button class="primary-button" type="submit">Run calculations ${arrowIcon}</button>
      </form>
      <p class="form-error" id="number-error" hidden></p>
      <div class="result-grid">
        <article class="result-card result-card--wide">
          <span>While loop</span>
          <strong>Nth factorial</strong>
          <output id="factorial-result">—</output>
        </article>
        <article class="result-card">
          <span>Do-while loop</span>
          <strong>Sum of first n numbers</strong>
          <output id="sum-result">—</output>
        </article>
        <article class="result-card">
          <span>For loop</span>
          <strong>Average of first n numbers</strong>
          <output id="average-result">—</output>
        </article>
      </div>
    </div>
  `;

  const form = container.querySelector("#number-form");
  const error = container.querySelector("#number-error");
  const factorialOutput = container.querySelector("#factorial-result");
  const sumOutput = container.querySelector("#sum-result");
  const averageOutput = container.querySelector("#average-result");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = Number(new FormData(form).get("number"));

    if (!Number.isInteger(value) || value < 1 || value > 500) {
      showError(error, "Enter a whole number from 1 to 500.");
      factorialOutput.textContent = "—";
      sumOutput.textContent = "—";
      averageOutput.textContent = "—";
      return;
    }

    const results = calculateNumberLab(value);
    factorialOutput.textContent = results.factorial;
    sumOutput.textContent = results.sum.toLocaleString();
    averageOutput.textContent = results.average.toLocaleString();
    showError(error, "");
  });
}

export function calculateTax(income) {
  if (income <= 250000) return { tax: 0, bracket: "₱0 – ₱250,000", rate: "0%" };
  if (income <= 400000) {
    return {
      tax: (income - 250000) * 0.2,
      bracket: "Over ₱250,000 – ₱400,000",
      rate: "20%",
    };
  }
  if (income <= 800000) {
    return {
      tax: 30000 + (income - 400000) * 0.25,
      bracket: "Over ₱400,000 – ₱800,000",
      rate: "₱30,000 + 25%",
    };
  }
  if (income <= 2000000) {
    return {
      tax: 130000 + (income - 800000) * 0.3,
      bracket: "Over ₱800,000 – ₱2,000,000",
      rate: "₱130,000 + 30%",
    };
  }
  if (income <= 8000000) {
    return {
      tax: 490000 + (income - 2000000) * 0.32,
      bracket: "Over ₱2,000,000 – ₱8,000,000",
      rate: "₱490,000 + 32%",
    };
  }
  return {
    tax: 2410000 + (income - 8000000) * 0.35,
    bracket: "Over ₱8,000,000",
    rate: "₱2,410,000 + 35%",
  };
}

export function mountTaxProgram(container) {
  container.innerHTML = `
    <div class="program tax-layout">
      <div>
        ${field("Annual net taxable income", 'id="tax-income" type="number" min="0" step="0.01" placeholder="Enter amount in PHP"')}
        <div class="bracket-list">
          <span>Bracket</span>
          <strong id="tax-bracket">Waiting for an income amount</strong>
          <span>Applied formula</span>
          <strong id="tax-rate">—</strong>
        </div>
      </div>
      <div class="tax-result">
        <span>Estimated income tax</span>
        <output id="tax-result">₱—</output>
      </div>
    </div>
  `;

  const input = container.querySelector("#tax-income");
  const bracket = container.querySelector("#tax-bracket");
  const rate = container.querySelector("#tax-rate");
  const output = container.querySelector("#tax-result");

  input.addEventListener("input", () => {
    const income = Number(input.value);
    const result = input.value !== "" && income >= 0 ? calculateTax(income) : null;
    bracket.textContent = result ? result.bracket : "Waiting for an income amount";
    rate.textContent = result ? result.rate : "—";
    output.textContent = result ? peso.format(result.tax) : "₱—";
  });
}

const conversionOptions = {
  fToC: { label: "Fahrenheit to Celsius", from: "°F", to: "°C" },
  cToF: { label: "Celsius to Fahrenheit", from: "°C", to: "°F" },
  mToFt: { label: "Meters to Feet", from: "m", to: "ft" },
  ftToM: { label: "Feet to Meters", from: "ft", to: "m" },
};

export function convert(value, type) {
  if (type === "fToC") return (value - 32) * (5 / 9);
  if (type === "cToF") return value * (9 / 5) + 32;
  if (type === "mToFt") return value * 3.28084;
  return value / 3.28084;
}

export function mountConverterProgram(container) {
  const buttons = Object.entries(conversionOptions)
    .map(
      ([type, option], index) => `
        <button type="button" data-conversion="${type}" class="${index === 0 ? "active" : ""}">
          <span>${option.from}</span>
          ${option.label}
        </button>
      `,
    )
    .join("");

  container.innerHTML = `
    <div class="program converter-layout">
      <div class="conversion-types" role="group" aria-label="Conversion type">${buttons}</div>
      <div class="conversion-workspace">
        <p class="conversion-title" id="conversion-title">Fahrenheit to Celsius</p>
        <div class="conversion-fields">
          <label class="conversion-field">
            <span>From</span>
            <div>
              <input id="conversion-input" type="number" placeholder="0" />
              <b id="conversion-from">°F</b>
            </div>
          </label>
          ${arrowIcon}
          <label class="conversion-field">
            <span>Result</span>
            <div>
              <output id="conversion-result">—</output>
              <b id="conversion-to">°C</b>
            </div>
          </label>
        </div>
      </div>
    </div>
  `;

  let activeType = "fToC";
  const input = container.querySelector("#conversion-input");
  const output = container.querySelector("#conversion-result");
  const title = container.querySelector("#conversion-title");
  const from = container.querySelector("#conversion-from");
  const to = container.querySelector("#conversion-to");
  const typeButtons = container.querySelectorAll("[data-conversion]");

  function updateResult() {
    const converted = input.value === "" ? null : convert(Number(input.value), activeType);
    output.textContent = converted === null ? "—" : Number(converted.toFixed(4)).toLocaleString();
  }

  typeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeType = button.dataset.conversion;
      const details = conversionOptions[activeType];
      typeButtons.forEach((item) => item.classList.toggle("active", item === button));
      title.textContent = details.label;
      from.textContent = details.from;
      to.textContent = details.to;
      updateResult();
    });
  });

  input.addEventListener("input", updateResult);
}
