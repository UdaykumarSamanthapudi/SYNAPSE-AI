from langchain.tools import tool
from tavily import TavilyClient
import os

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

@tool
def search_web(query: str):
    """Search the internet for current information"""

    response = tavily.search(
        query=query,
        search_depth="basic",
        max_results=3
    )

    results = []

    for r in response["results"]:
        content = r["content"][:500]
        results.append(content)

    return "\n".join(results)