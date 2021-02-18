# spritesheet

[![test](https://github.com/SolalDR/spritesheet/workflows/test/badge.svg?branch=master)](https://github.com/SolalDR/spritesheet/actions?workflow=test)
[![build](https://github.com/SolalDR/spritesheet/workflows/build/badge.svg?branch=master)](https://github.com/SolalDR/spritesheet/actions?workflow=build)
[![version](https://img.shields.io/github/package-json/v/SolalDR/spritesheet)](https://github.com/SolalDR/spritesheet)

## CLI

Basic use : 
```
spritesheet generate --dir ./myimagesdir --w 4096 --c.w 512 --c.h 512 --o walk
```

| option                                                 |type  | description                                |default|
|--------------------------------------------------------|------|--------------------------------------------|-----------
| `--spritesheet.width`, `--s.width`, `--w`, `--width`   |number| Width of the output spritesheet file       |`2048`
| `--spritesheet.width`, `--s.height`, `--h`, `--height` |number| Height of the output spritesheet file      |`2048`
| `--chunk.width`, `--c.width`                           |number| Width of a single chunk                    |`auto` (spread amoung disponible space)
| `--chunk.height`, `--c.height`                         |number| Height of a single chunk                   |`auto` (spread amoung disponible space)
| `--chunk.flex`, `--c.flex`                             |number| Resize factor of a chunk                   |`auto` (spread amoung disponible space)
| `--output.name`, `--o.name`                            |string| Output name of the spritesheet             |`spritesheet`
| `--output.dir`, `--o.dir`                              |string| Output directory of the spritesheet        |`./`
| `--dir`                                                |string| Path to parent directory of target images  |

## Docs

### Input
The input config describle the way images set will be inported.

### Spritesheet config 
The spritesheet config describe the way the output sprite map will be generated.

#### `--width`, `--spritesheet.width`, `--s.width`, `--w`, `--s.w`, `--spritesheet.w`
Represent the width(px) of the output spritesheet. If `width` is undefined, `width` will be equal to `2048px`<br>
Notice: A power of two is recommanded

#### `--s.height`, `--spritesheet.height`, `--height`, `--h`, `--s.h`, `--spritesheet.h`
Represent the height(px) of the output spritesheet. If `height` is undefined, `height` will be equal to the `width` value<br>
Notice: A power of two is recommanded
#### --multiple (TODO)
If present, this attribute allows multiples spritesheets to be created if there is no space left. 
A typical example is when a chunk width is forced and all item cannots fit inside the spritesheet, instead of trigger an error, it will create a second spritesheet.

### Chunk config
Each image passed as an input in the CLI create a single chunk. A chunk is defined by the following properties: `width`, `height`, `x`, `y`

#### `--chunk.width`, `--c.width`, `--chunk.w`, `--c.w`
Represent the width of a chunk. If this parameter is undefined, the computed width will be constrained by the spritesheet dimensions. 
For instance, if a spritesheet has dimensions `2048x2048`, However the number of chunks, they will be resized automatically to fit inside this dimensions. See `--flexibility` option for more informations.

#### `--chunk.height`, `--c.height`, `--chunk.h`, `--c.h`
Represent the height of a chunk. See chunk.width behavior

#### `--flexibility`, `--chunk.flexibility` (TODO)
The capacity of a chunk to resize in order to fit inside spritesheet dimensions. The parameter is ranged between 0 and 1. 
Example: If `--flexibility 0.5` a chunk will be able to resize down, up to 50% of his width
By default:
- If `chunk.width` or `chunk.height` id defined, `flexibility` will be equal to `0` The chunks will not resize 
- If neither `chunk.width` or `chunk.height` is defined, `flexibility` will be equal to `1` The chunks will resize to fit inside the spritesheet



## How to contribute

Install dependencies

```
npm install
```

Install and init `commitizen`

```bash
npm install commitizen -g
```

```bash
commitizen init cz-conventional-changelog --save-dev --save-exact
```

```
npm run dev
```

Commit your work
```
npm run commit
```

## License

[MIT](LICENSE).
