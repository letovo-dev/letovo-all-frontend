import re
from pathlib import Path
from urllib.parse import urljoin, urlparse, urlunparse

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIRS = [ROOT / "src"]
ENV_FILE = ROOT / "front-env.env"
AXIOS_FILE = ROOT / "src/shared/lib/ApiSPA/axios/axios.ts"
NEXT_CONFIG_FILE = ROOT / "next.config.mjs"
AUTH_STORE_FILE = ROOT / "src/shared/stores/auth-store/index.ts"
USER_STORE_FILE = ROOT / "src/shared/stores/user-store/index.ts"
USER_PAGE_FILE = ROOT / "src/pages_fsd/user-page/UserPage26.tsx"
USER_API_SETTINGS_FILE = ROOT / "src/shared/api/user/settings.ts"
USER_API_MODELS_INDEX_FILE = ROOT / "src/shared/api/user/models/index.ts"
USER_FULL_DATA_MODEL_FILE = ROOT / "src/shared/api/user/models/getFullUserData.ts"
BALANCE_WS_HOOK_FILE = ROOT / "src/shared/hooks/useBalanceWebSocket.ts"
DELETE_ARTICLE_MODEL_FILE = ROOT / "src/shared/api/data/models/deleteArticle.ts"
API_SETTINGS_GLOB = "src/shared/api/**/settings.ts"


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _source_files():
    for source_dir in SOURCE_DIRS:
        yield from source_dir.rglob("*.ts")
        yield from source_dir.rglob("*.tsx")


def _source_text() -> str:
    return "\n".join(_read(path) for path in _source_files())


def _balanced_block_after(source: str, marker: str) -> str:
    start = source.index(marker)
    brace_start = source.index("{", start)
    depth = 0
    for index in range(brace_start, len(source)):
        char = source[index]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return source[brace_start + 1 : index]
    raise AssertionError(f"could not find balanced block after {marker!r}")


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


def _websocket_url_like_frontend(base_url: str | None, origin: str) -> str:
    normalized_base_url = (base_url or origin).rstrip("/")
    parsed = urlparse(urljoin(f"{normalized_base_url}/", "ws"))
    scheme = "wss" if parsed.scheme == "https" else "ws"
    return urlunparse((scheme, parsed.netloc, parsed.path, "", parsed.query, ""))


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


def test_balance_websocket_url_preserves_production_api_prefix():
    """Production WS must use the same /letovo-api backend prefix as HTTP API calls."""
    base_url = _env_value(_read(ENV_FILE), "NEXT_PUBLIC_BASE_URL")
    hook_source = _read(BALANCE_WS_HOOK_FILE)

    assert _websocket_url_like_frontend(base_url, "https://letovocorp.ru") == (
        "wss://letovocorp.ru/letovo-api/ws"
    )
    assert _websocket_url_like_frontend(base_url, "https://letovocorp.ru") != (
        "wss://letovocorp.ru/ws"
    )
    assert "/letovo-api/letovo-api" not in _websocket_url_like_frontend(
        base_url, "https://letovocorp.ru"
    )
    assert "new URL('ws'" in hook_source
    assert "new URL('/ws'" not in hook_source


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


def test_frontend_does_not_persist_or_read_auth_tokens_from_local_storage():
    source = _source_text()
    axios_source = _read(AXIOS_FILE)

    assert "localStorage.getItem('token')" not in source
    assert 'localStorage.getItem("token")' not in source
    assert "setDataToLocaleStorage('token'" not in source
    assert 'setDataToLocaleStorage("token"' not in source
    assert "withCredentials: true" in axios_source


