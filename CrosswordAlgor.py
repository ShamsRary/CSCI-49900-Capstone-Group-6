import cmath, typing

Vec = tuple[float, float, float]
VecHash = dict[Vec, bool]
VecSpace = dict[Vec, Vec]

Adjacents: VecHash = {
    (0, 0, -1): True, (0, 0, 1): True,
    (0, -1, 0): True, (0, 1, 0): True,
    (-1, 0, 0): True, (1, 0, 0): True,
}

def VecAdd(a: Vec, b: Vec) -> Vec:
    return a[0] + b[0], a[1] + b[1], a[2] + b[2]

def VecSub(a: Vec, b: Vec) -> Vec:
    return a[0] - b[0], a[1] - b[1], a[2] - b[2]

def VecNeg(a: Vec) -> Vec:
    return -a[0], -a[1], -a[2]

def VecDot(a: Vec, b: Vec) -> float:
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]

def CoM(hash: dict[Vec, typing.Any], add: list[Vec] | None) -> Vec:
    x, y, z = 0, 0, 0
    c: int = 0
    for pos in hash:
        x += pos[0]
        y += pos[1]
        z += pos[2]
        c += 1
    if add:
        for pos in add:
            if not hash.get(pos):
                x += pos[0]
                y += pos[1]
                z += pos[2]
                c += 1
    return (x / c, y / c, z / c)

