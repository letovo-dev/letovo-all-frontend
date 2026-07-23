from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTICLE_PAGE = ROOT / "src/pages_fsd/articles/Articles.tsx"
MARKDOWN_RENDERER = ROOT / "src/pages_fsd/articles/ReactMd.tsx"
ARTICLE_STYLES = ROOT / "src/pages_fsd/articles/Articles.module.scss"


def test_article_images_keep_their_original_url_and_natural_aspect_ratio():
    """Uploaded non-16:9 images must not be forced into Next Image's 800x450 frame."""
    article_page = ARTICLE_PAGE.read_text(encoding="utf-8")
    markdown_renderer = MARKDOWN_RENDERER.read_text(encoding="utf-8")
    article_styles = ARTICLE_STYLES.read_text(encoding="utf-8")

    assert "URL.createObjectURL" not in article_page
    assert "responseType: 'blob'" not in article_page
    assert "<MarkdownContent content={article?.text ?? ''} />" in article_page
    assert "import Image from 'next/image';" not in markdown_renderer
    assert "width={800}" not in markdown_renderer
    assert "height={450}" not in markdown_renderer
    assert "return src ? <img src={src} alt={alt || 'Image'} /> : null;" in markdown_renderer
    assert "max-width: 100%;" in article_styles
    assert "height: auto;" in article_styles