def test_auth_store_migrates_legacy_token_storage_and_keeps_auth_state_token_free():
    auth_store_source = _read(AUTH_STORE_FILE)
    auth_store_interface = _balanced_block_after(auth_store_source, "interface TAuthStoreState")
    user_status_interface = _balanced_block_after(auth_store_interface, "userStatus")
    initial_state = _balanced_block_after(auth_store_source, "const initialState")
    initial_user_status = _balanced_block_after(initial_state, "userStatus")

    assert re.search(r"\bAUTH_STORE_VERSION\s*=\s*\d+", auth_store_source)
    assert re.search(r"\bversion\s*:\s*AUTH_STORE_VERSION\b", auth_store_source)
    assert re.search(r"\bmigrate\s*:", auth_store_source)
    assert re.search(r"\blocalStorage\s*\.\s*removeItem\s*\(\s*['\"]token['\"]\s*\)", auth_store_source)
    assert re.search(r"\bpartialize\s*:", auth_store_source)
    assert not re.search(r"\btoken\s*\??\s*:", user_status_interface)
    assert not re.search(r"\btoken\s*:", initial_user_status)


def test_axios_does_not_inject_bearer_auth_headers():
    axios_source = _read(AXIOS_FILE)

    assert "config.headers.Bearer" not in axios_source
    assert "Authorization" not in axios_source
    assert "Bearer" not in axios_source


def test_api_response_helpers_do_not_expose_authorization_as_auth_state():
    api_utils_source = _read(ROOT / "src/shared/lib/ApiSPA/utils/index.ts")
    api_types_source = _read(ROOT / "src/shared/lib/ApiSPA/types/index.ts")

    assert "authorization" not in api_utils_source
    assert "authorization" not in api_types_source


def test_secret_article_unlock_is_not_implemented_in_the_browser():
    source = _source_text()

    assert "revealSecretArticle" not in source
    assert "/post/reveal_secret" not in source
    assert "очень-секретный-key" not in source
    assert "bcrypt.compare" not in source


def test_login_honors_safe_next_redirect_after_cookie_login():
    enter_form_source = _read(ROOT / "src/features/login/ui/EnterForm.tsx")

    assert "new URLSearchParams(window.location.search)" in enter_form_source
    assert "params.get('next')" in enter_form_source
    assert "requestedNextPath?.startsWith('/')" in enter_form_source
    assert "!requestedNextPath.startsWith('//')" in enter_form_source
    assert "setNextPathReady(true)" in enter_form_source
    assert "if (!nextPathReady) return" in enter_form_source
    assert "router.replace(nextPath ?? `/user/${userName}`)" in enter_form_source


def test_next_production_config_disables_source_maps_and_powered_by_header():
    next_config = _read(NEXT_CONFIG_FILE)

    assert "productionBrowserSourceMaps: false" in next_config
    assert "poweredByHeader: false" in next_config
    assert "X-Content-Type-Options" in next_config
    assert "Referrer-Policy" in next_config


def test_pwa_runtime_cache_does_not_cache_api_requests_broadly():
    next_config = _read(NEXT_CONFIG_FILE)

    assert "urlPattern: /^https?.*/" not in next_config
    assert "urlPattern: /^http" not in next_config
    assert "next-pwa" not in next_config
    assert "withPWA" not in next_config
    assert not list(ROOT.glob("public/workbox-*.js"))
    assert ".unregister()" in _read(ROOT / "public/sw.js")


def test_password_change_payload_uses_backend_cookie_session_contract():
    auth_store_source = _read(ROOT / "src/shared/stores/auth-store/index.ts")
    change_pass_source = _read(ROOT / "src/shared/api/user/models/changePass.ts")
    auth_models_index = _read(ROOT / "src/shared/api/auth/models/index.ts")
    auth_settings = _read(ROOT / "src/shared/api/auth/settings.ts")

    assert "current_password" in auth_store_source
    assert "current_password" in change_pass_source
    assert "new_password" in auth_store_source
    assert "new_password" in change_pass_source
    assert "unlogin" not in auth_store_source
    assert "unlogin" not in change_pass_source
    assert "changePass" not in auth_models_index
    assert "changePass" not in auth_settings


