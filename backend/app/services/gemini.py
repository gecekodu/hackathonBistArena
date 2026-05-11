from __future__ import annotations

import json
import re
from typing import Any

from ..settings import settings


def get_gemini_status() -> dict[str, Any]:
    return {
        'enabled': bool(settings.gemini_api_key),
        'model': settings.gemini_model,
    }


def build_ai_coach_report(context: dict[str, Any]) -> dict[str, Any]:
    fallback = _fallback_report(context)

    if not settings.gemini_api_key:
        return fallback

    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(settings.gemini_model)
        prompt = _build_prompt(context)
        response = model.generate_content(prompt)
        text = getattr(response, 'text', '') or ''
        parsed = _extract_json(text)
        if parsed:
            return {
                'summary': str(parsed.get('summary') or fallback['summary']),
                'warnings': _normalize_warnings(parsed.get('warnings')) or fallback['warnings'],
                'focus': str(parsed.get('focus') or fallback['focus']),
            }
    except Exception:
        pass

    return fallback


def _build_prompt(context: dict[str, Any]) -> str:
    return f"""
Sen BISTMind AI için eğitim odaklı davranışsal finans koçusun.
Yatırım tavsiyesi verme, sadece davranış kalıplarını açıkla.
Türkçe ve net konuş.
Çıktıyı sadece JSON olarak döndür.

Şema:
{{
  "summary": "Kısa günlük koç özeti",
  "warnings": ["davranışsal uyarı 1", "uyarı 2"],
  "focus": "Bugün odaklanılacak davranış"
}}

Bağlam:
{json.dumps(context, ensure_ascii=False, indent=2)}
""".strip()


def _fallback_report(context: dict[str, Any]) -> dict[str, Any]:
    profile = context.get('profile', 'Conservative Investor')
    risk_score = context.get('riskScore', 50)
    discipline_score = context.get('disciplineScore', 50)
    warnings = list(context.get('warnings') or [])

    if risk_score >= 75:
        warnings.append('Risk iştahın yükselmiş; işlem boyutlarını kontrol et.')
    if discipline_score < 70:
        warnings.append('İşlem öncesi kısa bekleme kuralı eklemek faydalı olabilir.')

    return {
        'summary': f'Bugün profilin {profile.lower()} çizgisine yakın. Risk skoru {risk_score}, disiplin skoru {discipline_score}.',
        'warnings': _unique(warnings) or ['Davranış örüntüsü şu an dengeli görünüyor.'],
        'focus': 'Sakin karar, kontrollü pozisyon boyutu ve daha iyi çeşitlendirme',
    }


def _extract_json(text: str) -> dict[str, Any] | None:
    cleaned = text.strip()
    if cleaned.startswith('```'):
        cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
        cleaned = re.sub(r'\s*```$', '', cleaned)
    try:
        payload = json.loads(cleaned)
        if isinstance(payload, dict):
            return payload
    except Exception:
        return None
    return None


def _normalize_warnings(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(item) for item in value if str(item).strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def _unique(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in values:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result
