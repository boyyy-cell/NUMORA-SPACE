from typing import Dict

from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Receive, Scope, Send


class RequestBodyLimitMiddleware:
    def __init__(self, app: ASGIApp, route_limits: Dict[str, int]):
        self.app = app
        self.route_limits = {
            path.rstrip("/") or "/": limit
            for path, limit in route_limits.items()
        }

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "").rstrip("/") or "/"
        limit = self.route_limits.get(path)
        if limit is None:
            await self.app(scope, receive, send)
            return

        headers = dict(scope.get("headers", []))
        raw_content_length = headers.get(b"content-length")
        if raw_content_length is not None:
            try:
                content_length = int(raw_content_length)
            except ValueError:
                await self._reject(scope, receive, send, 400, "Invalid Content-Length.")
                return
            if content_length < 0:
                await self._reject(scope, receive, send, 400, "Invalid Content-Length.")
                return
            if content_length > limit:
                await self._reject(scope, receive, send, 413, "Request body too large.")
                return

        chunks = []
        body_size = 0
        while True:
            message = await receive()
            if message["type"] == "http.disconnect":
                return
            if message["type"] != "http.request":
                continue

            chunk = message.get("body", b"")
            body_size += len(chunk)
            if body_size > limit:
                await self._reject(scope, receive, send, 413, "Request body too large.")
                return
            chunks.append(chunk)
            if not message.get("more_body", False):
                break

        body = b"".join(chunks)
        body_sent = False

        async def replay_body():
            nonlocal body_sent
            if body_sent:
                return {"type": "http.disconnect"}
            body_sent = True
            return {"type": "http.request", "body": body, "more_body": False}

        await self.app(scope, replay_body, send)

    @staticmethod
    async def _reject(
        scope: Scope,
        receive: Receive,
        send: Send,
        status_code: int,
        message: str,
    ) -> None:
        response = JSONResponse(
            status_code=status_code,
            content={"detail": message},
        )
        await response(scope, receive, send)
