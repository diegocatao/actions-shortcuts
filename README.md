<div align="center">
  
<h1>Actions Shortcut</h1>

| <img width="836" alt="image" src="https://github.com/diegocatao/actions-shortcut/assets/96078654/a13cb43a-3450-4973-bf81-a52fb82edeff"> |
|:--:| 
| *Pull Request comment that includes interactive actions shortcuts that enable users to effortlessly execute specific workflows.* |

</div>

<p>This repository provides a versatile Cloudflare Worker script and GitHub Actions workflows designed to streamline various automation tasks within GitHub repositories. The Cloudflare Worker script can trigger Cypress workflows and Cloudflare Pages deployments, <b>but its adaptability allows it to be used for a wide range of scenarios, which means: feel free to integrate per your needs.</b>

The primary objective of this integration is to eliminate the need for navigating to the GitHub Actions page, manually selecting the desired action, and subsequently triggering it. Instead, the repository's ingenious design facilitates a direct and swift triggering of actions.</p>

</br>

<div align="center">
  
<h2>Getting started</h2>

</div>

<h3>1. Cloudflare Worker</h3>

<h4>Overview</h4>
<p>The Cloudflare Worker script (worker.js) is designed to offer a comprehensive automation framework:</p>
<ul>
  <li>Authenticate with the GitHub API using a personal access token.</li>
  <li>Handle incoming requests, making it a versatile tool for different triggers.</li>
  <li>Validate requests based on parameters.</li>
  <li>Fetch pull request details, comments, and other relevant information.</li>
  <li>Update comments with dynamic content, such as Cloudflare Pages deployments and Cypress information</li>
</ul>

<h4>Setting up</h4>
<p><a href="https://github.com/diegocatao/actions-shortcut/blob/main/cloudflare/trigger-cypress-workflow-example.js">Script example</a></p>
<ol>
  <li>Deploy the Cloudflare Worker script:
    <ul>
    <li>Sign up for a Cloudflare account and create a new Worker.</li>
    <li>Copy the contents of worker.js into the Worker editor.</li>
    <li>Modify constants and functions to match your specific requirements.</li>
    </ul>
  </li>
  <li>Set up environment variables:
    <ul>
    <li>Make sure to set up your worker's variables (GHA_TOKEN, FOUND_STATUS_CODE, and others).</li>
    <li>In case you're building something different, feel free to customize these variables to tailor the Worker to your use case.</li>
    </ul>
  </li>
  <li>Deploy the Cloudflare Worker and note the provided URL.</li>
</ol>

</br>

<h3>2. GitHub Actions</h3>

<p>The primary function of the workflow is to create the initial comment when a pull request is first opened. This comment serves as a central hub for information related to the pull request, including Cloudflare Pages deployments and Cypress test run links.</p>

<p><a href="https://github.com/diegocatao/actions-shortcut/blob/main/workflows/pull-request-shortcuts.yml">Workflow example</a></p>
<p><a href="https://github.com/diegocatao/actions-shortcut/blob/main/workflows/pull-request-shortcuts.py">Workflow helper example</a></p>

<h4>Usage</h4>
<p>Adapt workflows to your needs:</p>
<ul>
  <li>Customize environment variables like CF_PAGES_WORKFLOW_BASE_URL and CYPRESS_WORKFLOW_BASE_URL.</li>
</ul>

<h4>Customization</h4>
<p>This automation framework's adaptability extends beyond the initial comment creation. The versatile architecture can be easily customized for various use cases. You can modify the provided scripts, adapt workflows, and configure environment variables to match your project's unique needs.</p>

<h3>Contributing</h3>
<p>Contributions are highly encouraged! Feel free to open issues for questions, suggestions, or bug reports. Pull requests that enhance or extend the capabilities of this automation framework are welcome.</p>

<h3>License</h3>
<p>This project is licensed under the MIT License.</p>
