import os

# Function to generate content for each sandbox
def generate_content(cf_pages_workflow_base_url, cypress_workflow_base_url, repo_name, pr_number, sandbox_names):
    sandbox_data = []
    # Customize the table columns below as needed
    for sandbox in sandbox_names:
        sandbox_data.append({
            'sandbox': sandbox,
            'address': '-',
            'last_deployment': '-',
            'last_cypress_run': '-',
            'cloudflare_link': f'{cf_pages_workflow_base_url}/?repositoryName={repo_name}&pullRequestNo={pr_number}&sandbox={sandbox.replace(" ", "-").lower()}',
            'cypress_link': f'{cypress_workflow_base_url}/?repositoryName={repo_name}&pullRequestNo={pr_number}&sandbox={sandbox.replace(" ", "-").lower()}'
        })
    return sandbox_data

# Function to generate HTML table rows
def generate_table(sandbox_data):
    table_rows = ""
    for idx, sandbox in enumerate(sandbox_data, start=1):
        row = (
            f"<tr>"
            f"<td>{idx}</td>"
            f"<td>{sandbox['sandbox']}</td>"
            f"<td id=\"address-{sandbox['sandbox'].replace(' ', '-').lower()}\">{sandbox['address']}</td>"
            f"<td id=\"last-deployment-{sandbox['sandbox'].replace(' ', '-').lower()}\">{sandbox['last_deployment']}</td>"
            f"<td id=\"last-cypress-run-{sandbox['sandbox'].replace(' ', '-').lower()}\">{sandbox['last_cypress_run']}</td>"
            f"<td><a href=\"{sandbox['cloudflare_link']}\">Deploy</a></td>"
            f"<td><a href=\"{sandbox['cypress_link']}\">Run</a></td>"
            f"</tr>"
        )
        table_rows += row
    return table_rows

# Function to generate developer notes list
def generate_notes(dev_notes):
    notes_list = ""
    for note in dev_notes:
        notes_list += f"<li>{note}</li>"
    return notes_list

# Function to generate the complete HTML content
def generate_html(sandbox_table, dev_notes_list):
    html_content = (
        f"<div align=\"center\">"
        f"<h1>Actions Shortcuts</h1>"
        f"<table>"
        f"<tr><th>ID</th><th>Sandbox</th><th>Address</th><th>Last Deployment</th><th>Last Cypress Run</th><th>Cloudflare</th><th>Cypress</th></tr>"
        f"{sandbox_table}"
        f"</table></br>"
        f"<div align=\"left\">"
        f"<details><summary>DEV Notes</summary><ul>{dev_notes_list}</ul></details>"
        f"</div>"
        f"</div>"
    )
    return html_content

def main():
    # Customize your list of sandbox names
    sandbox_names = [
        'My Sandbox 1', 'My Sandbox 2', 'My Sandbox 3', 'My Sandbox N'
    ]

    # Generate sandbox data based on environment variables and sandbox names
    sandbox_data = generate_content(
        os.environ.get("CF_PAGES_WORKFLOW_BASE_URL"), os.environ.get("CYPRESS_WORKFLOW_BASE_URL"), 
        os.environ.get("REPO_NAME").replace("expressable/", ""), os.environ.get("PR_NUMBER"), sandbox_names
    )

    # Customize developer notes
    dev_notes = [
        "(Example) Please note that FE instances will only be accessible after the completion of their respective "
        "workflow executions, which may take up to 6 minutes. Attempting to access an instance before this time may "
        "result in an error code 522, indicating a connection timeout.",
        "(Example) Once the workflow execution is finished, Cypress test results will be shared in this Pull Request. Kindly "
        "be aware that the test execution process may take up to 35 minutes to complete.",
    ]

    # Generate HTML table and developer notes
    table = generate_table(sandbox_data)
    notes = generate_notes(dev_notes)
    html_content = generate_html(table, notes)

    # Write HTML content to a file
    with open('shortcuts-body.html', 'w') as html_file:
        html_file.write(html_content)

if __name__ == "__main__":
    main()
