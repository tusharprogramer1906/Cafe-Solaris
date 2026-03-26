import { Client } from "@notionhq/client";

type NotionLeadInput = {
  name: string;
  phone: string;
  status: string;
  message: string;
  createdAt: string;
};

function getNotionClient() {
  const token = process.env.NOTION_API_KEY;

  if (!token) {
    return null;
  }

  return new Client({ auth: token });
}

export async function createNotionLead(lead: NotionLeadInput) {
  const notion = getNotionClient();
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!notion || !databaseId) {
    return;
  }

  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: {
        title: [{ text: { content: lead.name } }],
      },
      Phone: {
        rich_text: [{ text: { content: lead.phone } }],
      },
      Status: {
        select: { name: lead.status },
      },
      Message: {
        rich_text: [{ text: { content: lead.message } }],
      },
      "Created Time": {
        date: { start: lead.createdAt },
      },
    },
  });
}

