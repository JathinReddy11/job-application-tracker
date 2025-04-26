const API_URL = "http://127.0.0.1:8000";

let chartInstance = null;
let currentChartType = 'pie'; // Default chart type

document.getElementById('jobForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const company = document.getElementById('company').value;
    const position = document.getElementById('position').value;
    const application_date = document.getElementById('application_date').value;
    const status = document.getElementById('status').value;
    const notes = document.getElementById('notes').value;

    const response = await fetch(`${API_URL}/jobs/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, position, application_date, status, notes })
    });

    if (response.ok) {
        alert("Job added!");
        loadJobs();  // Reload jobs
        document.getElementById('jobForm').reset();
    }
});

async function loadJobs() {
    const response = await fetch(`${API_URL}/jobs/`);
    const jobs = await response.json();

    console.log("Fetched jobs:", jobs);

    const tableBody = document.getElementById('jobsTableBody');
    tableBody.innerHTML = '';

    const filteredJobs = applyFilters(jobs);

    renderSummary(filteredJobs);
    renderChart(filteredJobs);

    filteredJobs.forEach(job => {
        const row = document.createElement('tr');
        row.setAttribute('id', `row-${job.id}`);
        row.innerHTML = `
    <td>${job.id}</td>
    <td>${job.company}</td>
    <td>${job.position}</td>
    <td>${formatDateAgo(job.application_date)}</td>
    <td>${getStatusBadge(job.status)}</td>
    <td>${job.notes || '-'}</td>
    <td>
  ${job.resume_filename
                ? `
        <div class="flex items-center gap-2">
          <a href="http://127.0.0.1:8000/${job.resume_filename}" target="_blank" class="text-blue-500 underline">View Resume</a>
          <button onclick="deleteResume(${job.id})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
        </div>
      `
                : `
        <div class="flex items-center gap-2">
          <input type="file" id="resume-${job.id}" accept="application/pdf" class="border rounded p-1">
          <button onclick="uploadResume(${job.id})" class="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600">Upload</button>
        </div>
      `
            }
</td>


<td>
  <div class="flex flex-wrap gap-2 justify-center">
    <button onclick="editJob(${job.id})" class="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500">Edit</button>
    <button onclick="deleteJob(${job.id})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
  </div>
</td>

`;
        tableBody.appendChild(row);
    });
}

async function deleteJob(id) {
    const confirmDelete = confirm("Are you sure you want to delete this job?");
    if (!confirmDelete) return;

    const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        alert("Job deleted!");
        loadJobs();
    }
}

function getStatusBadge(status) {
    const base = "px-2 py-1 rounded text-white text-sm font-medium";

    switch (status.toLowerCase()) {
        case "applied":
            return `<span class="${base} bg-yellow-500">Applied</span>`;
        case "interview":
            return `<span class="${base} bg-blue-500">Interview</span>`;
        case "offer":
            return `<span class="${base} bg-green-600">Offer</span>`;
        case "rejected":
            return `<span class="${base} bg-red-500">Rejected</span>`;
        default:
            return `<span class="${base} bg-gray-500">${status}</span>`;
    }
}

function formatDateAgo(dateString) {
    if (!dateString) return "-";

    const applicationDate = new Date(dateString);
    const today = new Date();

    // Calculate difference in milliseconds
    const diffTime = today - applicationDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Convert ms to days

    if (diffDays === 0) {
        return "Today";
    } else if (diffDays === 1) {
        return "1 day ago";
    } else {
        return `${diffDays} days ago`;
    }
}

// Load jobs when page loads
loadJobs();

function applyFilters(jobs) {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const selectedStatus = document.getElementById("statusFilter").value.toLowerCase();

    return jobs.filter(job => {
        const matchText =
            job.company.toLowerCase().includes(searchTerm) ||
            job.position.toLowerCase().includes(searchTerm);
        const matchStatus =
            selectedStatus === "" || job.status.toLowerCase() === selectedStatus;

        return matchText && matchStatus;
    });
}

function renderSummary(jobs) {
    const summaryDiv = document.getElementById("summary");
    const total = jobs.length;
    const applied = jobs.filter(job => job.status.toLowerCase() === "applied").length;
    const interview = jobs.filter(job => job.status.toLowerCase() === "interview").length;
    const offer = jobs.filter(job => job.status.toLowerCase() === "offer").length;
    const rejected = jobs.filter(job => job.status.toLowerCase() === "rejected").length;

    summaryDiv.innerHTML = `
        <div class="bg-gray-100 p-4 rounded shadow text-center">
            <h3 class="text-xl font-bold">${total}</h3>
            <p class="text-sm text-gray-600">Total</p>
        </div>
        <div class="bg-yellow-100 p-4 rounded shadow text-center">
            <h3 class="text-xl font-bold text-yellow-700">${applied}</h3>
            <p class="text-sm text-yellow-700">Applied</p>
        </div>
        <div class="bg-blue-100 p-4 rounded shadow text-center">
            <h3 class="text-xl font-bold text-blue-700">${interview}</h3>
            <p class="text-sm text-blue-700">Interview</p>
        </div>
        <div class="bg-green-100 p-4 rounded shadow text-center">
            <h3 class="text-xl font-bold text-green-700">${offer}</h3>
            <p class="text-sm text-green-700">Offer</p>
        </div>
        <div class="bg-red-100 p-4 rounded shadow text-center">
            <h3 class="text-xl font-bold text-red-700">${rejected}</h3>
            <p class="text-sm text-red-700">Rejected</p>
        </div>
    `;
}

function renderChart(jobs) {
    const counts = {
        Applied: 0,
        Interview: 0,
        Offer: 0,
        Rejected: 0,
    };

    jobs.forEach(job => {
        const status = job.status.toLowerCase();
        if (status === "applied") counts.Applied++;
        else if (status === "interview") counts.Interview++;
        else if (status === "offer") counts.Offer++;
        else if (status === "rejected") counts.Rejected++;
    });

    const canvas = document.getElementById('statusChart');
    canvas.width = 240;
    canvas.height = 240;

    const ctx = canvas.getContext('2d');

    if (chartInstance) chartInstance.destroy(); // clear previous chart

    chartInstance = new Chart(ctx, {
        type: currentChartType,
        data: {
            labels: ['Applied', 'Interview', 'Offer', 'Rejected'],
            datasets: [{
                label: 'Job Status Breakdown',
                data: [
                    counts.Applied,
                    counts.Interview,
                    counts.Offer,
                    counts.Rejected
                ],
                backgroundColor: [
                    'rgb(251, 191, 36)',
                    'rgb(96, 165, 250)',
                    'rgb(34, 197, 94)',
                    'rgb(239, 68, 68)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Job Application Status'
                }
            },
            scales: currentChartType === 'bar' ? {
                y: {
                    beginAtZero: true
                }
            } : {}
        }
    });
}

// ✅ Independent Functions (not inside renderChart!)

function exportCSV(jobs) {
    const csvRows = [];

    csvRows.push(["ID", "Company", "Position", "Application Date", "Status", "Notes"]);

    jobs.forEach(job => {
        csvRows.push([
            job.id,
            job.company,
            job.position,
            job.application_date || "",
            job.status,
            job.notes || ""
        ]);
    });

    const csvString = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'job_applications.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ✅ Attach Event Listeners

document.getElementById("searchInput").addEventListener("input", loadJobs);
document.getElementById("statusFilter").addEventListener("change", loadJobs);

document.getElementById('exportCsvBtn').addEventListener('click', async () => {
    const response = await fetch(`${API_URL}/jobs/`);
    const jobs = await response.json();
    const filteredJobs = applyFilters(jobs);

    exportCSV(filteredJobs);
});

document.getElementById('toggleChartBtn').addEventListener('click', async () => {
    const response = await fetch(`${API_URL}/jobs/`);
    const jobs = await response.json();
    const filteredJobs = applyFilters(jobs);

    if (currentChartType === 'pie') {
        currentChartType = 'bar';
        document.getElementById('toggleChartBtn').innerText = "🔄 Switch to Pie Chart";
    } else {
        currentChartType = 'pie';
        document.getElementById('toggleChartBtn').innerText = "🔄 Switch to Bar Chart";
    }

    renderChart(filteredJobs);
});

async function uploadResume(jobId) {
    const fileInput = document.getElementById(`resume-${jobId}`);
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file first.");
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload_resume/${jobId}`, {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        alert("Resume uploaded successfully!");
        loadJobs(); // reload jobs if you want to show resume link later
    } else {
        alert("Error uploading resume.");
    }
}

async function updateResume(jobId) {
    const fileInput = document.getElementById(`resume-${jobId}`);
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file first.");
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload_resume/${jobId}`, {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        alert("Resume updated successfully!");
        loadJobs();
    } else {
        alert("Error updating resume.");
    }
}

async function deleteResume(jobId) {
    const confirmDelete = confirm("Are you sure you want to delete this resume?");
    if (!confirmDelete) return;

    const response = await fetch(`${API_URL}/delete_resume/${jobId}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        alert("Resume deleted successfully!");
        loadJobs();
    } else {
        alert("Error deleting resume.");
    }
}

