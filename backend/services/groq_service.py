import os
import time
import logging
from dotenv import load_dotenv
from groq import Groq, RateLimitError
from google import genai

logger = logging.getLogger(__name__)

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini").lower()

gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
]

def ask_groq(prompt: str) -> str:
    """Generate text using the configured AI provider.

    The function name is kept for backward compatibility with existing service
    modules. Gemini is the default provider; set AI_PROVIDER=groq to use Groq.
    """
    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty")

    if AI_PROVIDER == "gemini":
        return _ask_gemini(prompt)
    if AI_PROVIDER == "groq":
        return _ask_groq(prompt)
    raise ValueError("AI_PROVIDER must be either 'gemini' or 'groq'.")


def _ask_gemini(prompt: str) -> str:
    if gemini_client is None:
        raise ValueError("GEMINI_API_KEY not configured. Check your .env file.")

    last_error = None
    for attempt in range(3):
        try:
            response = gemini_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
            )
            if response.text:
                return response.text
            raise ValueError("Gemini returned an empty response")
        except Exception as e:
            wait = (attempt + 1) * 3
            logger.warning("Gemini API error on %s: %s", GEMINI_MODEL, str(e))
            last_error = e
            time.sleep(wait)

    raise ValueError(
        "Gemini is temporarily unavailable. Please check GEMINI_API_KEY, "
        "billing/quota, and try again."
    ) from last_error


def _ask_groq(prompt: str) -> str:
    if groq_client is None:
        raise ValueError("GROQ_API_KEY not configured. Check your .env file.")

    last_error = None
    for attempt in range(3):
        for model in MODELS:
            try:
                response = groq_client.chat.completions.create(
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
        "Groq is temporarily unavailable. Please check GROQ_API_KEY and try again."
    ) from last_error
