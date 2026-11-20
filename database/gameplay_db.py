from game.parser import DB_CONFIG, normalize


def _connect(db_config=None):
    import pymysql

    config = dict(db_config or DB_CONFIG)
    config.setdefault("cursorclass", pymysql.cursors.DictCursor)
    return pymysql.connect(**config)


def start_session(puzzle_id: int, host_id: int, player_ids=None, db_config=None) -> int:
    conn = _connect(db_config)
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO Game_Sessions (puzzle_id, host_id, score, status)
                VALUES (%s, %s, 0, 'active');
                """,
                (int(puzzle_id), int(host_id)),
            )
            session_id = cursor.lastrowid

            members = {int(host_id)}
            if player_ids:
                members.update(int(uid) for uid in player_ids)

            for uid in sorted(members):
                cursor.execute(
                    """
                    INSERT IGNORE INTO Session_Players (session_id, user_id, score)
                    VALUES (%s, %s, 0);
                    """,
                    (session_id, uid),
                )

        conn.commit()
        return session_id
    finally:
        conn.close()


def save_layout(
    session_id: int,
    seed: str,
    question_ids: list[int],
    cells: dict[int, list[tuple]],
    default_weight: float = 1.0,
    db_config=None,
) -> int:
    conn = _connect(db_config)
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO Layouts (session_id, seed)
                VALUES (%s, %s);
                """,
                (int(session_id), str(seed)[:50]),
            )
            layout_id = cursor.lastrowid

            for idx, qid in enumerate(question_ids):
                positions = cells.get(idx)
                if not positions:
                    continue
                pos = positions[0]
                cursor.execute(
                    """
                    INSERT INTO Layout_Placements (layout_id, question_id, pos_x, pos_y, pos_z, weight)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        pos_x = VALUES(pos_x),
                        pos_y = VALUES(pos_y),
                        pos_z = VALUES(pos_z),
                        weight = VALUES(weight);
                    """,
                    (
                        layout_id,
                        int(qid),
                        int(round(pos[0])),
                        int(round(pos[1])),
                        int(round(pos[2])),
                        float(default_weight),
                    ),
                )

        conn.commit()
        return layout_id
    finally:
        conn.close()


def record_guess(
    session_id: int,
    user_id: int,
    question_id: int,
    is_correct: bool,
    time_ms: int,
    score_delta: int = 0,
    db_config=None,
):
    conn = _connect(db_config)
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO Answer_Attempts (session_id, user_id, question_id, is_correct, time_ms)
                VALUES (%s, %s, %s, %s, %s);
                """,
                (int(session_id), int(user_id), int(question_id), bool(is_correct), int(time_ms)),
            )

            cursor.execute(
                """
                INSERT INTO User_Behavior_Stats (user_id, question_id, times_correct, times_wrong)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    times_correct = times_correct + VALUES(times_correct),
                    times_wrong = times_wrong + VALUES(times_wrong);
                """,
                (
                    int(user_id),
                    int(question_id),
                    1 if is_correct else 0,
                    0 if is_correct else 1,
                ),
            )

            if score_delta:
                cursor.execute(
                    """
                    UPDATE Session_Players
                    SET score = score + %s
                    WHERE session_id = %s AND user_id = %s;
                    """,
                    (int(score_delta), int(session_id), int(user_id)),
                )
                cursor.execute(
                    """
                    UPDATE Game_Sessions
                    SET score = score + %s
                    WHERE session_id = %s;
                    """,
                    (int(score_delta), int(session_id)),
                )

        conn.commit()
    finally:
        conn.close()


def complete_session(session_id: int, xp_awarded: int = 0, user_id: int | None = None, db_config=None):
    conn = _connect(db_config)
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                UPDATE Game_Sessions
                SET status = 'completed'
                WHERE session_id = %s;
                """,
                (int(session_id),),
            )

            if xp_awarded and user_id is not None:
                cursor.execute(
                    """
                    UPDATE Users
                    SET xp = xp + %s
                    WHERE user_id = %s;
                    """,
                    (int(xp_awarded), int(user_id)),
                )

        conn.commit()
    finally:
        conn.close()


def load_puzzle_questions(puzzle_id: int, db_config=None) -> list[dict]:
    conn = _connect(db_config)
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT q.question_id, q.prompt, q.answer
                FROM Questions q
                JOIN Puzzle_Questions pq ON q.question_id = pq.question_id
                WHERE pq.puzzle_id = %s
                ORDER BY q.question_id;
                """,
                (int(puzzle_id),),
            )
            rows = cursor.fetchall()
    finally:
        conn.close()

    return [
        {
            "id": row["question_id"],
            "question": row["prompt"],
            "answer": row["answer"],
            "normalized": normalize(row["answer"]),
            "image_url": None,
        }
        for row in rows
    ]


def schedule_review(user_id: int, question_id: int, delay_hours: int = 24, db_config=None):
    conn = _connect(db_config)
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO User_Behavior_Stats (user_id, question_id, next_review_at)
                VALUES (%s, %s, DATE_ADD(NOW(), INTERVAL %s HOUR))
                ON DUPLICATE KEY UPDATE
                    next_review_at = DATE_ADD(NOW(), INTERVAL %s HOUR);
                """,
                (int(user_id), int(question_id), int(delay_hours), int(delay_hours)),
            )
        conn.commit()
    finally:
        conn.close()
