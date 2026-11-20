import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database.gameplay_db import (
    _connect,
    complete_session,
    load_puzzle_questions,
    record_guess,
    save_layout,
    schedule_review,
    start_session,
)
from game.parser import parse_and_save_questions

fastAPICode = FastAPI(title="Crossy Word API")

fastAPICode.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StartSessionRequest(BaseModel):
    puzzle_id: int
    host_id: int
    player_ids: list[int] | None = None


class SaveLayoutRequest(BaseModel):
    seed: str
    question_ids: list[int]
    cells: dict[int, list[list[float]]]
    default_weight: float = 1.0


class RecordGuessRequest(BaseModel):
    user_id: int
    question_id: int
    is_correct: bool
    time_ms: int
    score_delta: int = 0


class ScheduleReviewRequest(BaseModel):
    user_id: int
    question_id: int
    delay_hours: int = 24


class CompleteSessionRequest(BaseModel):
    xp_awarded: int = 0
    user_id: int | None = None


class CreatePuzzleRequest(BaseModel):
    creator_id: int
    title: str
    visibility: str = "public"
    group_id: int | None = None
    questions: list[dict]


@fastAPICode.get("/health")
def health():
    conn = _connect()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1 AS ok;")
            row = cursor.fetchone()
        return {"status": "ok", "db": row["ok"] == 1}
    finally:
        conn.close()


@fastAPICode.get("/puzzles/{puzzle_id}/questions")
def get_questions(puzzle_id: int):
    return {"puzzle_id": puzzle_id, "questions": load_puzzle_questions(puzzle_id)}


@fastAPICode.post("/puzzles")
def create_puzzle(req: CreatePuzzleRequest):
    conn = _connect()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO Puzzles (creator_id, group_id, title, visibility)
                VALUES (%s, %s, %s, %s);
                """,
                (req.creator_id, req.group_id, req.title.strip(), req.visibility),
            )
            puzzle_id = cursor.lastrowid
            cursor.execute(
                """
                INSERT IGNORE INTO User_Library (user_id, puzzle_id)
                VALUES (%s, %s);
                """,
                (req.creator_id, puzzle_id),
            )
        conn.commit()
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        conn.close()

    try:
        raw_questions = (
            json.dumps(req.questions)
            if isinstance(req.questions, (list, dict))
            else req.questions
        )
        saved = parse_and_save_questions(
            raw_questions,
            creator_id=req.creator_id,
            puzzle_id=puzzle_id,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {"puzzle_id": puzzle_id, "saved_questions": saved}


@fastAPICode.post("/sessions/start")
def api_start_session(req: StartSessionRequest):
    session_id = start_session(
        puzzle_id=req.puzzle_id,
        host_id=req.host_id,
        player_ids=req.player_ids,
    )
    return {"session_id": session_id}


@fastAPICode.post("/sessions/{session_id}/layout")
def api_save_layout(session_id: int, req: SaveLayoutRequest):
    typed_cells = {
        int(k): [tuple(pt) for pt in v]
        for k, v in req.cells.items()
    }
    layout_id = save_layout(
        session_id=session_id,
        seed=req.seed,
        question_ids=req.question_ids,
        cells=typed_cells,
        default_weight=req.default_weight,
    )
    return {"layout_id": layout_id}


@fastAPICode.post("/sessions/{session_id}/guess")
def api_record_guess(session_id: int, req: RecordGuessRequest):
    record_guess(
        session_id=session_id,
        user_id=req.user_id,
        question_id=req.question_id,
        is_correct=req.is_correct,
        time_ms=req.time_ms,
        score_delta=req.score_delta,
    )
    return {"recorded": True}


@fastAPICode.post("/sessions/{session_id}/review")
def api_schedule_review(session_id: int, req: ScheduleReviewRequest):
    schedule_review(
        user_id=req.user_id,
        question_id=req.question_id,
        delay_hours=req.delay_hours,
    )
    return {"session_id": session_id, "scheduled": True}


@fastAPICode.post("/sessions/{session_id}/complete")
def api_complete_session(session_id: int, req: CompleteSessionRequest):
    complete_session(
        session_id=session_id,
        xp_awarded=req.xp_awarded,
        user_id=req.user_id,
    )
    return {"session_id": session_id, "status": "completed"}



