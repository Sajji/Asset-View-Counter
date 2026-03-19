(function () {
  const assetPathRegex = /\/asset\/([0-9a-fA-F\-]{36})/;

  // Workflow name to look up — must match exactly
  const WORKFLOW_NAME = "Page View Update";

  // Session-scoped cache so we only look these up once per page load
  let cachedCsrfToken = null;
  let cachedWorkflowDefinitionId = null;

  async function getCsrfToken() {
    if (cachedCsrfToken) return cachedCsrfToken;
    const resp = await fetch(
      `${window.location.origin}/rest/2.0/auth/sessions/current?include=csrfToken`,
      { credentials: "include" }
    );
    if (!resp.ok) throw new Error(`Failed to fetch CSRF token: ${resp.status}`);
    const data = await resp.json();
    cachedCsrfToken = data.csrfToken;
    return cachedCsrfToken;
  }

  async function getWorkflowDefinitionId(csrfToken) {
    if (cachedWorkflowDefinitionId) return cachedWorkflowDefinitionId;
    const url = `${window.location.origin}/rest/2.0/workflowDefinitions?offset=0&limit=1&countLimit=-1`
      + `&name=${encodeURIComponent(WORKFLOW_NAME)}&sortOrder=ASC&sortField=NAME`;
    const resp = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "X-CSRF-TOKEN": csrfToken
      },
      credentials: "include"
    });
    if (!resp.ok) throw new Error(`Failed to fetch workflow definition: ${resp.status}`);
    const data = await resp.json();
    if (!data.results || data.results.length === 0) {
      throw new Error(`No workflow definition found with name: "${WORKFLOW_NAME}"`);
    }
    cachedWorkflowDefinitionId = data.results[0].id;
    return cachedWorkflowDefinitionId;
  }

  async function triggerPageViewWorkflow(uuid) {
    try {
      const csrfToken = await getCsrfToken();
      const workflowDefinitionId = await getWorkflowDefinitionId(csrfToken);

      const workflowUrl = `${window.location.origin}/rest/2.0/workflowInstances`;

      const payload = {
        workflowDefinitionId,
        businessItemIds: [uuid],
        businessItemType: "ASSET"
      };

      const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRF-TOKEN": csrfToken
      };

      // --- Debug: log everything before the request fires ---
      console.group("📊 Page View Workflow Request");
      console.log("Workflow Definition ID:", workflowDefinitionId);
      console.log("URL:    ", workflowUrl);
      console.log("Headers:", headers);
      console.log("Payload:", JSON.stringify(payload, null, 2));
      console.groupEnd();

      const resp = await fetch(workflowUrl, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload)
      });

      // --- Debug: log the response ---
      console.group("📊 Page View Workflow Response");
      console.log("Status:", resp.status, resp.statusText);
      const responseText = await resp.text();
      console.log("Body:  ", responseText);
      console.groupEnd();

      if (!resp.ok) throw new Error(`Workflow POST failed: ${resp.status} — ${responseText}`);
      console.log(`✅ Page view recorded for asset ${uuid}`);
    } catch (error) {
      console.error("⚠️ Error recording page view:", error);
    }
  }

  function handleUrlChange() {
    const match = window.location.pathname.match(assetPathRegex);
    if (match && match[1]) {
      triggerPageViewWorkflow(match[1]);
    }
  }

  // Hook into React Router behavior
  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    window.dispatchEvent(new Event("urlchange"));
  };

  window.addEventListener("popstate", handleUrlChange);
  window.addEventListener("urlchange", handleUrlChange);

  // Initial page load
  handleUrlChange();
})();