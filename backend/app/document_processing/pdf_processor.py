import fitz  # PyMuPDF
from pathlib import Path
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

PAGE_SEPARATOR = "\n\n--- PAGE {page_num} ---\n\n"


@dataclass
class PDFExtractionResult:
    raw_text: str
    page_count: int
    pages: list[str]  # per-page text for evidence citation


class PDFProcessor:
    """Extracts text from PDFs while preserving page boundaries.

    Page boundary markers allow upstream services to cite evidence as
    'Source: Bid.pdf, Page 14'.
    """

    def extract(self, file_path: str | Path) -> PDFExtractionResult:
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"PDF not found: {file_path}")

        try:
            doc = fitz.open(str(path))
        except Exception as exc:
            raise ValueError(f"Cannot open PDF: {exc}") from exc

        pages: list[str] = []
        full_text_parts: list[str] = []

        try:
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                page_text = page.get_text("text")

                # 1-indexed page numbers for human readability
                human_page = page_num + 1
                pages.append(page_text)
                full_text_parts.append(
                    PAGE_SEPARATOR.format(page_num=human_page) + page_text
                )

            raw_text = "".join(full_text_parts)
            page_count = len(doc)
        finally:
            doc.close()

        logger.info(
            "Extracted PDF: %s | pages=%d | chars=%d",
            path.name,
            page_count,
            len(raw_text),
        )
        return PDFExtractionResult(
            raw_text=raw_text,
            page_count=page_count,
            pages=pages,
        )

    def validate_pdf(self, file_path: str | Path) -> bool:
        """Returns True if the file is a valid, readable PDF."""
        try:
            doc = fitz.open(str(file_path))
            valid = len(doc) > 0
            doc.close()
            return valid
        except Exception:
            return False
