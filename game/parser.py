# parser.py: validates and cleans up the player's questions
import json
import os

MIN_ANSWER_LENGTH = 3      # minimum length after normalizing
ALLOW_DUPLICATE_ANSWERS = False

DB_CONFIG = { # added by shams for database connection (backend/Python scripts only)
    "host": os.getenv("DB_HOST", "100.70.195.74"), # Tailscale IP address of the MySQL Server
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER", "crossy_dev"),
    "password": os.getenv("DB_PASSWORD", "CrossyWordDev2026!"), # allows for SELECT, INSERT, UPDATE, DELETE ON crossy-word-mysql_db
    "database": os.getenv("DB_NAME", "crossy-word-mysql_db"), # dont expose this in the frontend, use environment variables or a config file
    "charset": "utf8mb4",
}

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

#SHAMS ADDED BELOW FOR DATABASE INSERTION OF QUESTIONS
def save_questions_to_db(questions, creator_id=1, category=None, difficulty=1, puzzle_id=None, db_config=None):
    import pymysql

    config = dict(db_config or DB_CONFIG)
    config.setdefault("cursorclass", pymysql.cursors.DictCursor)
    inserted_ids = []

    conn = pymysql.connect(**config)
    try:
        with conn.cursor() as cursor:
            insert_question_sql = """
                INSERT INTO Questions (creator_id, prompt, answer)
                VALUES (%s, %s, %s);
            """
            link_puzzle_sql = """
                INSERT IGNORE INTO Puzzle_Questions (puzzle_id, question_id)
                VALUES (%s, %s);
            """
            for q in questions:
                cursor.execute(
                    insert_question_sql,
                    (creator_id, q["question"], q["answer"]),
                )
                question_id = cursor.lastrowid
                inserted_ids.append(question_id)

                if puzzle_id is not None:
                    cursor.execute(link_puzzle_sql, (puzzle_id, question_id))

        conn.commit()
    finally:
        conn.close()

    return inserted_ids

def parse_and_save_questions(raw_json, creator_id=1, category=None, difficulty=1, puzzle_id=None, db_config=None):
    validated = parse_questions(raw_json)
    inserted_ids = save_questions_to_db(
        validated,
        creator_id=creator_id,
        category=category,
        difficulty=difficulty,
        puzzle_id=puzzle_id,
        db_config=db_config,
    )
    return validated, inserted_ids