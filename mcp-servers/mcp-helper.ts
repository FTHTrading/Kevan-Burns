export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (args: any) => Promise<any>;
}

export class McpServer {
  private name: string;
  private version: string;
  private tools: Map<string, Tool> = new Map();

  constructor(name: string, version: string = "1.0.0") {
    this.name = name;
    this.version = version;
  }

  public registerTool(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  public start() {
    process.stdin.setEncoding('utf8');
    let buffer = "";

    process.stdin.on('data', async (chunk) => {
      buffer += chunk;
      let lineEnd;
      while ((lineEnd = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);

        if (line) {
          try {
            const request = JSON.parse(line);
            await this.handleRequest(request);
          } catch (err: any) {
            this.sendError(null, -32700, "Parse error: " + err.message);
          }
        }
      }
    });
  }

  private async handleRequest(request: any) {
    const { id, method, params } = request;

    if (method === "initialize") {
      this.sendResponse(id, {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: this.name,
          version: this.version
        }
      });
      return;
    }

    if (method === "notifications/initialized") {
      return;
    }

    if (method === "tools/list") {
      const toolsList = Array.from(this.tools.values()).map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema
      }));
      this.sendResponse(id, { tools: toolsList });
      return;
    }

    if (method === "tools/call") {
      const { name, arguments: args } = params;
      const tool = this.tools.get(name);

      if (!tool) {
        this.sendError(id, -32601, `Tool not found: ${name}`);
        return;
      }

      try {
        const result = await tool.handler(args);
        this.sendResponse(id, {
          content: [
            {
              type: "text",
              text: typeof result === "string" ? result : JSON.stringify(result, null, 2)
            }
          ],
          isError: false
        });
      } catch (err: any) {
        this.sendResponse(id, {
          content: [
            {
              type: "text",
              text: `Error calling tool ${name}: ${err.message}`
            }
          ],
          isError: true
        });
      }
      return;
    }

    if (id !== undefined) {
      this.sendError(id, -32601, `Method not found: ${method}`);
    }
  }

  private sendResponse(id: any, result: any) {
    const response = {
      jsonrpc: "2.0",
      id,
      result
    };
    process.stdout.write(JSON.stringify(response) + "\n");
  }

  private sendError(id: any, code: number, message: string) {
    const response = {
      jsonrpc: "2.0",
      id,
      error: { code, message }
    };
    process.stdout.write(JSON.stringify(response) + "\n");
  }
}