async function editJob(jobId) {
    const row = document.getElementById(`row-${jobId}`);
    const cells = row.querySelectorAll("td");

    // Extract existing values
    const company = cells[1].innerText;
    const position = cells[2].innerText;
    const date = cells[3].innerText;  // Use input type="date"
    const status = cells[4].innerText;
    const notes = cells[5].innerText;

    // Replace the text with input fields
    cells[1].innerHTML = `<input type="text" value="${company}" id="edit-company-${jobId}" class="border p-1 rounded">`;
    cells[2].innerHTML = `<input type="text" value="${position}" id="edit-position-${jobId}" class="border p-1 rounded">`;
    cells[3].innerHTML = `<input type="date" id="edit-date-${jobId}" class="border p-1 rounded">`;
    cells[4].innerHTML = `
        <select id="edit-status-${jobId}" class="border p-1 rounded">
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
        </select>
    `;
    cells[5].innerHTML = `<input type="text" value="${notes}" id="edit-notes-${jobId}" class="border p-1 rounded">`;

    // Set date value separately because format is different
    const today = new Date();
    const oldDate = new Date(today);
    oldDate.setDate(today.getDate() - parseInt(date)); // Rough estimate if you only have "x days ago"
    document.getElementById(`edit-date-${jobId}`).valueAsDate = oldDate;

    // Replace Edit/Delete buttons with Save/Cancel
    cells[7].innerHTML = `
    <div class="flex gap-2 justify-center">
        <button onclick="saveJob(${jobId})" class="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Save</button>
        <button onclick="loadJobs()" class="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500">Cancel</button>
    </div>
`;
}

async function saveJob(jobId) {
    const company = document.getElementById(`edit-company-${jobId}`).value;
    const position = document.getElementById(`edit-position-${jobId}`).value;
    const application_date = document.getElementById(`edit-date-${jobId}`).value;
    const status = document.getElementById(`edit-status-${jobId}`).value;
    const notes = document.getElementById(`edit-notes-${jobId}`).value;

    const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, position, application_date, status, notes })
    });

    if (response.ok) {
        alert("Job updated successfully!");
        loadJobs();
    } else {
        alert("Error updating job.");
    }
}
