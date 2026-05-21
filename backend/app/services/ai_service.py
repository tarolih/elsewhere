from dataclasses import dataclass


@dataclass
class AISummaryPayload:
    summary_text: str
    best_for: list[str]
    not_good_for: list[str]
    common_positives: list[str]
    common_negatives: list[str]


class AIService:
    def generate_summary(self, target_name: str, vibes: list[str]) -> AISummaryPayload:
        seed = sum(ord(c) for c in target_name) % 5
        positives = ["great vibe mix", "good value", "friendly locals", "easy to explore", "strong scene"]
        negatives = ["can get crowded", "weather varies", "transport gaps", "higher peak prices", "limited quiet spots"]
        return AISummaryPayload(
            summary_text=f"{target_name} is a strong pick for {', '.join(vibes[:2] or ['travelers'])}.",
            best_for=vibes[:3],
            not_good_for=["ultra-luxury only"] if seed % 2 == 0 else ["strictly low-budget"],
            common_positives=positives[:3],
            common_negatives=negatives[seed : seed + 2],
        )


ai_service = AIService()
