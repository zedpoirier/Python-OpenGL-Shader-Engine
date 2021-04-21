import re
from os.path import join, abspath, dirname, basename

def load_source( folder: str, filename: str):
    path = abspath( join(folder, filename) )

    source = ""

    lines = open( path ).readlines()
    for line in lines:
        if match := re.search(r'#include\s*["|<](.*.[glsl|hlsl|metal])["|>]' ,line, re.IGNORECASE):
            new_folder = join(folder, dirname( match.group(1) ))
            new_dep = basename( match.group(1) )
            source += load_source(new_folder, new_dep)
        else:
            source += line

    return source