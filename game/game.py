from game.hints import get_hint, get_pattern
from game.layout import link_layout
from game.parser import normalize

NOT_STARTED = "not_started"
PLAYING = "playing"
FINISHED = "finished"

GIVE_UP_SCORE = 3

def check_answer(question, guess):
    """True if the guess matches the question's answer (ignores case, spaces, punctuation)."""
    if not isinstance(guess, str):
        return False
    return normalize(guess) == question["normalized"]

class Game:
    """One round of the game. Expects questions that went through validate_questions."""
    def __init__(self, questions):
        if not questions:
            raise ValueError("A game needs at least one question")
        self.questions = questions
        self.status = NOT_STARTED
        self.solved = [False] * len(questions)
        self.wrong_attempts = [0] * len(questions)
        self.hints_used = [0] * len(questions)
        self.given_up = [False] * len(questions)
        self.cells = None        # {question index: [cube positions]} once a layout is set
        self.revealed = set()    # cube positions whose letters are visible (hints and solved words)

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

    def set_layout(self, generator_output):
        """Tell the game where each word sits (the generator's output, with a "Words" entry)."""
        if self.revealed:
            raise ValueError("The layout can't change once letters are revealed")
        cells = link_layout(self.questions, generator_output)
        letters = {}
        for i, positions in cells.items():
            word = self.questions[i]["normalized"]
            if len(positions) != len(word):
                raise ValueError(f"Question {i} has {len(positions)} cells for {len(word)} letters")
            for pos, ch in zip(positions, word):
                if letters.setdefault(pos, ch) != ch:
                    raise ValueError(f"Cell {pos} is shared by words with different letters")
        self.cells = cells
        for i in range(len(self.questions)):
            if self.solved[i]:
                self.revealed.update(self.cells[i])

    def _show_word(self, index):
        if self.cells is not None:
            self.revealed.update(self.cells[index])

    def _pattern(self, index):
        word = self.questions[index]["normalized"]
        if self.solved[index]:
            return get_pattern(word, [True] * len(word))
        if self.cells is None:
            return get_hint(word, self.hints_used[index])
        return get_pattern(word, [pos in self.revealed for pos in self.cells[index]])

    def submit_answer(self, index, guess):
        self._require_playing()
        self._require_valid_index(index)
        if self.solved[index]:
            raise ValueError(f"Question {index} is already solved")

        correct = check_answer(self.questions[index], guess)
        if correct:
            self.solved[index] = True
            self._show_word(index)
            if all(self.solved):
                self.status = FINISHED
        else:
            self.wrong_attempts[index] += 1

        return {"correct": correct, "finished": self.status == FINISHED}

    def use_hint(self, index):
        """Reveal one more letter. Letters already showing (for example from a solved
        crossing word) are skipped, and a hint that reveals nothing is not counted."""
        self._require_playing()
        self._require_valid_index(index)
        if self.solved[index]:
            raise ValueError(f"Question {index} is already solved")

        if self.cells is None:
            answer = self.questions[index]["normalized"]
            if self.hints_used[index] < len(answer):
                self.hints_used[index] += 1
            return get_hint(answer, self.hints_used[index])

        for pos in self.cells[index]:
            if pos not in self.revealed:
                self.revealed.add(pos)
                self.hints_used[index] += 1
                break
        return self._pattern(index)

    def reveal(self, index):
        """Show the answer (give up on this question). It counts as solved, but not as earned."""
        self._require_playing()
        self._require_valid_index(index)
        if self.solved[index]:
            raise ValueError(f"Question {index} is already solved")

        self.solved[index] = True
        self.given_up[index] = True
        self._show_word(index)
        if all(self.solved):
            self.status = FINISHED
        return {"answer": self.questions[index]["answer"], "finished": self.status == FINISHED}

    def _score(self, index):
        score = self.wrong_attempts[index] + self.hints_used[index]
        if self.given_up[index]:
            score += GIVE_UP_SCORE
        return score

    def struggle_ranking(self):
        """Question indexes the player had trouble with, worst first.

        Score = wrong attempts + hints used (+ GIVE_UP_SCORE if they gave up).
        Questions with a score of 0 are left out.
        """
        scored = [(self._score(i), i) for i in range(len(self.questions))]
        scored = [(s, i) for s, i in scored if s > 0]
        scored.sort(key=lambda pair: (-pair[0], pair[1]))
        return [i for _, i in scored]

    def priority_indexes(self, limit=None):
        """The struggled questions to pass to the generator as priority words."""
        ranking = self.struggle_ranking()
        return ranking if limit is None else ranking[:limit]

    def behavior_summary(self):
        """Per-question behavior, plus the ranking (question indexes, worst first)."""
        return {
            "questions": [
                {
                    "number": i + 1,
                    "solved": self.solved[i],
                    "gave_up": self.given_up[i],
                    "wrong_attempts": self.wrong_attempts[i],
                    "hints_used": self.hints_used[i],
                    "score": self._score(i),
                }
                for i in range(len(self.questions))
            ],
            "ranking": self.struggle_ranking(),
        }

    def snapshot(self):
        """Plain data the page can display. Unsolved answers are not included."""
        return {
            "status": self.status,
            "layout_set": self.cells is not None,
            "revealed": [list(pos) for pos in sorted(self.revealed)],
            "questions": [
                {
                    "number": i + 1,
                    "question": q["question"],
                    "image_url": q["image_url"],
                    "length": len(q["normalized"]),
                    "solved": self.solved[i],
                    "gave_up": self.given_up[i],
                    "wrong_attempts": self.wrong_attempts[i],
                    "hints_used": self.hints_used[i],
                    "pattern": self._pattern(i),
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