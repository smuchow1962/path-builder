## Path-Builder
---
Take an indented tree decription and generate paths for each item.
For example, a path description file with the following layout:  

    basedir1
        dir1
        dir2
            *filescanbecreated.txt
            *README.md
               *oktoforwardindentforfiles.txt
    basedir2
        dir1
        dir2
    *fileatbaselevel.txt

generates  

    ./basedir1/
    ./basedir1/dir1/
    ./basedir1/dir2/
    ./basedir1/dir2/filescanbecreated.txt
    ./basedir1/dir2/README.md
    ./basedir1/dir2/filescanbecreated.txt
    ./basedir1/dir2/oktoforwardindentforfiles.txt
    ./basedir2/
    ./basedir2/di1/
    ./basedir2/dir2/
    ./fileatbaselevel.txt

The default generator produces POSIX pathnames but options are available to define a prefix and separator for each line.


    >echo pathBuilder.generateLines(inputString,{prefix:'c:\\', separator:'\\'})
    ...
    ...
    c:\\windows\style\dir\output\
    ...
    ...

The algorithm does not use recursion.

### Usage:
Path-Builder has no dependencides. Install it using npm  

>npm install path-builder [--save|--dev-save]

add to code:

```
var pathBuilder = require('./path-builder');
var string = 'directory structure data using indents';
var pathArray = pathBuilder(string);
console.dir(pathArray);  
```


### API  
>var pathArray = pathBuilder(stringToParse [,options]);  

#### Parameters:  
_**stringToParse:**_  A newline separated string describing a directory tree using indents. Indenting may be all spaces
or all tabs. A mixture of tabs and spaces is undefined.  

- text prepended with the `*` symbol is treated as a file name rather than a path.  
- space-indent layout makes a best-guess approximation of the indenting style by counting the number of spaces in the
first indented line encountered. All indents going deeper use this spacing to determine nesting level.  
- Nesting levels for directories can never be more than one level deeper relative to the current depth, regardless of
the number of indents assigned. Indenting a line by 24 spaces on a 4-space indent size will only
act as if it was indented by 4 spaces (1 level deeper).  
- Nesting for files is similar to directories. A file indented the same as a directory places the file at the same level
as the directory.  

_**options:**_ An optional object may be passed that alters certain aspects of the formatted output.  

- `prefix: string`  - precedes the first part of the derived path. The default is `{prefix: './'}`  
- `separator: string` - the separator between each sub-path. The default is `{separator: '/'}`. A separator always trails the last
directory. Files never add a training separator.  

#### Return:
  an array of tree items expressed as paths. Each line uses the defined prefix and spearator items to generate the line.

#### Assumptions:
  - a line with a mixture of tabs and spaces produces an undefined output.  
  - the default options parameter is `{prefix: './', separator: '/'}`  


### License
MIT