def Generate(words: list[str], size: int = 3) -> tuple[dict[Vec, str], list[list[Vec]]]:
    size = max(3, size or 3)
    edge: int = size - 1
    center: Vec = (edge / 2, edge / 2, edge / 2)

    #what direction the occupying letter is extending towards to form words
    dirs: dict[Vec, Vec] = {}
    #what letter is occupying each voxel
    output: dict[Vec, str] = {}
    #collections of voxels that form words; index matches "words" param
    groups: list[list[Vec]] = []
    #hashmap of all surface voxel positions, including the corners
    grid: VecHash = {}
    #hashmap of corner voxel positions, which are blacklisted
    corners: VecHash = {}

    #populate grid
    dim: range = range(size)
    for x in dim:
        for y in dim:
            grid[x, y, 0] = True
            grid[x, y, edge] = True
    for x in dim:
        for z in dim:
            grid[x, 0, z] = True
            grid[x, edge, z] = True
    for y in dim:
        for z in dim:
            grid[0, y, z] = True
            grid[edge, y, z] = True

    #populate corners
    corners[0, 0, 0] = True
    corners[0, 0, edge] = True
    corners[0, edge, 0] = True
    corners[0, edge, edge] = True
    corners[edge, 0, 0] = True
    corners[edge, 0, edge] = True
    corners[edge, edge, 0] = True
    corners[edge, edge, edge] = True

    """
    	Given a valid position on the grid, returns the transformed position by
		moving in "dir" direction in "units" steps.
    """
    def Transform(pos: Vec, dir: Vec, units: int) -> tuple[Vec|None, Vec|None]:
        #if "units" is negative, we need to reverse the direction
        if units < 0:
            dir = VecNeg(dir)

        at: Vec = pos #pointer to the current position in this algorithm
        for _ in range(abs(units)):
            next: Vec = VecAdd(at, dir)
            if corners.get(next): return None, None

            if not grid.get(next):
                #to rotate the direction, we look for a valid adjacent voxel
                for adj in Adjacents:
                    if adj == dir or adj == VecNeg(dir): continue
                    if grid.get(VecAdd(at, adj)) and not grid.get(VecSub(at, adj)):
                        dir = adj
                        break
                next = VecAdd(at, dir)

            if not grid.get(next): return None, None
            at = next

        return at, dir

    """
    	Wraps the given word around the cube and returns its projection area
		and the direction of each voxel.
		The index of the returned table matches the index of its character.
        Returns None if the word couldn't be wrapped.
    """
    def Impose(w: str, pos: Vec, dir: Vec) -> tuple[list[Vec]|None, VecSpace|None]:
        if corners.get(pos) or not grid.get(pos): return None, None
        area: list[Vec] = []
        vspace: VecSpace = {}
        for i, c in enumerate(w):
            at, newDir = Transform(pos, dir, i)
            if not (at and newDir): return None, None
            if vspace.get(at): return None, None #the world looped back and reached itself
            vspace[at] = newDir
            area.append(at)
        return area, vspace

    """
    	An extension of impose().
		Checks if a word imposed at the given position and direction is valid.
		If it is, returns the number of intersections that it would make.
		Otherwise, returns None.
    """
    def Crossings(w: str, pos: Vec, dir: Vec) -> tuple[int|None, list[Vec]|None, VecSpace|None]:
        area, vspace = Impose(w, pos, dir)
        if not (area and vspace): return None, None, None

        crosses: int = 0
        for i, at in enumerate(area):
            char: str = w[i]
            exists: str|None = output.get(at)
            if exists:
                if exists != char: return None, None, None
                cdir: Vec|None = vspace.get(at)
                if cdir:
                    if dirs.get(at) == cdir: return None, None, None
                    if dirs.get(at) == VecNeg(cdir): return None, None, None
                crosses += 1
        return crosses, area, vspace

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
            assert cdir, "cdir missing in vpsace"
            dirs[at] = cdir
            group.append(at)
        groups.append(group)

    def BestPlacement(w: str) -> tuple[Vec|None, Vec|None]:
        bestPos: Vec|None = None
        bestDir: Vec|None = None
        bestCoMDist: float = cmath.inf
        for ePos, eChar in output.items():
            for i, char in enumerate(w):
                if char != eChar: continue
                for dir in Adjacents:
                    pos, _ = Transform(ePos, dir, -i)
                    if not pos: continue
                    n, area, _ = Crossings(w, pos, dir)
                    if not (n and area): continue
                    CoMDisp: Vec = VecSub(CoM(output, area), center)
                    ComDistSq: float = VecDot(CoMDisp, CoMDisp)
                    if ComDistSq < bestCoMDist:
                        bestCoMDist = ComDistSq
                        bestPos = pos
                        bestDir = dir

        if bestPos and bestDir: return bestPos, bestDir

        #if no valid crossing can be determined, just look for empty spot
        for pos in grid:
            if corners.get(pos): continue
            if output.get(pos): continue
            for dir in Adjacents:
                area, _ = Impose(w, pos, dir)
                if area:
                    fit: bool = True
                    for spot in area:
                        if output.get(spot):
                            fit = False
                            break
                    if fit: return pos, dir

        print(f"Unable to find placement for {w}")
        return None, None

    words.sort(key=len)
    if Impose(words[-1], (0, 1, 1), (0, 0, 1)) == (None, None): 
        print(f"Couldn't fit starting word; restarting generation at size={size + 1}")
        return Generate(words, size + 1)
    Place(words[-1], (0, 1, 1), (0, 0, 1))
    del words[-1]

    placementFailed: bool = False
    for i in reversed(words):
        print(f"Attempting to place {i}")
        pos, dir = BestPlacement(i)
        if pos and dir: Place(i, pos, dir)
        else:
            placementFailed = True
            break

    if placementFailed:
        print(f"Couldn't fit all words; restarting generation at size={size + 1}")
        return Generate(words, size + 1)     

    return output, groups

#Testing

output, groups = Generate(["SPECTACULAR","MAGNIFICENT","EXTRAORDINARY","INCREDIBLE","ASTONISHING","BREATHTAKING","UNBELIEVABLE","COMPLICATED","INTERESTING","UNDERSTANDING","COMMUNICATION","DEVELOPMENT","ENVIRONMENT","EXPERIENCE","GOVERNMENT","INFORMATION","KNOWLEDGEABLE","PARTICULARLY","RESPONSIBILITY","SIGNIFICANT"])

for pos, char in output.items():
    print(f"[Vector3.new{repr(pos)}] = '{char}',")