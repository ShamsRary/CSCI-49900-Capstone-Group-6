#will update this file later to fix 
def get_hint(normalized_answer, hints_used):
    """Show the first `hints_used` characters, hide the rest: 'g _ _ _ _ _'."""
    shown = max(0, min(hints_used, len(normalized_answer)))
    chars = [
        ch if i < shown else "_"
        for i, ch in enumerate(normalized_answer)
    ]
    return " ".join(chars) 













