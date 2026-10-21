# parser.py: validates and cleans up the player's questions
import json

MIN_ANSWER_LENGTH = 3      # minimum length after normalizing
ALLOW_DUPLICATE_ANSWERS = False

def normalize(text):
    """Lowercase and keep only letters and digits: 'Group 6' -> 'group6'."""
    return "".join(ch for ch in text.lower() if ch.isalnum())

def parse_questions(raw_json):
    """Read a JSON string, then validate the questions in it."""
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON: {e}")
    return validate_questions(data)

def validate_questions(data):
    if not isinstance(data, list):
        raise ValueError("Top level must be a list of questions")
    if not data:
        raise ValueError("The question list is empty")

    questions = []
    errors = []

    seen = {}
    for i, item in enumerate(data, start=1):
        label = f"Question {i}"

        if not isinstance(item, dict):
            errors.append(f"{label}: must be an object with 'question' and 'answer'")
            continue

        text = item.get("question")
        answer = item.get("answer")
        image_url = item.get("image_url")
        problems = []

        if not isinstance(text, str) or not text.strip():
            problems.append("missing or empty 'question'")

        if isinstance(answer, (int, float)) and not isinstance(answer, bool):
            problems.append(
                f"answer {answer} contains only numbers "
                f"(must include at least one letter)"
            )
        elif not isinstance(answer, str) or not answer.strip():
            problems.append("missing or empty 'answer' (must be text)")
        else:
            norm = normalize(answer)

            if not norm:
                problems.append(
                    f'answer "{answer}" contains only punctuation or symbols '
                    f"(use letters or numbers)"
                )
            elif not any(ch.isalpha() for ch in norm):
                problems.append(
                    f'answer "{answer}" contains only numbers '
                    f"(must include at least one letter)"
                )
            elif len(norm) < MIN_ANSWER_LENGTH:
                problems.append(
                    f'answer "{answer}" is too short '
                    f"(minimum {MIN_ANSWER_LENGTH} letters/digits)"
                )
            elif not ALLOW_DUPLICATE_ANSWERS:
                if norm in seen:
                    problems.append(
                        f'answer "{answer}" is a duplicate of question {seen[norm]}'
                    )
                else:
                    seen[norm] = i

        if image_url is not None and (not isinstance(image_url, str) or not image_url.strip()):
            problems.append("'image_url' must be a non-empty string if provided")

        if problems:
            errors.append(f"{label}: " + "; ".join(problems))
            continue

        questions.append({
            "question": text.strip(),
            "answer": answer.strip(),
            "normalized": normalize(answer),
            "image_url": image_url.strip() if image_url else None,
        })

    if errors:
        raise ValueError("\n".join(errors))

    return questions