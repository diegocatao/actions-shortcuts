/*
  Please make sure to configure the following variables in your worker settings:

  REPO_OWNER: "myCompany"
  REDIRECT_STATUS_CODE: 301
  FOUND_STATUS_CODE: 302
  BAD_PARAMETERS_STATUS_CODE: 400
  FORBIDDEN_STATUS_CODE: 403
  METHOD_NOT_ALLOWED_STATUS_CODE: 405

  GHA_TOKEN: Your personal GitHub access token
*/

const BE_SANDBOXES_NAME = [
  "my-sandbox-1",
  "my-sandbox-2",
  "my-sandbox-3",
  "my-sandbox-n",
];

async function gatherResponse(response) {
  const { headers } = response;
  const contentType = headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return JSON.stringify(await response.json());
  } else if (contentType.includes("application/text")) {
    return response.text();
  } else if (contentType.includes("text/html")) {
    return response.text();
  } else {
    return response.text();
  }
}

function buildRestParameters(method, content = null, env) {
  let parameters = {
    method: method,
    headers: {
      Authorization: `Bearer ${env.GHA_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "Awesome-Octocat-App",
    },
  };

  if (content !== null) {
    parameters.body = content;
  }

  return parameters;
}

async function httpRequest(endpoint, parameters) {
  try {
    return await fetch(endpoint, parameters);
  } catch (err) {
    return new Response(
      `The application has failed with the following error: ${err}`
    );
  }
}

function getCurrentFormattedDate() {
  const dateTimeNow = new Date();
  const month = String(dateTimeNow.getMonth() + 1).padStart(2, "0");
  const day = String(dateTimeNow.getDate()).padStart(2, "0");
  const hours = String(dateTimeNow.getHours()).padStart(2, "0");
  const minutes = String(dateTimeNow.getMinutes()).padStart(2, "0");
  const seconds = String(dateTimeNow.getSeconds()).padStart(2, "0");

  return `${month}/${day} at ${hours}:${minutes}:${seconds}`;
}

function updateTdContent(htmlContent, targetId, newContent) {
  const startTag = `<td id="${targetId}">`;
  const endTag = `</td>`;

  const startIndex = htmlContent.indexOf(startTag);

  if (startIndex === -1) {
    return htmlContent;
  }

  const endIndex = htmlContent.indexOf(endTag, startIndex);

  if (endIndex === -1) {
    return htmlContent;
  }

  const tdContentStart = startIndex + startTag.length;
  const modifiedContent = `${htmlContent.substring(
    0,
    tdContentStart
  )}${newContent}${htmlContent.substring(endIndex)}`;
  console.log(modifiedContent);

  return modifiedContent;
}

function setUpResponse(destinationPage, commentId, env) {
  const response = new Response(null, {
    status: env.FOUND_STATUS_CODE,
  });
  response.headers.set("Cache-Control", "max-age=0");
  response.headers.set("Cloudflare-CDN-Cache-Control", "max-age=0");
  response.headers.set("CDN-Cache-Control", "max-age=0");
  response.headers.set(
    "Location",
    `${destinationPage}#issuecomment-${commentId}`
  );

  return response;
}

export default {
  async fetch(request, env, ctx) {
    const { searchParams } = new URL(request.url);
    const userAgent = request.headers.get("User-Agent") || "";
    let repositoryName = searchParams.get("repositoryName");
    let pullRequestNo = searchParams.get("pullRequestNo");
    let sandboxName = searchParams.get("sandbox");

    if (request.headers.get("Referer") !== "https://github.com/") {
      return new Response(`You are not allowed to perform this action.`, {
        status: env.FORBIDDEN_STATUS_CODE,
      });
    }

    if (request.method !== "GET") {
      return new Response("Unexpected method type.", {
        status: env.METHOD_NOT_ALLOWED_STATUS_CODE,
      });
    }

    if (request.body !== null) {
      return new Response("Unexpected body content.", {
        status: env.BAD_PARAMETERS_STATUS_CODE,
      });
    }

    if (userAgent.toLowerCase().includes("bot")) {
      return new Response("Block User Agent containing bot.", {
        status: env.FORBIDDEN_STATUS_CODE,
      });
    }

    if ([repositoryName, pullRequestNo, sandboxName].includes(null)) {
      return new Response(
        `Unknown parameters (RN: ${repositoryName} - PRN: ${pullRequestNo} -  SN: ${sandboxName}).`,
        {
          status: env.BAD_PARAMETERS_STATUS_CODE,
        }
      );
    }

    if (!BE_SANDBOXES_NAME.includes(sandboxName)) {
      return new Response(`Unknown sandbox name "${sandboxName}".`, {
        status: env.BAD_PARAMETERS_STATUS_CODE,
      });
    }

    const DESTINATION_PAGE = `https://github.com/${REPO_OWNER}/${repositoryName}/pull/${pullRequestNo}`;

    const GET_PR_DETAILS_ENDPOINT =
      env.HOST +
      `/repos/${REPO_OWNER}/${repositoryName}/pulls/${pullRequestNo}`;
    let response = await httpRequest(
      GET_PR_DETAILS_ENDPOINT,
      buildRestParameters("GET", null, env)
    );
    let result = JSON.parse(await gatherResponse(response));

    let branchPath = result.head.ref;

    if (result.head.ref === null) {
      return new Response(`Unknown parameters (BP: ${branchPath}).`, {
        status: env.BAD_PARAMETERS_STATUS_CODE,
      });
    }

    const POST_WORKFLOW_EVENT_ENDPOINT =
      env.HOST +
      `/repos/${REPO_OWNER}/${repositoryName}/actions/workflows/cypress-automation.yml/dispatches`; // Make sure to replace "cypress-automation.yml" with your actual workflow file name.
    response = await httpRequest(
      POST_WORKFLOW_EVENT_ENDPOINT,
      buildRestParameters(
        "POST",
        JSON.stringify({
          ref: branchPath,
          inputs: {
            sandbox: sandboxName, // Make sure to properly set up the inputs for your workflow.
          },
        }),
        env
      )
    );

    const GET_PR_COMMENTS_ENDPOINT =
      env.HOST +
      `/repos/${REPO_OWNER}/${repositoryName}/issues/${pullRequestNo}/comments`;
    response = await httpRequest(
      GET_PR_COMMENTS_ENDPOINT,
      buildRestParameters("GET", null, env)
    );
    result = JSON.parse(await gatherResponse(response));

    if (result[env.FIRST_INDEX].id === null) {
      return new Response(
        `The application has failed to obtain the Comment ID.`,
        {
          status: env.BAD_PARAMETERS_STATUS_CODE,
        }
      );
    }

    let commentBody = result[env.FIRST_INDEX].body;
    let commentId = result[env.FIRST_INDEX].id;

    const POST_PR_COMMENT_ENDPOINT =
      env.HOST +
      `/repos/${REPO_OWNER}/${repositoryName}/issues/comments/${commentId}`;
    if (BE_SANDBOXES_NAME.includes(sandboxName)) {
      response = await httpRequest(
        POST_PR_COMMENT_ENDPOINT,
        buildRestParameters(
          "POST",
          JSON.stringify({
            body: updateTdContent(
              commentBody,
              `last-cypress-run-${sandboxName}`,
              getCurrentFormattedDate()
            ),
          }),
          env
        )
      );
      result = await gatherResponse(response);
    }

    return setUpResponse(DESTINATION_PAGE, commentId, env);
  },
};
