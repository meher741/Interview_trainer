import os
import time
import logging
from dotenv import load_dotenv
from groq import Groq, RateLimitError

logger = logging.getLogger(__name__)

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=API_KEY) if API_KEY else None

MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
]


def ask_groq(prompt: str) -> str:
    if client is None:
        raise ValueError("GROQ_API_KEY not configured. Check your .env file.")
    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty")

    last_error = None
    for attempt in range(3):
        for model in MODELS:
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                )
                return response.choices[0].message.content
            except RateLimitError as e:
                wait = (attempt + 1) * 3
                logger.warning("Rate limited on %s (attempt %d/3). Retrying in %ds...", model, attempt + 1, wait)
                last_error = e
                time.sleep(wait)
            except Exception as e:
                last_error = e
                logger.warning("Groq API error on %s: %s", model, str(e))

    raise ValueError(
        "AI service is temporarily unavailable due to rate limits. "
        "Please wait a moment and try again, or upgrade your Groq API plan at https://console.groq.com"
    )