def test_article_delete_payload_sends_numeric_ids_without_nan_nulling():
    delete_article_source = _read(DELETE_ARTICLE_MODEL_FILE)

    assert "const postId = Number(id)" in delete_article_source
    assert "Number.isFinite(postId) ? postId : id" in delete_article_source
    assert "data: { post_id: id }" not in delete_article_source


def test_cookie_auth_logout_and_password_change_clear_server_session():
    auth_store_source = _read(ROOT / "src/shared/stores/auth-store/index.ts")
    auth_models_index = _read(ROOT / "src/shared/api/auth/models/index.ts")
    logout_model = _read(ROOT / "src/shared/api/auth/models/logout.ts")
    auth_settings = _read(ROOT / "src/shared/api/auth/settings.ts")

    assert "url: `${baseUrl}/auth/logout`" in auth_settings
    assert "import { logout } from './logout'" in auth_models_index
    assert "logout," in auth_models_index
    assert "API_AUTH_SCHEME.logout" in logout_model
    assert "SERVICES_AUTH.Auth.logout()" in auth_store_source
    assert "Failed to revoke auth session" in auth_store_source
    assert "redirectToLogin()" in auth_store_source
    assert "window.location.assign('/login')" in auth_store_source


def test_user_store_exposes_refresh_user_data_from_backend_full_profile_endpoint():
    user_store_source = _read(USER_STORE_FILE)
    user_settings_source = _read(USER_API_SETTINGS_FILE)
    user_models_index_source = _read(USER_API_MODELS_INDEX_FILE)
    user_full_data_model_source = _read(USER_FULL_DATA_MODEL_FILE)

    assert "userFullData" in user_settings_source
    assert "url: `${baseUrl}/user/full`" in user_settings_source
    assert "import { getFullUserData } from './getFullUserData'" in user_models_index_source
    assert "getFullUserData," in user_models_index_source
    assert "API_USER_SCHEME.userFullData.method" in user_full_data_model_source
    assert "`${API_USER_SCHEME.userFullData.url}/${userName}`" in user_full_data_model_source
    assert "refreshUserData: (username?: string) => Promise<IUserData | undefined>;" in user_store_source
    assert "refreshUserData: async (username?: string)" in user_store_source
    assert "const requestedUsername = username ?? get().store.userData.username;" in user_store_source
    assert "SERVICES_USERS.UsersData.getFullUserData(requestedUsername)" in user_store_source
    assert "const responseData = response.data as {" in user_store_source
    assert "result: IUserData[];" in user_store_source
    assert "last_incoming_payment?: IPayment;" in user_store_source
    assert "last_outgoing_payment?: IPayment;" in user_store_source
    assert "const { result } = responseData;" in user_store_source
    assert "const freshUser = result?.[0];" in user_store_source
    assert "const freshUserWithPayments = {" in user_store_source
    assert "last_incoming_payment: responseData.last_incoming_payment" in user_store_source
    assert "last_outgoing_payment: responseData.last_outgoing_payment" in user_store_source
    assert "draft.store.userData = freshUserWithPayments;" in user_store_source
    assert "return freshUserWithPayments;" in user_store_source


def test_logged_in_profile_refreshes_user_data_before_loading_finance_widgets():
    user_page_source = _read(USER_PAGE_FILE)
    load_data_block = _balanced_block_after(user_page_source, "const loadData = async () =>")

    assert "refreshUserData" in user_page_source
    assert "const freshData = await refreshUserData(initialData.username);" in load_data_block
    assert "const currentData = freshData ?? userStore.getState().store.userData;" in load_data_block
    assert "setUserData(currentData);" in load_data_block
    assert "setAvatar(currentData.avatar_pic);" in load_data_block
    assert load_data_block.index("await refreshUserData(initialData.username)") < load_data_block.index("getAllUserAchievements(initialData.username)")
