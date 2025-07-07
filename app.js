class GitLogParser {
  constructor() {
    this.textInputContent = document.getElementById("textInputContent");
    this.gitLogInput = document.getElementById("gitLogInput");
    this.processBtn = document.getElementById("processBtn");
    this.processing = document.getElementById("processing");
    this.results = document.getElementById("results");
    this.reportContent = document.getElementById("reportContent");
    this.copyBtn = document.getElementById("copyBtn");

    this.selectedFile = null;
    this.processedData = null;

    this.initEventListeners();
  }

  initEventListeners() {
    // Text input events
    this.gitLogInput.addEventListener("input", () =>
      this.updateProcessButton()
    );

    // Button events
    this.processBtn.addEventListener("click", () => this.processInput());
    this.copyBtn.addEventListener("click", () => this.copyReportToClipboard());

    // Initial state
    this.updateProcessButton();
  }

  updateProcessButton() {
    this.processBtn.disabled = !this.gitLogInput.value.trim();
  }

  async processInput() {
    this.showProcessing();

    try {
      let content;

      content = this.gitLogInput.value.trim();

      if (!content) {
        throw new Error("No content to process");
      }

      const parsedData = this.parseGitLog(content);

      if (Object.keys(parsedData).length === 0) {
        throw new Error(
          "No valid git log entries found. Please check the format."
        );
      }

      const formattedReport = this.formatReport(parsedData);

      this.processedData = formattedReport;
      this.displayResults(parsedData);
    } catch (error) {
      this.showError("Error processing input: " + error.message);
    } finally {
      this.hideProcessing();
    }
  }

  parseGitLog(content) {
    const lines = content.split("\n");
    const logsByDate = {};

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || !trimmedLine.includes(" | ")) continue;

      const [timestampStr, message] = trimmedLine.split(" | ", 2);

      try {
        const date = new Date(timestampStr);
        if (isNaN(date.getTime())) continue;

        const dateKey = date.toDateString();
        if (!logsByDate[dateKey]) {
          logsByDate[dateKey] = [];
        }

        logsByDate[dateKey].push({
          time: date,
          message: message,
        });
      } catch (error) {
        continue;
      }
    }

    // Sort entries by date and time
    for (const dateKey in logsByDate) {
      logsByDate[dateKey].sort((a, b) => a.time - b.time);
    }

    return logsByDate;
  }

  formatReport(logsByDate) {
    const outputLines = [];
    const sortedDates = Object.keys(logsByDate).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    for (const dateKey of sortedDates) {
      const entries = logsByDate[dateKey];
      const date = new Date(dateKey);

      const times = entries.map((entry) => entry.time);
      const startTime = times[0].toTimeString().substring(0, 5);
      const endTime = times[times.length - 1].toTimeString().substring(0, 5);

      const dateStr = date.toLocaleDateString("en-GB");

      outputLines.push(dateStr);
      outputLines.push(`${startTime} - ${endTime}`);

      for (const entry of entries) {
        outputLines.push(`- ${entry.message}`);
      }

      outputLines.push("");
    }

    return outputLines.join("\n");
  }

  displayResults(logsByDate) {
    const sortedDates = Object.keys(logsByDate).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    let html = "";

    for (const dateKey of sortedDates) {
      const entries = logsByDate[dateKey];
      const date = new Date(dateKey);

      const times = entries.map((entry) => entry.time);
      const startTime = times[0].toTimeString().substring(0, 5);
      const endTime = times[times.length - 1].toTimeString().substring(0, 5);

      const dateStr = date.toLocaleDateString("en-GB");

      html += `
                        <div class="date-entry">
                            <div class="date-header">${dateStr}</div>
                            <div class="time-range">${startTime} - ${endTime}</div>
                            <ul class="commit-list">
                    `;

      for (const entry of entries) {
        html += `<li class="commit-item">- ${entry.message}</li>`;
      }

      html += `
                            </ul>
                        </div>
                    `;
    }

    this.reportContent.innerHTML = html;
    this.results.style.display = "block";
  }

  copyReportToClipboard() {
    if (!this.processedData) return;

    navigator.clipboard
      .writeText(this.processedData)
      .then(() => {
        alert("✅ Report has been copied to clipboard!");
      })
      .catch((err) => {
        alert("❌ Failed to copy report to clipboard.");
        console.error(err); // Optional: for debugging
      });
  }

  showProcessing() {
    this.processing.style.display = "block";
    this.results.style.display = "none";
  }

  hideProcessing() {
    this.processing.style.display = "none";
  }

  showError(message) {
    this.reportContent.innerHTML = `<div class="error">${message}</div>`;
    this.results.style.display = "block";
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  new GitLogParser();
});
