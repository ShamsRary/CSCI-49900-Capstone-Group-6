def get_pattern(normalized_answer, shown):
    """Show the letters marked True in `shown`, hide the rest: 'g _ o _ _ _'."""
    return " ".join(
        ch if shown[i] else "_"
        for i, ch in enumerate(normalized_answer)
    )

def get_hint(normalized_answer, hints_used):
    """Show the first `hints_used` characters, hide the rest: 'g _ _ _ _ _'."""
    count = max(0, min(hints_used, len(normalized_answer)))
    return get_pattern(normalized_answer, [i < count for i in range(len(normalized_answer))])