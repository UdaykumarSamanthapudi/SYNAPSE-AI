from langchain_community.tools import ArxivQueryRun
from langchain_community.utilities import ArxivAPIWrapper
from langchain.tools import tool

arxiv=ArxivAPIWrapper()

arxiv_tool=ArxivQueryRun(api_wrapper=arxiv)

@tool
def search_arxiv(query: str):
    """Use this tool when the user asks questions about specific scientific research papers,
    academic papers, or mentions 'arXiv'."""
    result = arxiv_tool.run(query)
    return result

