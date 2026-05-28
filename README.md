# MailboxValidator MCP server

This is a simple Model Context Protocol (MCP) server implementation for MailboxValidator API. It will return validation result for an email address.

[![mcp-mailboxvalidator MCP server](https://glama.ai/mcp/servers/MailboxValidator/mcp-mailboxvalidator/badges/card.svg)](https://glama.ai/mcp/servers/MailboxValidator/mcp-mailboxvalidator)

# Features

- **Comprehensive Email Validation**: Checking an email address to see if an email is reachable by checking the syntax, DNS, MX server, high risk, suppressed list, and more.
- **Disposable Email**: Checking an email address to see if it's from a temporary/disposable email provider.
- **Free Email**: Checking an email address to see if it's from a free email provider.

# Requirement

This MCP server requires an API key. You can also [sign up](https://www.mailboxvalidator.com/plans) for a free API key and enjoy up to 300 queries per month.

The setup also uses `Node.js` and `npm`, which can be downloaded at [Node.js website](https://nodejs.org/en/download).

# Setup

Follow the steps to use this MCP server with Claude Desktop:
1. Make sure you have installed Node.js and npm.
2. Make sure you have installed Claude Desktop. If you haven't, kindly download from [here](https://claude.ai/download) for Windows and macOS users, or follow [this guide](https://modelcontextprotocol.io/quickstart/client) for Linux users.
3. Open `claude_desktop_config.json`. If you don't have that file yet, follow [this guide](https://modelcontextprotocol.io/quickstart/server#testing-your-server-with-claude-for-desktop) to create one.
4. Add the following configuration:

```json
{
  "mcpServers": {
    "mailboxvalidator": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-mailboxvalidator"
      ],
      "env": {
        "MAILBOXVALIDATOR_API_KEY": "<YOUR_API_KEY>"
      }
    }
  }
}
```
5. To get your API key, just [login](https://www.mailboxvalidator.com/login) to your dashboard and get it from there. Replace `<YOUR_API_KEY>` in the above with your actual API key.
6. Restart the Claude Desktop after saving the changes, and you should see it appear in the `Search and tools` menu.

# Usage

Just enter your query about the email address in a chat in Claude Desktop. Some of example queries are:

- Is (email) a valid email address?
- Is (email) a fake email?
- Is (email) a free email?

In Claude Desktop, the model will automatically generate the output based on the result returned by MailboxValidator MCP server.

# Environment Variable

`MAILBOXVALIDATOR_API_KEY`

The free MailboxValidator API key allows you to query up to 300 emails per month. If you require more, you can [sign up](https://www.mailboxvalidator.com/plans) for a paid API plan.

# Tool

`validate_email`

**Description**
Validates the email address given. It helps users to determine if an email address is potentially reachable by checking the syntax, DNS, MX server, disposable list and more.

**Arguments**
email (str): The email address to validate.

**Returns**
A JSON string containing the validation data. The result includes the following fields:

- Syntax: Checks that the email address conforms to how an email address should look like.
- DNS & MX Server: Checks that the domain DNS has an MX server specified.
- Network & Connectivity: Attempts connection to the MX server to make sure it's operational.
- Greylisting: Checks if MX server is using greylisting that could cause email sent to that address to bounce.
- Disposable List: Checks if the email domain is from a temporary or disposable email provider.
- High Risk & Suppressed List: Checks if email username looks high-risk or if the email address is found in a suppression list.
- Others: Checks the reputation score for the email and more..

If the request fails, the tool will return an error message as a string.

`check_disposable_email`

**Description**
Checks if the email address given is from a disposable email provider.

**Arguments**
email (str): The email address to check.

**Returns**
A JSON string containing the disposable email data. The result includes the following fields:

- Disposable List: Checks if the email domain is from a temporary or disposable email provider.

If the request fails, the tool will return an error message as a string.

`check_free_email`

**Description**
Checks if the email address given is from a free email provider.

**Arguments**
email (str): The email address to check.

**Returns**
A JSON string containing the free email data. The result includes the following fields:

- Free Email List: Checks if the email domain is from a free email provider.

If the request fails, the tool will return an error message as a string.

# License

See the LICENSE file.
