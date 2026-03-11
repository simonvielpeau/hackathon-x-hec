"""
Dashboard Executive Grade - Streamlit
Hiérarchie: Group > Tag > Type > Children
Design épuré type Consulting Dashboard.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

from data_loader import load_and_flatten

# Configuration page
st.set_page_config(
    page_title="Executive Dashboard - Audit CX",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Style Consulting Dashboard
st.markdown(
    """
    <style>
    /* Typographie épurée */
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    /* Header */
    .main-header {
        font-size: 1.75rem;
        font-weight: 600;
        color: #1a1a2e;
        letter-spacing: -0.02em;
        margin-bottom: 0.5rem;
    }
    
    .sub-header {
        font-size: 0.9rem;
        color: #64748b;
        font-weight: 400;
        margin-bottom: 2rem;
    }
    
    /* KPI cards */
    .kpi-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem 1.5rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        transition: box-shadow 0.2s;
    }
    
    .kpi-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    
    .kpi-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1a1a2e;
        line-height: 1.2;
    }
    
    .kpi-label {
        font-size: 0.8rem;
        color: #64748b;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: 0.25rem;
    }
    
    .kpi-card.irritant {
        border-left: 4px solid #ef4444;
    }
    
    .kpi-card.appreciated {
        border-left: 4px solid #22c55e;
    }
    
    /* Section titles */
    .section-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #1a1a2e;
        margin: 2rem 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e2e8f0;
    }
    
    /* Sidebar */
    .css-1d391kg {
        background: #f8fafc;
    }
    
    /* Hide streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    </style>
    """,
    unsafe_allow_html=True,
)

# Cache des données
DATA_PATH = Path(__file__).parent.parent / "data.json"


@st.cache_data
def get_data() -> tuple[pd.DataFrame, pd.DataFrame]:
    """Charge et met en cache les données aplaties."""
    return load_and_flatten(DATA_PATH)


def main() -> None:
    df_flat, df_verb = get_data()

    # Header
    st.markdown('<p class="main-header">Executive Dashboard — Audit CX</p>', unsafe_allow_html=True)
    st.markdown(
        '<p class="sub-header">Analyse hiérarchique — Group > Tag > Type > Children</p>',
        unsafe_allow_html=True,
    )

    # Sidebar — Filtres dynamiques
    st.sidebar.markdown("### Filtres")
    st.sidebar.markdown("---")

    groups: list[str] = sorted(df_flat["group"].dropna().unique().tolist())
    tags: list[str] = sorted(df_flat["tag"].dropna().unique().tolist())
    types: list[str] = sorted(df_flat["type"].dropna().unique().tolist())

    all_groups = "Tous les groupes"
    all_tags = "Tous les tags"
    all_types = "Tous les types"

    selected_group = st.sidebar.selectbox(
        "Groupe",
        [all_groups] + groups,
        index=0,
    )
    selected_tag = st.sidebar.selectbox(
        "Tag",
        [all_tags] + tags,
        index=0,
    )
    selected_type = st.sidebar.selectbox(
        "Type",
        [all_types] + types,
        index=0,
    )

    # Application des filtres
    df_filtered = df_flat.copy()
    if selected_group != all_groups:
        df_filtered = df_filtered[df_filtered["group"] == selected_group]
    if selected_tag != all_tags:
        df_filtered = df_filtered[df_filtered["tag"] == selected_tag]
    if selected_type != all_types:
        df_filtered = df_filtered[df_filtered["type"] == selected_type]

    df_verb_filtered = df_verb.copy()
    if selected_group != all_groups:
        df_verb_filtered = df_verb_filtered[df_verb_filtered["group"] == selected_group]
    if selected_tag != all_tags:
        df_verb_filtered = df_verb_filtered[df_verb_filtered["tag"] == selected_tag]
    if selected_type != all_types:
        df_verb_filtered = df_verb_filtered[df_verb_filtered["type"] == selected_type]

    # KPIs
    total_volume = int(df_filtered["count"].sum())
    irritant_type = "Irritant / Point de rupture"
    irritant_volume = int(
        df_filtered.loc[df_filtered["type"] == irritant_type, "count"].sum()
    )
    irritant_ratio = (
        irritant_volume / total_volume * 100 if total_volume > 0 else 0.0
    )

    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(
            f"""
            <div class="kpi-card">
                <div class="kpi-value">{total_volume:,}</div>
                <div class="kpi-label">Volume total</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with col2:
        st.markdown(
            f"""
            <div class="kpi-card irritant">
                <div class="kpi-value">{irritant_volume:,}</div>
                <div class="kpi-label">Irritants</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with col3:
        st.markdown(
            f"""
            <div class="kpi-card">
                <div class="kpi-value">{irritant_ratio:.1f}%</div>
                <div class="kpi-label">Ratio irritants</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with col4:
        ratio_appreciated = (
            df_filtered.loc[
                df_filtered["type"] == "Élément apprécié / Coup de coeur", "count"
            ].sum()
            / total_volume
            * 100
            if total_volume > 0
            else 0
        )
        st.markdown(
            f"""
            <div class="kpi-card appreciated">
                <div class="kpi-value">{ratio_appreciated:.1f}%</div>
                <div class="kpi-label">Ratio coups de cœur</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    # Ratio irritants par catégorie (Group)
    st.markdown(
        '<p class="section-title">Ratio irritants par catégorie</p>',
        unsafe_allow_html=True,
    )
    volume_by_group = df_filtered.groupby("group")["count"].sum().reset_index(
        name="volume"
    )
    irritant_by_group = (
        df_filtered[df_filtered["type"] == irritant_type]
        .groupby("group")["count"]
        .sum()
        .reset_index(name="irritants")
    )
    agg = volume_by_group.merge(irritant_by_group, on="group", how="left")
    agg["irritants"] = agg["irritants"].fillna(0)
    agg["ratio_irritants"] = (
        (agg["irritants"] / agg["volume"] * 100).round(1).astype(str) + " %"
    )
    agg = agg.sort_values("irritants", ascending=False)

    st.dataframe(
        agg.rename(
            columns={
                "group": "Catégorie",
                "volume": "Volume",
                "irritants": "Irritants",
                "ratio_irritants": "Ratio irritants",
            }
        ),
        use_container_width=True,
        height=min(250, 50 + len(agg) * 35),
    )

    st.markdown("---")

    # Treemap
    st.markdown('<p class="section-title">Arborescence — Treemap</p>', unsafe_allow_html=True)

    treemap_df = (
        df_filtered.groupby(["group", "tag", "type"], as_index=False)["count"]
        .sum()
        .sort_values("count", ascending=False)
    )

    fig_treemap = px.treemap(
        treemap_df,
        path=["group", "tag", "type"],
        values="count",
        color="count",
        color_continuous_scale="Blues",
        title="",
    )
    fig_treemap.update_layout(
        margin=dict(t=10, l=10, r=10, b=10),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#1a1a2e", size=12),
        coloraxis_showscale=False,
        height=450,
    )
    fig_treemap.update_traces(
        textinfo="label+value",
        hovertemplate="<b>%{label}</b><br>Count: %{value}<extra></extra>",
    )
    st.plotly_chart(fig_treemap, use_container_width=True)

    # Top 10 points de friction
    st.markdown(
        '<p class="section-title">Top 10 — Points de friction majeurs</p>',
        unsafe_allow_html=True,
    )

    friction_df = (
        df_filtered[df_filtered["type"] == irritant_type]
        .groupby(["group", "tag", "long_description"], as_index=False)["count"]
        .sum()
        .sort_values("count", ascending=True)
        .tail(10)
    )

    friction_df["label"] = (
        friction_df["tag"].str[:50]
        + " — "
        + friction_df["long_description"].str[:60].fillna("")
    )

    if len(friction_df) > 0:
        fig_bar = go.Figure(
            go.Bar(
                x=friction_df["count"],
                y=friction_df["label"],
                orientation="h",
                marker=dict(
                    color=friction_df["count"],
                    colorscale="Reds",
                    line=dict(width=0),
                ),
                text=friction_df["count"],
                textposition="outside",
                texttemplate="%{text:,}",
            )
        )
        fig_bar.update_layout(
            margin=dict(t=20, l=20, r=80, b=20),
            xaxis_title="Volume",
            yaxis=dict(autorange="reversed", tickfont=dict(size=11)),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(color="#1a1a2e"),
            height=400,
            showlegend=False,
        )
        st.plotly_chart(fig_bar, use_container_width=True)
    else:
        st.info("Aucun irritant dans la sélection actuelle.")

    # Audit Verbatim
    st.markdown(
        '<p class="section-title">Audit Verbatim</p>',
        unsafe_allow_html=True,
    )

    verbatim_search = st.text_input(
        "Rechercher dans les descriptions",
        placeholder="Ex: machine, service, casino...",
        key="verbatim_search",
    )

    df_verb_display = df_verb_filtered.copy()
    if verbatim_search:
        mask = (
            df_verb_display["verbatim"].str.contains(
                verbatim_search, case=False, na=False
            )
            | df_verb_display["parent_description"].str.contains(
                verbatim_search, case=False, na=False
            )
        )
        df_verb_display = df_verb_display[mask]

    df_verb_display = df_verb_display.sort_values("weight", ascending=False)

    st.dataframe(
        df_verb_display[
            ["group", "tag", "type", "parent_description", "verbatim", "weight"]
        ].rename(
            columns={
                "parent_description": "Description parent",
                "verbatim": "Verbatim",
                "weight": "Poids",
            }
        ),
        use_container_width=True,
        height=400,
    )


if __name__ == "__main__":
    main()
