import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIRS = [ROOT / "src"]
ENV_FILE = ROOT / "front-env.env"
AXIOS_FILE = ROOT / "src/shared/lib/ApiSPA/axios/axios.ts"
API_SETTINGS_GLOB = "src/shared/api/**/settings.ts"


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _source_files():
    for source_dir in SOURCE_DIRS:
        yield from source_dir.rglob("*.ts")
        yield from source_dir.rglob("*.tsx")


def _env_keys(env_content: str) -> set[str]:
    keys: set[str] = set()
    for line in env_content.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        key = stripped.split("=", 1)[0].strip()
        keys.add(key)
    return keys


def _env_value(env_content: str, key: str) -> str | None:
    for line in env_content.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        current_key, value = stripped.split("=", 1)
        if current_key.strip() == key:
            return value.strip().strip('"\'')
    return None


def test_all_next_public_build_time_vars_used_by_source_are_declared_in_front_env():
    """Missing NEXT_PUBLIC_* build env bakes `undefined/...` API URLs into .next."""
    used_vars: set[str] = set()
    for source_file in _source_files():
        used_vars.update(re.findall(r"process\.env\.(NEXT_PUBLIC_[A-Z0-9_]+)", _read(source_file)))

    declared_vars = _env_keys(_read(ENV_FILE))

    assert used_vars, "test must see at least one NEXT_PUBLIC_* usage"
    assert used_vars <= declared_vars


def test_login_api_base_url_is_declared_and_points_at_letovo_api_prefix():
    """Login must be built with a real API prefix, never with missing/empty env."""
    base_url = _env_value(_read(ENV_FILE), "NEXT_PUBLIC_BASE_URL")

    assert base_url is not None
    assert base_url.endswith("/letovo-api")
    assert "undefined" not in base_url


def test_axios_instance_does_not_duplicate_the_api_scheme_base_url():
    """API schemes already prepend NEXT_PUBLIC_BASE_URL; Axios baseURL would make /letovo-api/letovo-api."""
    api_settings = "\n".join(_read(path) for path in ROOT.glob(API_SETTINGS_GLOB))
    axios_source = _read(AXIOS_FILE)

    assert "process.env.NEXT_PUBLIC_BASE_URL" in api_settings
    assert "url: `${baseUrl}/" in api_settings
    assert "baseURL" not in axios_source


def test_frontend_ci_scans_built_bundle_for_broken_api_prefixes():
    """Docker PR verification must reject baked `/undefined/...` and double `/letovo-api` URLs."""
    workflow = _read(ROOT / ".github/workflows/docker-image.yml")

    assert "undefined/auth" in workflow
    assert "undefined/message" in workflow
    assert "/letovo-api/letovo-api" in workflow


def test_news_post_profile_link_uses_author_username_not_display_name():
    """News feed profile links must route to stable username even when display name is localized."""
    news_post_source = _read(ROOT / "src/entities/post/ui/NewsPost.tsx")
    post_header_source = _read(ROOT / "src/entities/post/ui/PostHeader.tsx")

    assert "profile/${author.username}" in post_header_source
    assert "username: el.news.author || 'Unknown'" in news_post_source
    assert "displayName: el.news.display_name" in news_post_source
    assert "username: el.news.display_name" not in news_post_source
