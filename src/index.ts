import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const MBV_API_BASE = "https://api.mailboxvalidator.com/v2";
const USER_AGENT = "mailboxvalidator-app/1.0";

const apiKey = process.env.MAILBOXVALIDATOR_API_KEY;

if (!apiKey) {
  console.error("Missing MAILBOXVALIDATOR_API_KEY environment variable.");
  process.exit(1);
}

// Create server instance
const server = new McpServer({
  name: "mailboxvalidator",
  version: "1.0.0",
});

interface ValidationResponse {
  email_address?: string;
  base_email_address?: string;
  domain?: string;
  is_free?: boolean | null;
  is_syntax?: boolean;
  is_domain?: boolean | null;
  is_smtp?: boolean | null;
  is_verified?: boolean | null;
  is_server_down?: boolean | null;
  is_greylisted?: boolean | null;
  is_disposable?: boolean | null;
  is_suppressed?: boolean | null;
  is_role?: boolean | null;
  is_high_risk?: boolean | null;
  is_catchall?: boolean | null;
  is_dmarc_enforced?: boolean;
  is_strict_spf?: boolean;
  website_exist?: boolean;
  mailboxvalidator_score?: number;
  time_taken?: number;
  status?: boolean;
  credits_available?: number;
  error?: {
    error_code?: number;
    error_message?: string;
  };
}

interface DisposableResponse {
  email_address?: string;
  is_disposable?: boolean | null;
  credits_available?: number;
  error?: {
    error_code?: number;
    error_message?: string;
  };
}

interface FreeResponse {
  email_address?: string;
  is_free?: boolean | null;
  credits_available?: number;
  error?: {
    error_code?: number;
    error_message?: string;
  };
}

// Helper function for making MailboxValidator API requests
async function makeMBVRequest<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  });

  const data = (await response.json()) as T;

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

// Format validation data
function formatValidation(data: ValidationResponse): string {
  return [
    `Email Address: ${formatValue(data.email_address)}`,
    `Base Email Address: ${formatValue(data.base_email_address)}`,
    `Domain: ${formatValue(data.domain)}`,
    `Is Free: ${formatValue(data.is_free)}`,
    `Is Syntax: ${formatValue(data.is_syntax)}`,
    `Is Domain: ${formatValue(data.is_domain)}`,
    `Is SMTP: ${formatValue(data.is_smtp)}`,
    `Is Verified: ${formatValue(data.is_verified)}`,
    `Is Server Down: ${formatValue(data.is_server_down)}`,
    `Is Greylisted: ${formatValue(data.is_greylisted)}`,
    `Is Disposable: ${formatValue(data.is_disposable)}`,
    `Is Suppressed: ${formatValue(data.is_suppressed)}`,
    `Is Role: ${formatValue(data.is_role)}`,
    `Is High Risk: ${formatValue(data.is_high_risk)}`,
    `Is Catchall: ${formatValue(data.is_catchall)}`,
    `Is DMARC Enforced: ${formatValue(data.is_dmarc_enforced)}`,
    `Is Strict SPF: ${formatValue(data.is_strict_spf)}`,
    `Website Exist: ${formatValue(data.website_exist)}`,
    `MailboxValidator Score: ${formatValue(data.mailboxvalidator_score)}`,
    `Time Taken: ${formatValue(data.time_taken)}`,
    `Status: ${formatValue(data.status)}`,
    `Credits Available: ${formatValue(data.credits_available)}`,
  ].join("\n");
}

// Format disposable data
function formatDisposable(data: DisposableResponse): string {
  return [
    `Email Address: ${formatValue(data.email_address)}`,
    `Is Disposable: ${formatValue(data.is_disposable)}`,
    `Credits Available: ${formatValue(data.credits_available)}`,
  ].join("\n");
}

// Format free data
function formatFree(data: FreeResponse): string {
  return [
    `Email Address: ${formatValue(data.email_address)}`,
    `Is Free: ${formatValue(data.is_free)}`,
    `Credits Available: ${formatValue(data.credits_available)}`,
  ].join("\n");
}

// Register MBV tool
server.registerTool(
  "validate_email",
  {
    description: "Checks if an email address is valid and reachable using MailboxValidator.",
    inputSchema: {
      emailAddress: z.string().email().describe("Email address to validate."),
    },
  },
  async ({ emailAddress }) => {
    try {
      const params = new URLSearchParams({
        email: emailAddress,
        key: apiKey,
        format: "json",
      });

      const validationUrl = `${MBV_API_BASE}/validation/single?${params.toString()}`;
      const validationData = await makeMBVRequest<ValidationResponse>(validationUrl);

      if (validationData.error) {
        return {
          content: [
            {
              type: "text",
              text: `MailboxValidator API error ${validationData.error.error_code ?? ""}: ${validationData.error.error_message ?? "Unknown error"}`,
            },
          ],
        };
      }

      const formattedValidation = formatValidation(validationData);
      const validationText = `Validation result for ${emailAddress}:\n\n${formattedValidation}`;

      return {
        content: [
          {
            type: "text",
            text: validationText,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve validation data: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  "check_disposable_email",
  {
    description: "Checks if an email address is a disposable email using MailboxValidator.",
    inputSchema: {
      emailAddress: z.string().email().describe("Email address to check."),
    },
  },
  async ({ emailAddress }) => {
    try {
      const params = new URLSearchParams({
        email: emailAddress,
        key: apiKey,
        format: "json",
      });

      const disposableUrl = `${MBV_API_BASE}/email/disposable?${params.toString()}`;
      const disposableData = await makeMBVRequest<DisposableResponse>(disposableUrl);

      if (disposableData.error) {
        return {
          content: [
            {
              type: "text",
              text: `MailboxValidator API error ${disposableData.error.error_code ?? ""}: ${disposableData.error.error_message ?? "Unknown error"}`,
            },
          ],
        };
      }

      const formattedDisposable = formatDisposable(disposableData);
      const disposableText = `Disposable email result for ${emailAddress}:\n\n${formattedDisposable}`;

      return {
        content: [
          {
            type: "text",
            text: disposableText,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve disposable email data: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  "check_free_email",
  {
    description: "Checks if an email address is a free email using MailboxValidator.",
    inputSchema: {
      emailAddress: z.string().email().describe("Email address to check."),
    },
  },
  async ({ emailAddress }) => {
    try {
      const params = new URLSearchParams({
        email: emailAddress,
        key: apiKey,
        format: "json",
      });

      const freeUrl = `${MBV_API_BASE}/email/free?${params.toString()}`;
      const freeData = await makeMBVRequest<FreeResponse>(freeUrl);

      if (freeData.error) {
        return {
          content: [
            {
              type: "text",
              text: `MailboxValidator API error ${freeData.error.error_code ?? ""}: ${freeData.error.error_message ?? "Unknown error"}`,
            },
          ],
        };
      }

      const formattedFree = formatFree(freeData);
      const freeText = `Free email result for ${emailAddress}:\n\n${formattedFree}`;

      return {
        content: [
          {
            type: "text",
            text: freeText,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve free email data: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MailboxValidator MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});