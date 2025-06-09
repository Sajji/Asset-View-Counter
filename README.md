# Asset-View-Counter

Purpose: This is a simple page counter to keep track of asset page views. The code leverages the API to increment each asset's page views attribute. That attribute is an integer type and will increment on every page visit. I say "simple" because it will increment the counter even if you refresh the browser window. So it's not session or cookie based. Also note that we need to use a single authentication credential to prevent average view-only users from being counted as authors. I kept the javascript code in a separate file so as to minimize alterations of the index.html code. Instructions below:

1. Import the PageViews.cma file into your environment

2. Copy the pageViews.js and pageViewAuth.json files to the /collibra_data/dgc/images folder

3. Edit the pageViewAuth.json file appropriately.

4. Edit /collibra_data/dgc/static/banyan/index.html

5. Add the following script code right above the `</body>` tag at the bottom of the index.html:

`<script th:src="@{${'/resources/images/pageViews.js'}}" th:attr="nonce=${cspNonce}"></script>  `



*Use at your own risk, etc. etc. You may break stuff and that won't be my fault, etc., etc.

*Make sure you backup your environment and leverage your dev/test environments
