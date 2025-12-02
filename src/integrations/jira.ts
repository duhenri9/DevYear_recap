type JiraConfig = {
  baseUrl: string;
  email: string;
  token: string;
};

export type JiraIssue = {
  key: string;
  summary: string;
  status: string;
  url: string;
};

function getConfig(): JiraConfig | null {
  const baseUrl = process.env.JIRA_BASE_URL;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;
  if (!baseUrl || !email || !token) return null;
  return { baseUrl, email, token };
}

export async function fetchJiraIssues(jql: string): Promise<JiraIssue[]> {
  const cfg = getConfig();
  if (!cfg) return [];

  const url = `${cfg.baseUrl}/rest/api/3/search`;
  const res = await fetch(`${url}?jql=${encodeURIComponent(jql)}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${cfg.email}:${cfg.token}`).toString("base64")}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    return [];
  }
  const data = (await res.json()) as any;
  const issues = (data.issues ?? []) as any[];
  return issues.map((issue) => ({
    key: issue.key,
    summary: issue.fields?.summary ?? "",
    status: issue.fields?.status?.name ?? "",
    url: `${cfg.baseUrl}/browse/${issue.key}`,
  }));
}
