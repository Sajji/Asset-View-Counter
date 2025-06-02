(function () {
  const assetPathRegex = /\/asset\/([0-9a-fA-F\-]{36})/;

  // Set this path to where you put your credentials JSON
  const authFileUrl = "/resources/images/pageViewsAuth.json";
  let credentials = null;

  async function loadCredentials() {
    if (credentials) return credentials; // Cache after first load
    const resp = await fetch(authFileUrl, { credentials: "same-origin" });
    if (!resp.ok) throw new Error("Failed to load credentials JSON");
    credentials = await resp.json();
    return credentials;
  }

  function getBasicAuthHeader(username, password) {
    return "Basic " + btoa(`${username}:${password}`);
  }

  async function updateViewz(uuid) {
    try {
      const { username, password } = await loadCredentials();

      const attributesUrl = `${window.location.origin}/rest/2.0/attributes?assetId=${uuid}`;
      const getResp = await fetch(attributesUrl, {
        headers: {
          "Authorization": getBasicAuthHeader(username, password)
        },
        credentials: "include"
      });
      if (!getResp.ok) throw new Error(`Failed to fetch attributes: ${getResp.status}`);

      const data = await getResp.json();
      const viewzAttr = data.results.find(attr => attr.type?.name === "Page Views");

      if (!viewzAttr) {
        console.log("❌ No 'Viewz' attribute found for this asset. Attempting to create one...");

        const createResp = await fetch(`${window.location.origin}/rest/2.0/attributes/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": getBasicAuthHeader(username, password)
          },
          credentials: "include",
          body: JSON.stringify({
            assetId: uuid,
            typePublicId: "Viewz_C",
            value: 1
          })
        });

        if (!createResp.ok) {
          throw new Error(`❌ Failed to create 'Viewz' attribute: ${createResp.status}`);
        }

        console.log(`✅ 'Viewz' attribute created with value 1.`);
        return;
      }

      const currentValue = viewzAttr.value || 0;
      const newValue = currentValue + 1;
      const attrId = viewzAttr.id;
      const patchUrl = `${window.location.origin}/rest/2.0/attributes/${attrId}`;

      const patchResp = await fetch(patchUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": getBasicAuthHeader(username, password)
        },
        credentials: "include",
        body: JSON.stringify({ value: newValue })
      });

      if (!patchResp.ok) throw new Error(`Failed to patch Viewz: ${patchResp.status}`);
      console.log(`✅ 'Viewz' updated from ${currentValue} → ${newValue}`);
    } catch (error) {
      console.error("⚠️ Error updating Viewz:", error);
    }
  }

  function handleUrlChange() {
    const match = window.location.pathname.match(assetPathRegex);
    if (match && match[1]) {
      updateViewz(match[1]);
    }
  }

  // Hook into React Router behavior
  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    window.dispatchEvent(new Event('urlchange'));
  };

  window.addEventListener('popstate', handleUrlChange);
  window.addEventListener('urlchange', handleUrlChange);

  // Initial page load
  handleUrlChange();
})();
