# layout.py: connects the questions to the cube generator and back

DEFAULT_INTERSECTION_BIAS = 10


def check_intersection_bias(value):
    """The generator needs a number, 0 or more. Raises ValueError otherwise."""
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError("Intersection bias must be a number")
    if value != value or value in (float("inf"), float("-inf")) or value < 0:
        raise ValueError("Intersection bias must be a number, 0 or more")


def question_word(question):
    return question["normalized"].upper()


def build_generator_input(questions, priority=(), size=3, intersection_bias=DEFAULT_INTERSECTION_BIAS):
    """Make the input dict the generator expects: Words, Priority, IntersectionBias, Size.

    `priority` is a list of question indexes to place first (for example the
    questions the player struggled with). `intersection_bias` makes the generator
    prefer more word crossings over keeping the cube balanced (0 turns it off).
    """
    for i in priority:
        if isinstance(i, bool) or not isinstance(i, int) or not 0 <= i < len(questions):
            raise ValueError(f"Priority index {i!r} is not a valid question index")
    check_intersection_bias(intersection_bias)
    return {
        "Words": [question_word(q) for q in questions],
        "Priority": [question_word(questions[i]) for i in priority],
        "IntersectionBias": intersection_bias,
        "Size": size,
    }


def link_layout(questions, generator_output):
    placed = generator_output["Words"]
    cells = {}
    for i, q in enumerate(questions):
        word = question_word(q)
        if word not in placed:
            raise ValueError(f"The generator has no placement for question {i} ({word})")
        cells[i] = [tuple(cell) for cell in placed[word]]
    return cells


def generate_layout(questions, generate_fn, priority=(), size=3, intersection_bias=DEFAULT_INTERSECTION_BIAS):
    output = generate_fn(build_generator_input(questions, priority, size, intersection_bias))
    return output, link_layout(questions, output)