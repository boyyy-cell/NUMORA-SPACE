import ipaddress
from typing import List

from fastapi import Request

from backend.app.core.config import settings


def _trusted_proxy_networks() -> List[ipaddress.IPv4Network | ipaddress.IPv6Network]:
    return [
        ipaddress.ip_network(configured_proxy, strict=False)
        for configured_proxy in settings.TRUSTED_PROXIES
    ]


def get_client_ip(request: Request) -> str:
    client = request.client
    peer = client.host if client and client.host else "unknown"
    try:
        peer_address = ipaddress.ip_address(peer)
    except ValueError:
        return peer[:64]

    trusted_networks = _trusted_proxy_networks()
    if not any(peer_address in network for network in trusted_networks):
        return peer_address.compressed

    forwarded_for = request.headers.get("x-forwarded-for", "")
    if not forwarded_for or len(forwarded_for) > 512:
        return peer_address.compressed

    forwarded_addresses = [value.strip() for value in forwarded_for.split(",")]
    if not 1 <= len(forwarded_addresses) <= 20:
        return peer_address.compressed

    try:
        chain = [ipaddress.ip_address(value) for value in forwarded_addresses]
    except ValueError:
        return peer_address.compressed

    for address in reversed([*chain, peer_address]):
        if not any(address in network for network in trusted_networks):
            return address.compressed
    return chain[0].compressed
