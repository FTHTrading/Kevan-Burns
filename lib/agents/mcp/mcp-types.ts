export interface MCPTool {
  name: string;
  description: string;
  parameters?: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
  execute: (args: any) => Promise<any>;
}

export class MCPServer {
  name: string;
  description: string;
  tools: MCPTool[];

  constructor(name: string, description: string, tools: MCPTool[]) {
    this.name = name;
    this.description = description;
    this.tools = tools;
  }

  getTool(name: string): MCPTool | undefined {
    return this.tools.find((t) => t.name === name);
  }

  async callTool(name: string, args: any): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found on server ${this.name}`);
    }
    return tool.execute(args);
  }
}
