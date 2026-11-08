import type { Style } from '../cover.ts';
import { cloth, marble, print60, series } from './bindings.ts';
import { avant, bauhaus, memphis, nordic, opart, swiss } from './graphic.ts';
import { arch, curves, guilloche, tiling, topo } from './math.ts';
import { ornament } from './ornament.ts';
import { antique, deco, east, girih, manuscript, nouveau, space, typewriter } from './period.ts';

export const STYLES: Style[] = [
  cloth, marble, series, print60, ornament,
  avant, bauhaus, swiss, memphis, opart, nordic,
  deco, nouveau, antique, manuscript, east, girih, typewriter, space,
  guilloche, tiling, curves, topo, arch,
];
