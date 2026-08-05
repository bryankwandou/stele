import React from "react";
import { Composition } from "remotion";
import { Peluncuran } from "./Peluncuran";
import { FPS, TOTAL } from "./teater";

export const Root: React.FC = () => (
  <>
    <Composition
      id="Peluncuran"
      component={Peluncuran}
      durationInFrames={TOTAL}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);
