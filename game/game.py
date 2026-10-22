from game.hints import get_hint
from game.parser import normalize

NOT_STARTED = "not_started"
PLAYING = "playing"
FINISHED = "finished"


def check_answer(question, guess):
    """True if the guess matches the question's answer (ignores case, spaces, punctuation)."""
    if not isinstance(guess, str):
        return False
    return normalize(guess) == question["normalized"]


class Game:
    def __init__(self, questions):
        if not questions:
            raise ValueError("A game needs at least one question")
        self.questions = questions
        self.status = NOT_STARTED
        self.solved = [False] * len(questions)
        self.wrong_attempts = [0] * len(questions)
        self.hints_used = [0] * len(questions)

    def start(self):
        if self.status != NOT_STARTED:
            raise ValueError("Game has already started")
        self.status = PLAYING

    def end(self):
        if self.status != PLAYING:
            raise ValueError("Game is not in progress")
        self.status = FINISHED

    def unsolved(self):
        return [i for i, done in enumerate(self.solved) if not done]

    def struggle_ranking(self):
        scored = [
            (self.wrong_attempts[i] + self.hints_used[i], i)
            for i in range(len(self.questions))
        ]
        scored = [(s, i) for s, i in scored if s > 0]
        scored.sort(key=lambda pair: (-pair[0], pair[1]))
        return [i for _, i in scored]

    def submit_answer(self, index, guess):
        self._require_playing()
        self._require_valid_index(index)
        if self.solved[index]:
            raise ValueError(f"Question {index} is already solved")

        correct = check_answer(self.questions[index], guess)
        if correct:
            self.solved[index] = True
            if all(self.solved):
                self.status = FINISHED
        else:
            self.wrong_attempts[index] += 1

        return {"correct": correct, "finished": self.status == FINISHED}


    def use_hint(self, index):
        self._require_playing()
        self._require_valid_index(index)
        if self.solved[index]:
            raise ValueError(f"Question {index} is already solved")

        answer = self.questions[index]["normalized"]
        if self.hints_used[index] < len(answer):
            self.hints_used[index] += 1
        return get_hint(answer, self.hints_used[index])

    
    def snapshot(self):
        """Plain data the page can display. Answers are not included."""
        return {
            "status": self.status,
            "questions": [
                {
                    "number": i + 1,
                    "question": q["question"],
                    "image_url": q["image_url"],
                    "length": len(q["normalized"]),
                    "solved": self.solved[i],
                    "wrong_attempts": self.wrong_attempts[i],
                    "hints_used": self.hints_used[i],
                }
                for i, q in enumerate(self.questions)
            ],
        }

    def _require_playing(self):
        if self.status != PLAYING:
            raise ValueError("Game is not in progress")

    def _require_valid_index(self, index):
        if isinstance(index, bool) or not isinstance(index, int):
            raise ValueError("Question index must be an integer")
        if not 0 <= index < len(self.questions):
            raise ValueError(f"No question at index {index}")