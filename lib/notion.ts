import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_ID = process.env.NOTION_REQUIREMENTS_DB_ID!;

// ─── Types ───────────────────────────────────────────────────────────────────

export type Priority  = "High" | "Medium" | "Low";
export type ReqStatus = "Pending" | "In Progress" | "Done" | "Blocked";

export interface Requirement {
  id:          string;
  notionUrl:   string;
  title:       string;
  description: string;
  priority:    Priority;
  status:      ReqStatus;
  assignedTo:  string;
  size:        string;
  project:     string;
  createdAt:   string;
  updatedAt:   string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prop      = (page: any, key: string) => page.properties?.[key];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const richText  = (p: any) => p?.rich_text?.[0]?.plain_text ?? "";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const titleText = (p: any) => p?.title?.[0]?.plain_text ?? "";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectVal = (p: any) => p?.select?.name ?? "";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapReq(page: any): Requirement {
  return {
    id:          page.id,
    notionUrl:   page.url ?? "",
    title:       titleText(prop(page, "Title")),
    description: richText(prop(page, "Description")),
    priority:    (selectVal(prop(page, "Priority"))   || "Medium")  as Priority,
    status:      (selectVal(prop(page, "Status"))     || "Pending") as ReqStatus,
    assignedTo:  selectVal(prop(page, "Assigned To")) || "Nora",
    size:        selectVal(prop(page, "Size"))        || "M",
    project:     richText(prop(page, "Project")),
    createdAt:   page.created_time ?? "",
    updatedAt:   page.last_edited_time ?? "",
  };
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getRequirements(project?: string): Promise<Requirement[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: any[] = [
    { property: "Status", select: { does_not_equal: "Archived" } },
  ];
  if (project) {
    filters.push({ property: "Project", rich_text: { contains: project } });
  }

  const res = await notion.databases.query({
    database_id: DB_ID,
    filter: filters.length > 1 ? { and: filters } : filters[0],
    sorts: [{ timestamp: "created_time", direction: "descending" }],
  });

  return res.results.map(mapReq);
}

export async function createRequirement(data: {
  title:       string;
  description: string;
  priority:    Priority;
  assignedTo:  string;
  size:        string;
  project:     string;
}): Promise<Requirement> {
  const page = await notion.pages.create({
    parent: { database_id: DB_ID },
    properties: {
      "Title":       { title:     [{ text: { content: data.title } }] },
      "Description": { rich_text: [{ text: { content: data.description || "" } }] },
      "Priority":    { select:    { name: data.priority } },
      "Status":      { select:    { name: "Pending" } },
      "Assigned To": { select:    { name: data.assignedTo } },
      "Size":        { select:    { name: data.size } },
      "Project":     { rich_text: [{ text: { content: data.project || "" } }] },
    },
  });
  return mapReq(page);
}

export async function updateRequirement(
  pageId: string,
  data: Partial<{ status: ReqStatus; priority: Priority; assignedTo: string; size: string; title: string; description: string }>,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props: any = {};
  if (data.status)      props["Status"]      = { select: { name: data.status } };
  if (data.priority)    props["Priority"]    = { select: { name: data.priority } };
  if (data.assignedTo)  props["Assigned To"] = { select: { name: data.assignedTo } };
  if (data.size)        props["Size"]        = { select: { name: data.size } };
  if (data.title)       props["Title"]       = { title: [{ text: { content: data.title } }] };
  if (data.description) props["Description"] = { rich_text: [{ text: { content: data.description } }] };
  await notion.pages.update({ page_id: pageId, properties: props });
}

export async function archiveRequirement(pageId: string): Promise<void> {
  await notion.pages.update({
    page_id: pageId,
    properties: { "Status": { select: { name: "Archived" } } },
  });
}
