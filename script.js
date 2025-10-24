let nR, nT, speeds = [], volumes = [];

// Step 2: Enter speeds
function getSpeeds() {
  nR = parseInt(document.getElementById("resources").value);
  nT = parseInt(document.getElementById("tasks").value);

  let html = "<h3>Enter Processing Speeds for Resources</h3>";
  for (let i = 0; i < nR; i++) {
    html += `Resource ${i+1}: <input type="number" id="speed-${i}" placeholder="Speed"><br>`;
  }
  html += `<button onclick="getVolumes()">Next: Enter Instruction Volumes</button>`;
  document.getElementById("step2").innerHTML = html;
}

// Step 3: Enter task volumes
function getVolumes() {
  speeds = [];
  for (let i = 0; i < nR; i++) {
    speeds.push(parseFloat(document.getElementById(`speed-${i}`).value));
  }

  let html = "<h3>Enter Instruction Volumes for Tasks</h3>";
  for (let j = 0; j < nT; j++) {
    html += `Task ${j+1}: <input type="number" id="vol-${j}" placeholder="Volume"><br>`;
  }
  html += `<button onclick="buildResourceTable()">Build Resource Allocation Table</button>`;
  document.getElementById("step3").innerHTML = html;
}

// Step 4: Build resource allocation table
function buildResourceTable() {
  volumes = [];
  for (let j = 0; j < nT; j++) {
    volumes.push(parseFloat(document.getElementById(`vol-${j}`).value));
  }

  let table = "<h3>Resource Allocation Table (Execution Times)</h3><table><tr><th>Task</th>";
  for (let i = 0; i < nR; i++) table += `<th>R${i+1}</th>`;
  table += "</tr>";

  let execTimes = Array.from({length: nR}, () => Array(nT).fill(0));
  for (let j = 0; j < nT; j++) {
    table += `<tr><td>T${j+1}</td>`;
    for (let i = 0; i < nR; i++) {
      execTimes[i][j] = volumes[j] / speeds[i];
      table += `<td>${execTimes[i][j].toFixed(2)}</td>`;
    }
    table += "</tr>";
  }
  table += "</table>";
  table += `<button onclick='runMaxMin(${JSON.stringify(execTimes)})'>Run Max-Min Scheduling</button>`;
  document.getElementById("resourceTable").innerHTML = table;
}

// Step 5: Run Max-Min Algorithm
function runMaxMin(execTimesJSON) {
  let execTimes = JSON.parse(JSON.stringify(execTimesJSON)).map(row => row.map(Number));

  let done = Array(nT).fill(false);
  let currentTime = 0;
  let result = [];

  for (let k = 0; k < nT; k++) {
    let min = Array(nT).fill(Infinity);
    let ptr = Array(nT).fill(-1);

    for (let j = 0; j < nT; j++) {
      if (done[j]) continue;
      for (let i = 0; i < nR; i++) {
        if (execTimes[i][j] < min[j]) {
          min[j] = execTimes[i][j];
          ptr[j] = i;
        }
      }
    }

    let p1 = -1, maxMin = -1;
    for (let j = 0; j < nT; j++) {
      if (!done[j] && min[j] > maxMin) {
        maxMin = min[j];
        p1 = j;
      }
    }
    if (p1 === -1) break;

    let burstTime = min[p1];
    currentTime += burstTime;

    result.push({
      id: p1+1,
      arrival: 0,
      burst: burstTime.toFixed(2),
      completed: currentTime.toFixed(2),
      tat: currentTime.toFixed(2),
      wt: (currentTime - burstTime).toFixed(2)
    });
    done[p1] = true;

    for (let j = 0; j < nT; j++) {
      if (!done[j]) execTimes[ptr[p1]][j] += burstTime;
    }
  }

  let tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = "";
  let totalTAT = 0, totalWT = 0, maxCT = 0;
  for (let r of result) {
    tbody.innerHTML += `<tr>
      <td>${r.id}</td><td>${r.arrival}</td><td>${r.burst}</td>
      <td>${r.completed}</td><td>${r.wt}</td><td>${r.tat}</td>
    </tr>`;
    totalTAT += parseFloat(r.tat);
    totalWT += parseFloat(r.wt);
    if (parseFloat(r.completed) > maxCT) maxCT = parseFloat(r.completed);
  }
  document.getElementById("avgTAT").value = (totalTAT / nT).toFixed(2);
  document.getElementById("avgWT").value = (totalWT / nT).toFixed(2);
  document.getElementById("throughput").value = (nT / maxCT).toFixed(2);
  document.getElementById("makespan").value = maxCT.toFixed(2);
}