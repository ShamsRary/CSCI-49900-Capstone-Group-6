import cmath, typing

Vec = tuple[float, float, float]
VecSpace = dict[Vec, Vec]

Adjacents: tuple[Vec, Vec, Vec, Vec, Vec, Vec] = (
    (0, 0, -1), (0, 0, 1),
    (0, -1, 0), (0, 1, 0),
    (-1, 0, 0), (1, 0, 0),
)

#simple vector operations

def VecAdd(a: Vec, b: Vec) -> Vec:
    return a[0] + b[0], a[1] + b[1], a[2] + b[2]
def VecSub(a: Vec, b: Vec) -> Vec:
    return a[0] - b[0], a[1] - b[1], a[2] - b[2]
def VecNeg(a: Vec) -> Vec:
    return -a[0], -a[1], -a[2]
def VecDot(a: Vec, b: Vec) -> float:
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]

"""
Calculates the center of mass when provided with a hashmap of coordinates.
Optionally include an additional list of coordinates not already included in the hashmap.
"""
def CoM(hash: dict[Vec, typing.Any], add: list[Vec]=[]) -> Vec:
    x, y, z = 0, 0, 0
    c: int = 0
    for pos in hash:
        x += pos[0]
        y += pos[1]
        z += pos[2]
        c += 1
    for pos in add:
        if pos not in hash:
            x += pos[0]
            y += pos[1]
            z += pos[2]
            c += 1
    return (x / c, y / c, z / c)

