import type { MascotSpriteProps } from "../mascot-sprite";

/**
 * Renderer (a): the engineer drawn as a hand-coded pixel grid.
 *
 * Every pixel is in this file, so there is no asset to produce and nothing
 * blocks. The trade is likeness — this is a stylised engineer in a headset,
 * not a portrait. Swapping to a sprite sheet or a hybrid is one import in
 * ../index.tsx; nothing else in the mascot knows or cares which one is mounted.
 *
 * The grid deliberately has no eyes or mouth in it. Those are drawn separately
 * so gaze can move the pupils, blink can close the lids, and the talk poses can
 * change the mouth without needing a whole alternate grid per frame.
 */

const PALETTE: Record<string, string | null> = {
  "0": null, // transparent
  "1": "#241611", // hair
  "2": "#C1834F", // skin
  "3": "#8A5732", // skin, shaded
  "4": "#2A3350", // headphone shell
  "5": "#E1112C", // headphone accent — brand red
  "8": "#16203C", // team kit
  "9": "#8894B0", // mic boom
};

/** 16x16. Skin fills the eye and mouth areas; those are overlaid below. */
const GRID = [
  "0000011111100000",
  "0001111111111000",
  "0011111111111100",
  "0011111111111100",
  "0411122222211140",
  "0411222222222140",
  "0451222222221540",
  "0451222222221540",
  "0411222222221140",
  "0011222222221100",
  "0011122222211100",
  "0000112222110000",
  "0000009990000000",
  "0000888888880000",
  "0088888888888800",
  "0888888888888880",
];

/** Top-left of each 2x2 eye socket, in grid units. */
const EYES = [
  { x: 5, y: 6 },
  { x: 9, y: 6 },
];

const MOUTH = { x: 7, y: 9, w: 2 };

export function SvgPixelMascot({
  pose,
  gaze,
  size,
  still,
  className,
}: MascotSpriteProps) {
  const blinking = pose === "blink";
  const talking = pose === "talk-a" || pose === "talk-b";

  // Kept well under a pixel: the eye socket is only two wide, so a full-pixel
  // shift would put the pupil outside the white and read as a squint.
  const pupilDx = gaze.x * 0.45;
  const pupilDy = gaze.y * 0.3;

  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      aria-hidden="true"
      // Without this the browser antialiases every pixel edge and the whole
      // thing turns to mush at small sizes.
      shapeRendering="crispEdges"
      className={className}
    >
      {GRID.map((row, y) =>
        row.split("").map((key, x) => {
          const fill = PALETTE[key];
          if (!fill) return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={fill}
            />
          );
        })
      )}

      {EYES.map((eye, index) =>
        blinking ? (
          // Closed: a single shaded line where the lids meet.
          <rect
            key={index}
            x={eye.x}
            y={eye.y + 1}
            width={2}
            height={0.5}
            fill={PALETTE["3"] as string}
          />
        ) : (
          <g key={index}>
            <rect
              x={eye.x}
              y={eye.y}
              width={2}
              height={1.5}
              fill="#F2F5FA"
            />
            <rect
              x={eye.x + 0.4 + pupilDx}
              y={eye.y + 0.3 + pupilDy}
              width={0.9}
              height={0.9}
              fill="#1B1410"
            />
          </g>
        )
      )}

      {/* Mouth. Open on the talk-b frame, so alternating the two poses reads
          as speech rather than as a twitch. */}
      <rect
        x={MOUTH.x}
        y={MOUTH.y}
        width={MOUTH.w}
        height={talking && pose === "talk-b" ? 1.1 : 0.5}
        fill={PALETTE["3"] as string}
      />

      {/* Headset mic, and the live dot on it while transmitting. */}
      <rect x={11} y={9} width={1} height={0.6} fill={PALETTE["9"] as string} />
      {talking && !still && (
        <rect x={12} y={9} width={0.8} height={0.6} fill={PALETTE["5"] as string} />
      )}
    </svg>
  );
}
