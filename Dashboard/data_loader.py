"""
Module de chargement et aplatissement des données JSON.
Gestion robuste des schémas asymétriques avec Type Hints.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, TypedDict

import pandas as pd


class ChildRecord(TypedDict, total=False):
    """Schéma typé pour un enfant (verbatim)."""

    count: int
    long_description: str
    longDescription: str  # Variante camelCase


class RawRecord(TypedDict, total=False):
    """Schéma typé pour un enregistrement brut."""

    type: str
    group: str
    tag: str
    count: int
    longDescription: str
    long_description: str
    children: list[ChildRecord]


class FlattenedRecord(TypedDict):
    """Enregistrement aplati selon Group > Tag > Type."""

    group: str
    tag: str
    type: str
    count: int
    long_description: str


class VerbatimRecord(TypedDict):
    """Enregistrement verbatim (enfant) avec contexte parent."""

    group: str
    tag: str
    type: str
    parent_description: str
    verbatim: str
    weight: int


def _safe_str(value: Any, default: str = "") -> str:
    """Retourne une chaîne sûre, gère None et types inattendus."""
    if value is None:
        return default
    if isinstance(value, str):
        return value
    return str(value) if value != "" else default


def _safe_int(value: Any, default: int = 0) -> int:
    """Retourne un entier sûr."""
    if value is None:
        return default
    if isinstance(value, int):
        return value
    try:
        return int(float(value))
    except (ValueError, TypeError):
        return default


def _get_description(obj: dict[str, Any], *keys: str) -> str:
    """Récupère une description en essayant plusieurs clés (schéma asymétrique)."""
    for key in keys:
        if key in obj and obj[key]:
            return _safe_str(obj[key])
    return ""


def load_json(path: str | Path) -> list[RawRecord]:
    """
    Charge le fichier JSON avec gestion robuste des erreurs.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Fichier introuvable: {path}")

    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        data = [data] if data else []

    return [item for item in data if isinstance(item, dict)]


def flatten_records(records: list[RawRecord]) -> pd.DataFrame:
    """
    Aplatit récursivement selon la hiérarchie Group > Tag > Type.
    Chaque entrée parent devient une ligne avec son count agrégé.
    """
    rows: list[FlattenedRecord] = []

    for r in records:
        group = _safe_str(r.get("group"), "Non classé")
        tag = _safe_str(r.get("tag"), "Non classé")
        type_val = _safe_str(r.get("type"), "Non classé")
        count = _safe_int(r.get("count"))

        desc = _get_description(r, "longDescription", "long_description")

        rows.append(
            FlattenedRecord(
                group=group,
                tag=tag,
                type=type_val,
                count=count,
                long_description=desc or f"{tag} - {type_val}",
            )
        )

    return pd.DataFrame(rows)


def flatten_verbatims(records: list[RawRecord]) -> pd.DataFrame:
    """
    Aplatit les children (verbatims) avec leur contexte parent.
    """
    rows: list[VerbatimRecord] = []

    for r in records:
        group = _safe_str(r.get("group"), "Non classé")
        tag = _safe_str(r.get("tag"), "Non classé")
        type_val = _safe_str(r.get("type"), "Non classé")
        parent_desc = _get_description(r, "longDescription", "long_description")

        children = r.get("children")
        if not isinstance(children, list):
            continue

        for child in children:
            if not isinstance(child, dict):
                continue

            verbatim = _get_description(child, "long_description", "longDescription")
            weight = _safe_int(child.get("count"))

            if verbatim:
                rows.append(
                    VerbatimRecord(
                        group=group,
                        tag=tag,
                        type=type_val,
                        parent_description=parent_desc,
                        verbatim=verbatim,
                        weight=weight,
                    )
                )

    return pd.DataFrame(rows)


def load_and_flatten(path: str | Path) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Charge le JSON et retourne (df aplati, df verbatims).
    """
    raw = load_json(path)
    df_flat = flatten_records(raw)
    df_verb = flatten_verbatims(raw)
    return df_flat, df_verb
