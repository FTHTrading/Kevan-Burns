import os
import json
import re

def compile_docs():
    docs_dir = r"C:\Users\Kevan\.gemini\antigravity-ide\scratch\adk_build\legacy-vault-protocol\docs"
    output_file = r"C:\Users\Kevan\.gemini\antigravity-ide\scratch\adk_build\legacy-vault-protocol\lib\docs\researchArchive.ts"
    
    if not os.path.exists(docs_dir):
        print(f"Directory {docs_dir} not found.")
        return
        
    compiled_docs = []
    
    for filename in sorted(os.listdir(docs_dir)):
        if filename.endswith(".md"):
            filepath = os.path.join(docs_dir, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
                
            # Extract title
            title_match = re.search(r"^#\s+(.*)$", content, re.MULTILINE)
            title = title_match.group(1).strip() if title_match else filename[:-3].replace("_", " ").title()
            
            # Extract first paragraph as summary
            lines = content.split("\n")
            summary = ""
            for line in lines:
                line_stripped = line.strip()
                if line_stripped and not line_stripped.startswith("#") and not line_stripped.startswith("!") and not line_stripped.startswith("["):
                    # Use this line as summary
                    summary = line_stripped
                    if len(summary) > 220:
                        summary = summary[:217] + "..."
                    break
            
            if not summary:
                summary = f"Technical specification and protocol documentation for {title}."
                
            compiled_docs.append({
                "id": filename[:-3].lower().replace("_", "-"),
                "filename": filename,
                "title": title,
                "summary": summary,
                "content": content
            })
            
    # Generate TypeScript code
    ts_code = "/* eslint-disable */\n// Generated automatically by scripts/compile_docs.py. Do not edit directly.\n\n"
    ts_code += "export interface ResearchDoc {\n"
    ts_code += "  id: string;\n"
    ts_code += "  filename: string;\n"
    ts_code += "  title: string;\n"
    ts_code += "  summary: string;\n"
    ts_code += "  content: string;\n"
    ts_code += "}\n\n"
    ts_code += "export const RESEARCH_DOCS: ResearchDoc[] = "
    ts_code += json.dumps(compiled_docs, indent=2, ensure_ascii=False)
    ts_code += ";\n"
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(ts_code)
        
    print(f"Successfully compiled {len(compiled_docs)} documents to {output_file}")

if __name__ == "__main__":
    compile_docs()
