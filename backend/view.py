"""
View logic for formatting memory data into strings.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from utils.uri import make_uri, DEFAULT_DOMAIN

def format_memory(memory: Dict[str, Any], children: List[Dict[str, Any]]) -> str:
    """
    Format a memory and its children into a readable string.
    """
    lines = []

    # Build URI from domain and path
    disp_domain = memory.get("domain", DEFAULT_DOMAIN)
    disp_path = memory.get("path", "unknown")
    disp_uri = make_uri(disp_domain, disp_path)

    # Header Block
    lines.append("=" * 60)
    lines.append("")
    lines.append(f"MEMORY: {disp_uri}")
    lines.append(f"Memory ID: {memory.get('id')}")
    lines.append(f"Priority: {memory.get('priority', 0)}")

    disclosure = memory.get("disclosure")
    if disclosure:
        lines.append(f"Disclosure: {disclosure}")
    else:
        lines.append("Disclosure: (not set)")

    lines.append("")
    lines.append("=" * 60)
    lines.append("")

    # Content - directly, no header
    lines.append(memory.get("content", "(empty)"))
    lines.append("")

    if children:
        lines.append("=" * 60)
        lines.append("")
        lines.append("CHILD MEMORIES (Use 'read_memory' with URI to access)")
        lines.append("")
        lines.append("=" * 60)
        lines.append("")

        for child in children:
            child_domain = child.get("domain", disp_domain)
            child_path = child.get("path", "")
            child_uri = make_uri(child_domain, child_path)

            # Show disclosure status and snippet
            child_disclosure = child.get("disclosure")
            snippet = child.get("content_snippet", "")

            lines.append(f"- URI: {child_uri}  ")
            lines.append(f"  Priority: {child.get('priority', 0)}  ")

            if child_disclosure:
                lines.append(f"  When to recall: {child_disclosure}  ")
            else:
                lines.append("  When to recall: (not set)  ")
                lines.append(f"  Snippet: {snippet}  ")

            lines.append("")

    return "\n".join(lines)


def format_boot_memory_view(
    results: List[str], failed: List[str], recent_view: str, total_expected: int
) -> str:
    """
    Format the boot memory view.
    """
    # Build output
    output_parts = []

    output_parts.append("# Core Memories")
    output_parts.append(f"# Loaded: {len(results)}/{total_expected} memories")
    output_parts.append("")

    if failed:
        output_parts.append("## Failed to load:")
        output_parts.extend(failed)
        output_parts.append("")

    if results:
        output_parts.append("## Contents:")
        output_parts.append("")
        output_parts.append("For full memory index, use: system://index")
        output_parts.append("For recent memories, use: system://recent")
        output_parts.extend(results)
    else:
        output_parts.append("(No core memories loaded. Run migration first.)")

    # Append recent memories to boot output so the agent sees what changed recently
    if recent_view:
        output_parts.append("")
        output_parts.append("---")
        output_parts.append("")
        output_parts.append(recent_view)

    return "\n".join(output_parts)


def format_memory_index_view(paths: List[Dict[str, Any]]) -> str:
    """
    Format the full memory index view.
    """
    lines = []
    lines.append("# Memory Index")
    lines.append(f"# Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"# Total entries: {len(paths)}")
    lines.append(
        "# Legend: [#ID] = Memory ID (same ID = alias), [★N] = priority (lower = higher priority)"
    )
    lines.append("")

    # Group by domain first, then by top-level path segment
    domains = {}
    for item in paths:
        domain = item.get("domain", DEFAULT_DOMAIN)
        if domain not in domains:
            domains[domain] = {}

        path = item["path"]
        top_level = path.split("/")[0] if path else "(root)"
        if top_level not in domains[domain]:
            domains[domain][top_level] = []
        domains[domain][top_level].append(item)

    for domain_name in sorted(domains.keys()):
        lines.append("# ══════════════════════════════════════")
        lines.append(f"# DOMAIN: {domain_name}://")
        lines.append("# ══════════════════════════════════════")
        lines.append("")

        for group_name in sorted(domains[domain_name].keys()):
            lines.append(f"## {group_name}")
            for item in sorted(
                domains[domain_name][group_name], key=lambda x: x["path"]
            ):
                uri = item.get("uri", make_uri(domain_name, item["path"]))
                priority = item.get("priority", 0)
                memory_id = item.get("memory_id", "?")
                imp_str = f" [★{priority}]" if priority > 0 else ""
                lines.append(f"  - {uri} [#{memory_id}]{imp_str}")
            lines.append("")

    return "\n".join(lines)


def format_recent_memories_view(results: List[Dict[str, Any]], limit: int) -> str:
    """
    Format the recent memories view.
    """
    lines = []
    lines.append("# Recently Modified Memories")
    lines.append(f"# Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(
        f"# Showing: {len(results)} most recent entries (requested: {limit})"
    )
    lines.append("")

    if not results:
        lines.append("(No memories found.)")
        return "\n".join(lines)

    for i, item in enumerate(results, 1):
        uri = item["uri"]
        priority = item.get("priority", 0)
        disclosure = item.get("disclosure")
        raw_ts = item.get("created_at", "")

        # Truncate timestamp to minute precision: "2026-02-09T20:40"
        if raw_ts and len(raw_ts) >= 16:
            modified = raw_ts[:10] + " " + raw_ts[11:16]
        else:
            modified = raw_ts or "unknown"

        imp_str = f"★{priority}"

        lines.append(f"{i}. {uri}  [{imp_str}]  modified: {modified}")
        if disclosure:
            lines.append(f"   disclosure: {disclosure}")
        else:
            lines.append("   disclosure: (NOT SET — consider adding one)")
        lines.append("")

    return "\n".join(lines)
