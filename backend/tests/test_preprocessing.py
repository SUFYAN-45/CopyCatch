"""Tests for NLP preprocessing and text chunking."""

from app.services.nlp.preprocessor import TextChunk, TextPreprocessor


def test_normalize_text_whitespace() -> None:
    """Verify normalization of irregular whitespace, tabs, and line breaks."""
    raw = "Paragraph one with\tmultiple    spaces.\r\n\r\n\r\nParagraph two with\u00a0non-breaking space."
    norm = TextPreprocessor.normalize_text(raw)

    assert "\t" not in norm
    assert "\r" not in norm
    assert "    " not in norm
    assert "\n\n\n" not in norm
    assert "Paragraph one with multiple spaces." in norm
    assert "Paragraph two with non-breaking space." in norm


def test_to_lexical_text() -> None:
    """Verify lowercasing and punctuation normalization while keeping word tokens."""
    raw = "Machine Learning (ML), Natural-Language Processing & AI!"
    lex = TextPreprocessor.to_lexical_text(raw)

    assert lex == "machine learning ml natural language processing ai"
    # Verify stopwords are preserved, not stripped
    stop_sentence = "This is a test of the emergency broadcast system."
    assert "is a test of the" in TextPreprocessor.to_lexical_text(stop_sentence)


def test_split_sentences() -> None:
    """Verify splitting of text into sentences with character offset ranges."""
    text = "First sentence here. Second sentence follows! Third question appears?"
    sentences = TextPreprocessor.split_sentences(text)

    assert len(sentences) == 3
    assert sentences[0][0] == "First sentence here."
    assert sentences[1][0] == "Second sentence follows!"
    assert sentences[2][0] == "Third question appears?"
    # Verify valid offset bounds
    for s_text, start, end in sentences:
        assert end > start
        assert text[start:end] == s_text


def test_chunk_document_short_text() -> None:
    """Verify a short document is handled as a single unified chunk."""
    short = "A single brief sentence for testing."
    chunks = TextPreprocessor.chunk_document(short, target_words=50)

    assert len(chunks) == 1
    assert chunks[0].chunk_index == 0
    assert chunks[0].text == short
    assert chunks[0].start_char == 0
    assert chunks[0].end_char == len(short)


def test_chunk_document_long_text_windowing() -> None:
    """Verify long documents are segmented into overlapping sentence chunks."""
    sentences = [f"This is sentence number {i} containing several words of academic text." for i in range(20)]
    long_doc = " ".join(sentences)

    chunks = TextPreprocessor.chunk_document(long_doc, target_words=30, min_words=10, overlap_sentences=1)

    assert len(chunks) > 1
    for chunk in chunks:
        assert isinstance(chunk, TextChunk)
        assert len(chunk.text.split()) >= 10
        assert chunk.end_char > chunk.start_char
        assert chunk.lexical_text == TextPreprocessor.to_lexical_text(chunk.text)
