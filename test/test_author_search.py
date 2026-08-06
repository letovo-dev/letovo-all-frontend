import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_author_search_and_selected_username_contract():
    subprocess.run(
        ["npm", "run", "test:author-search"],
        cwd=ROOT,
        check=True,
    )


def test_post_modal_enables_search_and_empty_state():
    source = (ROOT / "src/features/post-modal/ui/PostModal.tsx").read_text()

    assert "showSearch" in source
    assert "filterOption={filterAuthorOption}" in source
    assert 'notFoundContent="Авторы не найдены"' in source
