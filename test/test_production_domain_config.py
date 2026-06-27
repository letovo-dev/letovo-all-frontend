from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OLD_HOST = "ya." + "sergeiscv.ru"
PROD_HOST = "letovocorp.ru"


def test_production_env_file_uses_letovocorp_domain():
    env_file = ROOT / "front-env.env"
    content = env_file.read_text(encoding="utf-8")

    assert OLD_HOST not in content
    assert f"https://{PROD_HOST}/letovo-api" in content
    assert f"https://{PROD_HOST}" in content


def test_next_config_allows_and_rewrites_letovocorp_media_domain():
    next_config = ROOT / "next.config.mjs"
    content = next_config.read_text(encoding="utf-8")

    assert OLD_HOST not in content
    assert f"hostname: '{PROD_HOST}'" in content
    assert f"https://{PROD_HOST}/letovo-api/media/get/:path*" in content
