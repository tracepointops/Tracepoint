import * as RadixColors from '@radix-ui/colors';
import { GRAY_SCALE_LIGHT } from './GrayScaleLight';

export const MAIN_COLORS_LIGHT = {
  // Grays
  gray: GRAY_SCALE_LIGHT.gray7,

  // Reds
  tomato: RadixColors.tomatoP3.tomato9,
  red: RadixColors.redP3.red9,
  ruby: RadixColors.rubyP3.ruby9,
  crimson: RadixColors.crimsonP3.crimson9,

  // Pinks & Purples
  pink: RadixColors.pinkP3.pink9,
  plum: RadixColors.plumP3.plum9,
  purple: RadixColors.purpleP3.purple9,
  violet: RadixColors.violetP3.violet9,
  iris: RadixColors.irisP3.iris9,

  // Cyans & Blues
  cyan: RadixColors.cyanP3.cyan9,
  turquoise: RadixColors.tealP3.teal9,
  sky: RadixColors.skyP3.sky9,
  blue: RadixColors.indigoP3.indigo9,

  // Greens
  jade: RadixColors.jadeP3.jade9,
  green: RadixColors.greenP3.green9,
  grass: RadixColors.grassP3.grass9,
  mint: RadixColors.mintP3.mint9,
  lime: RadixColors.limeP3.lime9,

  // Oranges & Yellows
  bronze: RadixColors.bronzeP3.bronze9,
  gold: RadixColors.goldP3.gold9,
  brown: RadixColors.brownP3.brown9,
  orange: RadixColors.orangeP3.orange9,
  amber: RadixColors.amberP3.amber9,
  yellow: RadixColors.yellowP3.yellow9,

  // TracePoint Custom Colors (Light Mode) - Using closest Radix matches
  tracepointBlue: RadixColors.blueP3.blue9, // Close to #116ed0 - Primary actions
  tracepointGrey: RadixColors.slateP3.slate11, // Close to #677285 - Secondary text
  tracepointGreen: RadixColors.tealP3.teal9, // Close to #2e7f74 - Success states
  tracepointRed: RadixColors.tomatoP3.tomato9, // Close to #d52536 - Errors
  tracepointAmber: RadixColors.orangeP3.orange10, // Close to #b85504 - Warnings
  tracepointBackground: RadixColors.slateP3.slate1, // Light background
  tracepointBlack: 'color(display-p3 0 0 0)', // True black #000000 in P3 color space
};
