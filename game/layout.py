# layout.py: connects the questions to the cube generator and back

def question_word(question):
    return question["normalized"].upper()


def build_generator_input(questions, priority=(), size=3):
    for i in priority:
        if isinstance(i, bool) or not isinstance(i, int) or not 0 <= i < len(questions):
            raise ValueError(f"Priority index {i!r} is not a valid question index")
    return {
        "Words": [question_word(q) for q in questions],
        "Priority": [question_word(questions[i]) for i in priority],
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


def generate_layout(questions, generate_fn, priority=(), size=3):
    output = generate_fn(build_generator_input(questions, priority, size))
    return output, link_layout(questions, output)