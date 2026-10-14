async function loadLeads() {
  try {
    const role = localStorage.getItem("role");
    const user = localStorage.getItem("user");

    // Safety check
    if (!role || !user) {
      alert("Please login first");
      window.location.href = "login.html";
      return;
    }

    const res = await fetch(
      `/leads?role=${role}&user=${user}`
    );

    const data = await res.json();
    renderCharts(data);
    console.log("DATA:", data);

    const table = document.getElementById("tableBody");
    table.innerHTML = "";

    let total = 0, newCount = 0, contacted = 0;

    if (!data || data.length <= 1) {
      table.innerHTML = "<tr><td colspan='8'>No leads found</td></tr>";
      return;
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      total++;

      if (row[6] === "Contacted") contacted++;
      else if (row[6] === "New") newCount++;

      const tr = document.createElement("tr");

      // Basic columns
      tr.innerHTML += `<td>${row[0]}</td>`;
      tr.innerHTML += `<td>${row[1]}</td>`;
      tr.innerHTML += `<td>${row[2]}</td>`;
      tr.innerHTML += `<td>${row[4]}</td>`;
      tr.innerHTML += `<td>${row[5]}</td>`;

      // ===== STATUS DROPDOWN =====
      const statusTd = document.createElement("td");
      const statusSelect = document.createElement("select");

      function applyColor(value) {
        statusSelect.className = "";

        if (value === "New") statusSelect.classList.add("status-new");
        else if (value === "Contacted") statusSelect.classList.add("status-contacted");
        else if (value === "Closed") statusSelect.classList.add("status-closed");
      }

      ["New", "Contacted", "Closed"].forEach(option => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.text = option;
        if (option === row[6]) opt.selected = true;
        statusSelect.appendChild(opt);
      });

      applyColor(row[6]);

      statusSelect.addEventListener("change", async () => {
        applyColor(statusSelect.value);

        try {
          await fetch("/update-status", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              rowIndex: i + 1,
              status: statusSelect.value
            })
          });
        } catch (err) {
          console.error(err);
          alert("❌ Failed to update status");
        }
      });

      statusTd.appendChild(statusSelect);
      tr.appendChild(statusTd);

      // ===== ASSIGN COLUMN =====
      const assignTd = document.createElement("td");

      if (role === "owner") {
        const assignSelect = document.createElement("select");

        ["emp1", "emp2"].forEach(emp => {
          const opt = document.createElement("option");
          opt.value = emp;
          opt.text = emp;
          if (emp === row[7]) opt.selected = true;
          assignSelect.appendChild(opt);
        });

        assignSelect.addEventListener("change", async () => {
          try {
            await fetch("/assign-lead", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                rowIndex: i + 1,
                assignedTo: assignSelect.value
              })
            });
          } catch (err) {
            console.error(err);
            alert("❌ Assignment failed");
          }
        });

        assignTd.appendChild(assignSelect);

      } else {
        assignTd.textContent = row[7] || "-";
      }

      tr.appendChild(assignTd);

      tr.style.animationDelay = `${i * 0.05}s`;
table.appendChild(tr);
    }

    // ===== STATS =====
    document.getElementById("totalLeads").innerText = total;
    document.getElementById("newLeads").innerText = newCount;
    document.getElementById("contactedLeads").innerText = contacted;

  } catch (error) {
    console.error("ERROR:", error);
  }
}

// Load on page start
window.onload = loadLeads;


// ===== SEARCH =====
const searchInput = document.getElementById("search");

if (searchInput) {
  searchInput.addEventListener("input", function () {
    const value = this.value.toLowerCase();
    const rows = document.querySelectorAll("#tableBody tr");

    rows.forEach(row => {
      row.style.display = row.innerText.toLowerCase().includes(value)
        ? ""
        : "none";
    });
  });
}

function renderCharts(data) {
  let statusCount = { New: 0, Contacted: 0, Closed: 0 };
  let sourceCount = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Status
    const status = row[6];
    if (statusCount[status] !== undefined) {
      statusCount[status]++;
    }

    // Source
    const source = row[4];
    sourceCount[source] = (sourceCount[source] || 0) + 1;
  }

  // 🔹 Status Chart (Bar)
  new Chart(document.getElementById("statusChart"), {
    type: "bar",
    data: {
      labels: ["New", "Contacted", "Closed"],
      datasets: [{
        label: "Leads",
        data: [
          statusCount.New,
          statusCount.Contacted,
          statusCount.Closed
        ]
      }]
    }
  });

  // 🔹 Source Chart (Pie)
  new Chart(document.getElementById("sourceChart"), {
    type: "pie",
    data: {
      labels: Object.keys(sourceCount),
      datasets: [{
        data: Object.values(sourceCount)
      }]
    }
  });
}