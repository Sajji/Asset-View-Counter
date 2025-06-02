# Asset-View-Counter

1. Import the counterDataSet.cma file into your environment

2. Copy the pageViews.js and pageViewAuth.json files to the /collibra_data/dgc/images folder

3. Edit the pageViewAuth.json file appropriately.

4. Edit /collibra_data/dgc/static/banyan/index.html

5. Add the following script code right above the `</body>` tag at the bottom of the index.html:

`<script th:src="@{${'/resources/images/pageViews.js'}}" th:attr="nonce=${cspNonce}"></script>  `



*Use at your own risk, etc. etc. You may break stuff and that won't be my fault, etc., etc.

*Make sure you backup your environment and leverage your dev/test environments
