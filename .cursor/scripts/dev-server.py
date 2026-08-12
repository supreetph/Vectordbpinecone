#!/usr/bin/env python3
from __future__ import annotations

import http.server
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

PORT = int(os.environ.get("DEV_SERVER_PORT", "8080"))
WORKSPACE = Path("/workspace")
PINECONE_HOST = os.environ.get(
    "PINECONE_HOST",
    "https://sample-movies-l7cyesi.svc.aped-4627-b74a.pinecone.io",
)
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY", "")


class DevServerHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WORKSPACE), **kwargs)

    def do_GET(self) -> None:
        if self.path.startswith("/pinecone/"):
            self.proxy_pinecone("GET")
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.path.startswith("/pinecone/"):
            self.proxy_pinecone("POST")
            return
        self.send_error(404, "Not Found")

    def proxy_pinecone(self, method: str) -> None:
        if not PINECONE_API_KEY:
            self.send_response(503)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(
                json.dumps(
                    {
                        "error": "PINECONE_API_KEY is not configured in the environment.",
                    }
                ).encode("utf-8")
            )
            return

        upstream_path = self.path.removeprefix("/pinecone")
        upstream_url = f"{PINECONE_HOST}{upstream_path}"
        body = self.rfile.read(int(self.headers.get("Content-Length", "0") or "0"))

        request = urllib.request.Request(
            upstream_url,
            data=body or None,
            method=method,
            headers={
                "Api-Key": PINECONE_API_KEY,
                "Content-Type": self.headers.get("Content-Type", "application/json"),
            },
        )

        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                payload = response.read()
                self.send_response(response.status)
                self.send_header("Content-Type", response.headers.get("Content-Type", "application/json"))
                self.end_headers()
                self.wfile.write(payload)
        except urllib.error.HTTPError as error:
            payload = error.read()
            self.send_response(error.code)
            self.send_header("Content-Type", error.headers.get("Content-Type", "application/json"))
            self.end_headers()
            self.wfile.write(payload)
        except urllib.error.URLError as error:
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(error.reason)}).encode("utf-8"))

    def log_message(self, format: str, *args) -> None:
        sys.stdout.write("%s - %s\n" % (self.address_string(), format % args))


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(("0.0.0.0", PORT), DevServerHandler)
    print(f"Serving {WORKSPACE} on http://0.0.0.0:{PORT}/", flush=True)
    print(f"Pinecone proxy prefix: /pinecone -> {PINECONE_HOST}", flush=True)
    server.serve_forever()
