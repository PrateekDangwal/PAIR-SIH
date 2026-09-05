"""
Test fixtures for PAIR Sprint 2 + Sprint 3.

SQLAlchemy 2 + SQLite shared-connection pattern:
- One in-memory DB for the whole session
- Each test runs in a SAVEPOINT that is rolled back afterwards
- FastAPI's request threads see the same connection via Session(bind=connection)
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from unittest.mock import MagicMock, patch

from app.main import app
from app.database import Base, get_db
from app.ai.models import ProviderResponse, ModelInfo

# ── Single in-memory engine & connection ──────────────────────────────────────
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    # Disable SA-level connection pool — we manage one connection ourselves
)

# Hold one open connection for the whole pytest session
_conn = engine.connect()

# Create all tables once, on that connection
Base.metadata.create_all(bind=_conn)
_conn.commit()   # SQLAlchemy 2 autobegin; commit so schema is visible

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=_conn,         # always use our shared connection
)


@pytest.fixture(scope="function")
def db():
    """
    Wrap every test in a SAVEPOINT.  Rolling back the savepoint leaves
    the schema intact but erases all data written during the test.
    """
    _conn.execute(__import__("sqlalchemy").text("SAVEPOINT test_sp"))
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        _conn.execute(__import__("sqlalchemy").text("ROLLBACK TO SAVEPOINT test_sp"))
        _conn.execute(__import__("sqlalchemy").text("RELEASE SAVEPOINT test_sp"))


@pytest.fixture(scope="function")
def client(db):
    """HTTP client whose handlers share the same DB session."""

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ── Sample PDF ────────────────────────────────────────────────────────────────
@pytest.fixture
def sample_pdf_bytes():
    """Minimal valid 1-page PDF."""
    return (
        b"%PDF-1.4\n"
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
        b"4 0 obj\n<< /Length 44 >>\nstream\n"
        b"BT /F1 12 Tf 72 720 Td (GeM Bid Test) Tj ET\n"
        b"endstream\nendobj\n"
        b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
        b"xref\n0 6\n0000000000 65535 f \n"
        b"0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n"
        b"0000000266 00000 n \n0000000360 00000 n \n"
        b"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n441\n%%EOF"
    )


# ── Mocked AI provider — Requirements ────────────────────────────────────────
MOCK_REQ_JSON = """{
  "requirements": [
    {
      "title": "Vendor Registration",
      "description": "Vendor must be registered on GeM portal",
      "requirement_text": "All vendors must have an active GeM registration.",
      "category": "eligibility",
      "is_mandatory": true,
      "priority": 5,
      "severity": "high",
      "source_page_number": 1,
      "confidence": 0.95
    }
  ]
}"""


@pytest.fixture
def mock_anthropic_provider():
    mock_response = ProviderResponse(
        content=MOCK_REQ_JSON,
        model_used="claude-sonnet-4-6",
        provider="anthropic",
        input_tokens=100,
        output_tokens=200,
    )
    mock_model_info = ModelInfo(
        provider="anthropic",
        model_id="claude-sonnet-4-6",
        display_name="Anthropic / claude-sonnet-4-6",
        max_tokens=8192,
        supports_json_mode=True,
    )
    with patch("app.services.requirement_service.ProviderRegistry") as MockReg:
        mock_registry = MagicMock()
        MockReg.return_value = mock_registry
        mock_provider = MagicMock()
        mock_provider.get_model_info.return_value = mock_model_info

        async def async_gen(*args, **kwargs):
            return mock_response

        mock_provider.generate_structured = async_gen
        mock_registry.get_provider.return_value = mock_provider
        yield mock_provider


# ── Mocked AI provider — Evidence ────────────────────────────────────────────
MOCK_EVIDENCE_JSON = """{
  "evidence": [
    {
      "evidence_text": "The company has provided relevant services since 2018.",
      "evidence_type": "experience",
      "source_page_number": 7,
      "confidence": 0.94
    }
  ]
}"""

MOCK_EVIDENCE_EMPTY_JSON = '{"evidence": []}'


def _evidence_mock_fixture(content: str):
    """Factory: returns a pytest fixture that mocks evidence_service.ProviderRegistry."""
    mock_response = ProviderResponse(
        content=content,
        model_used="claude-sonnet-4-6",
        provider="anthropic",
        input_tokens=150,
        output_tokens=100,
    )
    mock_model_info = ModelInfo(
        provider="anthropic",
        model_id="claude-sonnet-4-6",
        display_name="Anthropic / claude-sonnet-4-6",
        max_tokens=8192,
        supports_json_mode=True,
    )

    # We return the patcher context so callers can use it as a fixture
    class _EvidenceMock:
        def __init__(self):
            self.response = mock_response
            self.model_info = mock_model_info

    return _EvidenceMock()


@pytest.fixture
def mock_evidence_provider():
    mock_response = ProviderResponse(
        content=MOCK_EVIDENCE_JSON,
        model_used="claude-sonnet-4-6",
        provider="anthropic",
        input_tokens=150,
        output_tokens=100,
    )
    mock_model_info = ModelInfo(
        provider="anthropic",
        model_id="claude-sonnet-4-6",
        display_name="Anthropic / claude-sonnet-4-6",
        max_tokens=8192,
        supports_json_mode=True,
    )
    with patch("app.services.evidence_service.ProviderRegistry") as MockReg:
        mock_registry = MagicMock()
        MockReg.return_value = mock_registry
        mock_provider = MagicMock()
        mock_provider.get_model_info.return_value = mock_model_info

        async def async_gen(*args, **kwargs):
            return mock_response

        mock_provider.generate_structured = async_gen
        mock_registry.get_provider.return_value = mock_provider
        yield mock_provider


@pytest.fixture
def mock_evidence_provider_empty():
    mock_response = ProviderResponse(
        content=MOCK_EVIDENCE_EMPTY_JSON,
        model_used="claude-sonnet-4-6",
        provider="anthropic",
        input_tokens=100,
        output_tokens=10,
    )
    mock_model_info = ModelInfo(
        provider="anthropic",
        model_id="claude-sonnet-4-6",
        display_name="Anthropic / claude-sonnet-4-6",
        max_tokens=8192,
        supports_json_mode=True,
    )
    with patch("app.services.evidence_service.ProviderRegistry") as MockReg:
        mock_registry = MagicMock()
        MockReg.return_value = mock_registry
        mock_provider = MagicMock()
        mock_provider.get_model_info.return_value = mock_model_info

        async def async_gen(*args, **kwargs):
            return mock_response

        mock_provider.generate_structured = async_gen
        mock_registry.get_provider.return_value = mock_provider
        yield mock_provider


@pytest.fixture
def mock_evidence_provider_malformed():
    mock_response = ProviderResponse(
        content="NOT VALID JSON {{{{",
        model_used="claude-sonnet-4-6",
        provider="anthropic",
        input_tokens=100,
        output_tokens=10,
    )
    mock_model_info = ModelInfo(
        provider="anthropic",
        model_id="claude-sonnet-4-6",
        display_name="Anthropic / claude-sonnet-4-6",
        max_tokens=8192,
        supports_json_mode=True,
    )
    with patch("app.services.evidence_service.ProviderRegistry") as MockReg:
        mock_registry = MagicMock()
        MockReg.return_value = mock_registry
        mock_provider = MagicMock()
        mock_provider.get_model_info.return_value = mock_model_info

        async def async_gen(*args, **kwargs):
            return mock_response

        mock_provider.generate_structured = async_gen
        mock_registry.get_provider.return_value = mock_provider
        yield mock_provider
