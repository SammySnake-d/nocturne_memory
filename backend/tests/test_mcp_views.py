import sys
import os
import unittest
from unittest.mock import MagicMock, patch, AsyncMock

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Mock environment variables before importing mcp_server
os.environ["VALID_DOMAINS"] = "core,writer"
os.environ["CORE_MEMORY_URIS"] = "core://agent"
# Provide a dummy database url to avoid error in mcp_server initialization if it checks
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

import mcp_server
import view
from utils.uri import make_uri

class TestRefactor(unittest.IsolatedAsyncioTestCase):
    async def test_fetch_and_format_memory(self):
        # Mock client
        client = MagicMock()
        client.get_memory_by_path = AsyncMock(return_value={
            "id": 1,
            "domain": "core",
            "path": "agent",
            "content": "Test content",
            "priority": 1,
            "disclosure": "Never"
        })
        client.get_children = AsyncMock(return_value=[
            {
                "domain": "core",
                "path": "agent/child",
                "content_snippet": "Child snippet",
                "priority": 0,
                "disclosure": None
            }
        ])

        # Test
        uri = "core://agent"
        result = await mcp_server._fetch_and_format_memory(client, uri)

        # Verify result contains key parts
        self.assertIn("MEMORY: core://agent", result)
        self.assertIn("Test content", result)
        self.assertIn("CHILD MEMORIES", result)
        self.assertIn("URI: core://agent/child", result)

    async def test_generate_boot_memory_view(self):
        # Patch get_sqlite_client
        with patch("mcp_server.get_sqlite_client") as mock_get_client:
            client = MagicMock()
            mock_get_client.return_value = client

            # Mock get_memory_by_path and get_children for _fetch_and_format_memory
            client.get_memory_by_path = AsyncMock(return_value={
                "id": 1, "domain": "core", "path": "agent", "content": "Boot content"
            })
            client.get_children = AsyncMock(return_value=[])

            # Mock get_recent_memories
            client.get_recent_memories = AsyncMock(return_value=[
                {"uri": "core://recent", "priority": 0, "created_at": "2023-01-01T00:00:00"}
            ])

            result = await mcp_server._generate_boot_memory_view()

            self.assertIn("# Core Memories", result)
            self.assertIn("Boot content", result)
            self.assertIn("# Recently Modified Memories", result)
            self.assertIn("core://recent", result)

    async def test_generate_memory_index_view(self):
        with patch("mcp_server.get_sqlite_client") as mock_get_client:
            client = MagicMock()
            mock_get_client.return_value = client

            client.get_all_paths = AsyncMock(return_value=[
                {"domain": "core", "path": "agent", "uri": "core://agent", "priority": 0, "memory_id": 1},
                {"domain": "writer", "path": "draft", "uri": "writer://draft", "priority": 0, "memory_id": 2}
            ])

            result = await mcp_server._generate_memory_index_view()

            self.assertIn("# Memory Index", result)
            self.assertIn("# DOMAIN: core://", result)
            self.assertIn("- core://agent", result)
            self.assertIn("# DOMAIN: writer://", result)

if __name__ == "__main__":
    unittest.main()
