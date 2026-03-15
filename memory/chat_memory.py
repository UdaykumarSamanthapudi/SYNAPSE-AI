from langchain_community.chat_message_histories import ChatMessageHistory

store = {}

MAX_MESSAGES = 6

def get_session_history(session_id: str):

    if session_id not in store:
        store[session_id] = ChatMessageHistory()

    history = store[session_id]

    if len(history.messages) > MAX_MESSAGES:
        history.messages = history.messages[-MAX_MESSAGES:]

    return history