"""
Words should all be uppercase; duplicate words are ignored.
Size will automatically grow if the algorithm was unable to fit all input words.
Priority words are evaluated first in arbitrary order and placed at spots to intentionally cause imbalance.
Every other word are sorted by length, starting with the longest, and placed to maximize balance.
Returns two hashmaps and a vector:
    - The letter occupying every voxel on the surface of the cube
    - A list of voxels that are occupied by each word
    - The center of mass of the finished cube
"""
def Generate(words: set[str], priority: set[str]=set(), size: int = 3) -> tuple[dict[Vec, str], dict[str, list[Vec]], Vec]:
    size = max(3, size or 3)
    if sum(map(len, words | priority)) >= 6*size**2:
            #print(f"Lowerbound too small; restarting generation at size={size + 1}")
            return Generate(words, priority, size + 1)
    
    edge: int = size - 1
    center: Vec = (edge / 2, edge / 2, edge / 2)

    #what letter is occupying each voxel
    output: dict[Vec, str] = {}
    #the direction of each voxel holding letters to check for valid crossings
    dirs: VecSpace = {}    
    #maps words to the voxels that they occupy
    groups: dict[str, list[Vec]] = {}
    #hashmap of all surface voxel positions, including the corners
    grid: set[Vec] = set()
    #hashmap of corner voxel positions, which are blacklisted
    corners: set[Vec] = set()

    #populate grid; the 6 sides of the cube
    dim: range = range(size)
    for x in dim:
        for y in dim:
            grid.add((x, y, 0))
            grid.add((x, y, edge))
    for x in dim:
        for z in dim:
            grid.add((x, 0, z))
            grid.add((x, edge, z))
    for y in dim:
        for z in dim:
            grid.add((0, y, z))
            grid.add((edge, y, z))

    #populate corners
    corners.add((0, 0, 0))
    corners.add((0, 0, edge))
    corners.add((0, edge, 0))
    corners.add((0, edge, edge))
    corners.add((edge, 0, 0))
    corners.add((edge, 0, edge))
    corners.add((edge, edge, 0))
    corners.add((edge, edge, edge))

    """
    Given a valid position on the grid, returns the transformed position
    by moving in "dir" direction in "units" steps.
    This version should only be used to populate the lookup table; use FastTransform() otherwise.
    """
    def RecursiveTransform(pos: Vec, dir: Vec, units: int) -> tuple[Vec|None, Vec|None]:
       
        if units == 0: return pos, dir #base case; no more moves
        if pos not in grid: return None, None #base case; input position is invalid

        #recursive case; "units" is negative, normalize and invert the direction
        if units < 0: return RecursiveTransform(pos, VecNeg(dir), -units)

        next: Vec = VecAdd(pos, dir)
        if next in corners: return None, None #base case; corner positions are invalid

        #recursive case; move in a straight line
        if next in grid: return RecursiveTransform(next, dir, units - 1)

        #recursive case; turn around a corner
        for adj in Adjacents:
            if adj == dir or adj == VecNeg(dir): continue
            next = VecAdd(pos, adj)
            if next in grid and VecSub(pos, adj) not in grid: return RecursiveTransform(next, adj, units - 1)

        #base case; something went wrong
        return None, None

    #optimizations for Impose(); a preinitialized lookup table of all valid imposure areas

    #represents the output of Transform() in single units
    preStepsMap: dict[tuple[Vec|None, Vec|None], tuple[Vec|None, Vec|None]] = {}
    for p in grid:
        if p in corners: continue
        for d in Adjacents:
            preStepsMap[p, d] = RecursiveTransform(p, d, 1)

    """
    Given a valid position on the grid, returns the transformed position
    by moving in "dir" direction in "units" steps.
    """
    def FastTransform(pos: Vec|None, dir: Vec|None, units: int) -> tuple[Vec|None, Vec|None]:
        if pos is None or dir is None: return None, None
        if units == 0: return pos, dir
        if units < 0: return FastTransform(pos, VecNeg(dir), -units)
        while pos and dir and units > 0:
            units -= 1
            pos, dir = preStepsMap[pos, dir]
        return pos, dir

    #represents the output of Impose() at all possible lengths
    prePathsMap: dict[tuple[Vec|None, Vec|None], list[tuple[Vec|None, Vec|None]]] = {}
    maxlen: int = max(map(len, words))
    for p in grid:
        if p in corners: continue
        for d in Adjacents:
            cur: Vec | None = p
            cd: Vec | None = d
            seen: set[Vec] = set()
            out: list[tuple[Vec|None, Vec|None]] = []
            while len(out) < maxlen and cur is not None and cur not in seen:
                seen.add(cur); out.append((cur, cd))
                cur, cd = preStepsMap[cur, cd]
            prePathsMap[p, d] = out

    """
    Wraps the given word around the cube and returns its projection area and the direction of each voxel.
    Returns None if the word couldn't be wrapped, either because it's too long or the position is invalid.
    """
    def Impose(w: str, pos: Vec, dir: Vec) -> tuple[list[Vec]|None, VecSpace|None]:
        if pos in corners or pos not in grid: return None, None

        path: list[tuple[Vec|None, Vec|None]] = prePathsMap[pos, dir][:len(w)]
        if path == [None, None]: return None, None
        if len(path) != len(w): return None, None

        area: list[Vec] = [] #voxels that are occupied by the word
        vspace: VecSpace = {} #the direction that every voxel is facing
        for t in path:
            if t[0] and t[1]:
                area.append(t[0])
                vspace[t[0]] = t[1]

        return area, vspace

    """
    Checks if a word imposed at the given position and direction is valid.
    If it is, returns a tuple of the following:
        - Number of intersections with other words
        - List of voxels that the word is occupying
        - What direction each voxel is facing to connect characters
    Otherwise, returns all None.
    """
    def Check(w: str, pos: Vec, dir: Vec) -> tuple[int|None, list[Vec]|None, VecSpace|None]:

        area, vspace = Impose(w, pos, dir)
        if not (area and vspace): return None, None, None

        crosses: int = 0
        for i, at in enumerate(area):
            char: str = w[i]
            exists: str|None = output.get(at)

            if exists: #voxel is occupied, check for matching character
                if exists != char: return None, None, None
                if cdir := vspace.get(at):
                    #if sharing letters, cannot be parallel to existing words
                    if dirs.get(at) == cdir: return None, None, None
                    if dirs.get(at) == VecNeg(cdir): return None, None, None
                crosses += 1
                
            else: #voxel is not occupied; ensure there isn't any adjacent occupied voxels
                for adj in Adjacents:
                    adjPos, _ = FastTransform(at, adj, 1)
                    if adjPos in vspace: continue
                    if adjPos in output: return None, None, None

        #beginning and end of word cannot touch other words
        if FastTransform(pos, dir, -1)[0] in output: return None, None, None
        if FastTransform(pos, dir, len(w))[0] in output: return None, None, None

        return crosses, area, vspace

    """
    Writes the given word to output and dirs at the given position and direction.
    Will apply sanity checks to ensure validity of the placement.
    """
    def Place(w: str, pos: Vec, dir: Vec):
        area, vspace = Impose(w, pos, dir)
        assert area and vspace, f"Invalid Impose area for placement on {w}, {pos}, {dir}"
        group: list[Vec] = []
        for i, at in enumerate(area):
            char: str = w[i]
            existing: str|None = output.get(at)
            assert existing is None or existing == char, f"Placement collision on {w}, {pos}, {dir}"
            output[at] = char
            cdir: Vec|None = vspace.get(at)
            assert cdir, "cdir missing in vspace"
            dirs[at] = cdir
            group.append(at)
        groups[w] = group

    """
    Calculates the incremental CoM of the current position-sum and count-sum, plus a new imposure area.
    """
    def CandidateCoM(sp: Vec, sc: int, area: list[Vec]) -> Vec:
        if sc == 0: return 0, 0, 0
        np: Vec = sp
        nc: int = sc
        for v in area:
            if v not in output:
                np = VecAdd(np, v)
                nc += 1
        return np[0] / nc, np[1] / nc, np[2] / nc

    """
    Looks for the best spot to place a new word, by attempting to balance center of mass.
    Returns the position and direction to place it in if found, otherwise returns None.
    Setting "diverge" to true will instead find the least balancing location.
    """
    def BestPlacement(w: str, sp: Vec, sc: int, diverge: bool=False) -> tuple[Vec|None, Vec|None]:
        bestPos: Vec|None = None
        bestDir: Vec|None = None
        bestCoMDist: float = -cmath.inf if diverge else cmath.inf
        for pos in grid:
            if pos in corners: continue
            for dir in Adjacents:
                n, area, _ = Check(w, pos, dir)
                if n is None or area is None: continue
                CoMDisp: Vec = VecSub(CandidateCoM(sp, sc, area), center)
                CoMDistSq: float = VecDot(CoMDisp, CoMDisp)
                if CoMDistSq > bestCoMDist if diverge else CoMDistSq < bestCoMDist:
                    bestCoMDist = CoMDistSq
                    bestPos = pos
                    bestDir = dir

        return bestPos, bestDir

    #keep track of CoM accumulated to use in all future placements
    sp: Vec = (0, 0, 0)
    sc: int = 0

    #priority words are placed first, in a way that maximizes *imbalance*
    for w in priority:
        pos, dir = BestPlacement(w, sp, sc, True)
        if pos and dir:
            Place(w, pos, dir)
            sp = VecAdd(sp, pos)
            sc += 1
        else:
            print(f"Couldn't fit all priority words; restarting generation at size={size + 1}")
            return Generate(words, priority, size + 1)

    #for every other word, place the longest words first and try to increase balance
    ordered: list = list(words)
    ordered.sort(key=len, reverse=True)
    for w in ordered:
        if w in priority: continue
        pos, dir = BestPlacement(w, sp, sc)
        if pos and dir: Place(w, pos, dir)
        else:
            print(f"Couldn't fit all words; restarting generation at size={size + 1}")
            return Generate(words, priority, size + 1)

    return output, groups, CoM(output)

#everything below is for interoperability with Pyodide

class Input(typing.TypedDict):
    Words: list[str]
    Priority: list[str]
    Size: int

class Output(typing.TypedDict):
    Voxels: list[tuple[float, float, float, str]]
    Words: dict[str, list[Vec]] #maps words to their voxels
    CoM: Vec

def GenerateJSON(i: Input) -> Output:
    voxels, words, CoM = Generate(set(i["Words"]), set(i["Priority"]), i["Size"])
    return {
        "Voxels": [[p[0], p[1], p[2], c] for p, c in voxels.items()],
        "Words": words,
        "CoM": [CoM[0], CoM[1], CoM[2]]
    }

GenerateJSON(PUZZLE_CONFIG)
