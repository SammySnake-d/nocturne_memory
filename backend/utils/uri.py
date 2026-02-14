"""
URI parsing and generation utilities.
"""

import os
import re
from typing import Tuple
from dotenv import load_dotenv, find_dotenv

# Load environment variables
_dotenv_path = find_dotenv(usecwd=True)
if _dotenv_path:
    load_dotenv(_dotenv_path)

# =============================================================================
# Domain Configuration
# =============================================================================
# Valid domains (protocol prefixes)
# =============================================================================
VALID_DOMAINS = [
    d.strip()
    for d in os.getenv("VALID_DOMAINS", "core,writer,game,notes,system").split(",")
]
DEFAULT_DOMAIN = "core"

# =============================================================================
# URI Parsing
# =============================================================================

# Regex pattern for URI: domain://path
_URI_PATTERN = re.compile(r"^([a-zA-Z_][a-zA-Z0-9_]*)://(.*)$")


def parse_uri(uri: str) -> Tuple[str, str]:
    """
    Parse a memory URI into (domain, path).

    Supported formats:
    - "core://agent"          -> ("core", "agent")
    - "writer://chapter_1"    -> ("writer", "chapter_1")
    - "nocturne"              -> ("core", "nocturne")  [legacy fallback]

    Args:
        uri: The URI to parse

    Returns:
        Tuple of (domain, path)

    Raises:
        ValueError: If the URI format is invalid or domain is unknown
    """
    uri = uri.strip()

    match = _URI_PATTERN.match(uri)
    if match:
        domain = match.group(1).lower()
        path = match.group(2).strip("/")

        if domain not in VALID_DOMAINS:
            raise ValueError(
                f"Unknown domain '{domain}'. Valid domains: {', '.join(VALID_DOMAINS)}"
            )

        return (domain, path)

    # Legacy fallback: bare path without protocol
    # Assume default domain (core)
    path = uri.strip("/")
    return (DEFAULT_DOMAIN, path)


def make_uri(domain: str, path: str) -> str:
    """
    Create a URI from domain and path.

    Args:
        domain: The domain (e.g., "core", "writer")
        path: The path (e.g., "nocturne")

    Returns:
        Full URI (e.g., "core://agent")
    """
    return f"{domain}://{path}"
