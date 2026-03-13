from langchain_community.document_loaders import PyPDFLoader,TextLoader
import os
from exceptions.custom_exceptions import PathDoesntExistException,DoesntSupportFormatException
import logging
from pathlib import Path
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app import logger


def load_document(file_path:str):
    if(os.path.exists(path=file_path)):
        file_name=Path(file_path).stem
        if(file_path.endswith(".pdf") or file_path.endswith(".PDF")):
            pdf_doc=PyPDFLoader(file_path=file_path)
            docs=pdf_doc.lazy_load()
            logger.info(f"{file_name}.pdf has been successfully loaded")
            return list(docs)
        
        elif(file_path.endswith(".txt") or file_path.endswith(".TXT")):
            txt_doc=TextLoader(file_path=file_path)
            docs=txt_doc.lazy_load()
            logger.info(f"{file_name}.txt has been successfully loaded")
            return list(docs)
        else:
            raise DoesntSupportFormatException("Only supports .pdf and .txt extension files!!!")
    else:
        raise PathDoesntExistException("Check the path correctly")


def split_documents_into_chunks(documents):
    splitter=RecursiveCharacterTextSplitter(chunk_size = 800,chunk_overlap = 150)
    chunks=splitter.split_documents(documents=documents)
    logger.info(f"The documents has been splitted into {len(chunks)} successfuly")
    return chunks

def process_document(file_path:str):
    loaded_docs=load_document(file_path=file_path)
    chunks=split_documents_into_chunks(loaded_docs)
    return chunks